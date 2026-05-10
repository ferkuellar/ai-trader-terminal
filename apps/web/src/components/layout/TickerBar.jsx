import { useEffect, useMemo, useState } from "react";

const marketPairs = [
  { symbol: "BTCUSDT", label: "BTC" },
  { symbol: "ETHUSDT", label: "ETH" },
  { symbol: "SOLUSDT", label: "SOL" },
  { symbol: "BNBUSDT", label: "BNB" },
  { symbol: "XRPUSDT", label: "XRP" },
  { symbol: "ADAUSDT", label: "ADA" },
  { symbol: "DOGEUSDT", label: "DOGE" },
  { symbol: "AVAXUSDT", label: "AVAX" },
  { symbol: "LINKUSDT", label: "LINK" },
  { symbol: "TRXUSDT", label: "TRX" },
  { symbol: "TONUSDT", label: "TON" },
  { symbol: "DOTUSDT", label: "DOT" },
  { symbol: "LTCUSDT", label: "LTC" },
  { symbol: "BCHUSDT", label: "BCH" },
  { symbol: "UNIUSDT", label: "UNI" },
  { symbol: "NEARUSDT", label: "NEAR" },
  { symbol: "APTUSDT", label: "APT" },
  { symbol: "ICPUSDT", label: "ICP" },
  { symbol: "ETCUSDT", label: "ETC" },
  { symbol: "FILUSDT", label: "FIL" },
  { symbol: "ATOMUSDT", label: "ATOM" },
  { symbol: "XLMUSDT", label: "XLM" },
  { symbol: "HBARUSDT", label: "HBAR" },
  { symbol: "ARBUSDT", label: "ARB" },
  { symbol: "OPUSDT", label: "OP" },
  { symbol: "VETUSDT", label: "VET" },
  { symbol: "INJUSDT", label: "INJ" },
  { symbol: "SUIUSDT", label: "SUI" },
  { symbol: "POLUSDT", label: "POL" },
  { symbol: "RENDERUSDT", label: "RENDER" },
  { symbol: "AAVEUSDT", label: "AAVE" },
  { symbol: "GRTUSDT", label: "GRT" },
  { symbol: "ALGOUSDT", label: "ALGO" },
  { symbol: "MKRUSDT", label: "MKR" },
  { symbol: "QNTUSDT", label: "QNT" },
  { symbol: "EGLDUSDT", label: "EGLD" },
  { symbol: "STXUSDT", label: "STX" },
  { symbol: "RUNEUSDT", label: "RUNE" },
  { symbol: "SANDUSDT", label: "SAND" },
  { symbol: "MANAUSDT", label: "MANA" },
  { symbol: "AXSUSDT", label: "AXS" },
  { symbol: "APEUSDT", label: "APE" },
  { symbol: "GALAUSDT", label: "GALA" },
  { symbol: "CHZUSDT", label: "CHZ" },
  { symbol: "DYDXUSDT", label: "DYDX" },
  { symbol: "SNXUSDT", label: "SNX" },
  { symbol: "CRVUSDT", label: "CRV" },
  { symbol: "COMPUSDT", label: "COMP" },
  { symbol: "LDOUSDT", label: "LDO" },
  { symbol: "FETUSDT", label: "FET" },
];

const initialTicker = Object.fromEntries(marketPairs.map((pair) => [pair.symbol, { price: undefined, change: undefined }]));

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  if (number >= 1000) return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (number >= 1) return number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return number.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function formatChange(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0.00";
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

export default function TickerBar() {
  const [ticker, setTicker] = useState(initialTicker);
  const [, setIsLive] = useState(false);

  const streams = useMemo(() => marketPairs.map((pair) => `${pair.symbol.toLowerCase()}@ticker`).join("/"), []);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let closedByComponent = false;

    const loadSnapshot = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        if (!response.ok) return;
        const payload = await response.json();
        const enabledSymbols = new Set(marketPairs.map((pair) => pair.symbol));
        setTicker((current) => {
          const next = { ...current };
          payload.forEach((item) => {
            if (!enabledSymbols.has(item.symbol)) return;
            next[item.symbol] = {
              price: item.lastPrice,
              change: item.priceChangePercent,
            };
          });
          return next;
        });
      } catch {
        setIsLive(false);
      }
    };

    const connect = () => {
      socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      socket.onopen = () => {
        setIsLive(true);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const data = message.data;
        if (!data?.s) return;
        setTicker((current) => ({
          ...current,
          [data.s]: {
            price: data.c,
            change: data.P,
          },
        }));
      };

      socket.onerror = () => {
        setIsLive(false);
      };

      socket.onclose = () => {
        setIsLive(false);
        if (!closedByComponent) {
          reconnectTimer = window.setTimeout(connect, 4000);
        }
      };
    };

    loadSnapshot();
    connect();

    return () => {
      closedByComponent = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [streams]);

  const tickerItems = marketPairs.map((pair) => ({
    ...pair,
    price: ticker[pair.symbol]?.price,
    change: ticker[pair.symbol]?.change,
  }));

  return (
    <div className="relative overflow-hidden border-b border-cockpit-border bg-cockpit-bg2/95 text-xs text-cockpit-dim">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cockpit-bg2 to-cockpit-bg2/0" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cockpit-bg2 to-cockpit-bg2/0" />
      <div className="flex min-h-9 items-center gap-8 whitespace-nowrap">
        <div className="ticker-marquee flex min-w-max items-center gap-10">
          {[...tickerItems, ...tickerItems].map((item, index) => {
            const change = Number(item.change);
            const positive = change >= 0;
            return (
              <span key={`${item.symbol}-${index}`} className="flex items-center gap-2">
                <span className="font-semibold tracking-[0.05em] text-cockpit-text">{item.label}</span>
                <span>${formatPrice(item.price)}</span>
                <span className={positive ? "text-cockpit-green" : "text-cockpit-red"}>
                  {positive ? "▲" : "▼"}
                  {formatChange(item.change)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

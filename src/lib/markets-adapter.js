const SUPPLY_BY_SYMBOL = {
  BTC: 19700000,
  ETH: 120100000,
  BNB: 153850000,
  SOL: 448000000,
  XRP: 55800000000,
  ADA: 35600000000,
  AVAX: 407000000,
  LINK: 587000000,
  DOT: 1450000000,
  MATIC: 9300000000,
  NEAR: 1090000000,
  ATOM: 390000000,
  ARB: 2650000000,
  OP: 1080000000,
  INJ: 97700000,
  SUI: 2420000000,
  APT: 435000000,
  LTC: 74400000,
  TRX: 87700000000,
  DOGE: 144000000000,
};

export function baseFromPair(pair = "") {
  return pair.replace("USDT", "");
}

export function normalizeMarketRow({ ticker, klines = [], rank }) {
  const pair = ticker?.symbol || "";
  const symbol = baseFromPair(pair);
  const price = Number(ticker?.lastPrice);
  const firstHour = klines[0];
  const firstSevenDay = klines[0];
  const lastSevenDay = klines[klines.length - 1];
  const change1hPct = firstHour?.open
    ? ((price - firstHour.open) / firstHour.open) * 100
    : null;
  const change7dPct = firstSevenDay?.open && lastSevenDay?.close
    ? ((lastSevenDay.close - firstSevenDay.open) / firstSevenDay.open) * 100
    : null;
  const circulatingSupply = SUPPLY_BY_SYMBOL[symbol] || null;
  const marketCap = circulatingSupply && Number.isFinite(price)
    ? circulatingSupply * price
    : null;

  return {
    rank,
    symbol,
    pair,
    name: symbol,
    price,
    change1hPct,
    change24hPct: Number(ticker?.priceChangePercent),
    change7dPct,
    marketCap,
    volume24h: Number(ticker?.quoteVolume),
    circulatingSupply,
    supplySymbol: symbol,
    sparkline7d: klines.map(item => item.close).filter(Number.isFinite),
    source: "Binance public market data",
  };
}

export async function fetchBinanceMarketRows(symbols) {
  const tickerUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
  const tickerResponse = await fetch(tickerUrl);
  if (!tickerResponse.ok) throw new Error("Unable to load Binance tickers");
  const tickers = await tickerResponse.json();

  const klinePairs = await Promise.all(
    symbols.map(async (symbol) => {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=7`;
      const response = await fetch(url);
      if (!response.ok) return [symbol, []];
      const raw = await response.json();
      return [
        symbol,
        raw.map(item => ({
          time: item[0],
          open: Number(item[1]),
          close: Number(item[4]),
        })),
      ];
    })
  );

  const klinesBySymbol = Object.fromEntries(klinePairs);
  return tickers
    .map((ticker, index) => normalizeMarketRow({
      ticker,
      klines: klinesBySymbol[ticker.symbol] || [],
      rank: index + 1,
    }))
    .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

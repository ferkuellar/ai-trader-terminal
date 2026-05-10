const STREAM_BASE_URL = "wss://stream.binance.com:9443/stream";

function normalizeSymbols(symbols = []) {
  return [...new Set(symbols.map(symbol => String(symbol).trim().toUpperCase()).filter(Boolean))];
}

function normalizeTicker(payload) {
  const price = Number(payload.c);

  return {
    symbol: payload.s,
    price,
    priceChange24h: Number(payload.p),
    change24hPct: Number(payload.P),
    high24h: Number(payload.h),
    low24h: Number(payload.l),
    volume24h: Number(payload.v),
    quoteVolume24h: Number(payload.q),
    eventTime: Number(payload.E),
    source: "binance_public_ws",
  };
}

function buildStreamUrl(symbols) {
  const streams = normalizeSymbols(symbols)
    .map(symbol => `${symbol.toLowerCase()}@ticker`)
    .join("/");
  return `${STREAM_BASE_URL}?streams=${streams}`;
}

export function createBinanceTickerStream({
  symbols = [],
  onTicker,
  onOpen,
  onClose,
  onError,
  onStatusChange,
  reconnect = true,
  reconnectDelayMs = 1500,
}) {
  const expectedSymbols = new Set(normalizeSymbols(symbols));
  let socket = null;
  let closedManually = false;
  let reconnectTimer = null;
  let currentReconnectDelay = reconnectDelayMs;

  const setStatus = (status) => {
    try {
      onStatusChange?.(status);
    } catch {
      // Consumers should never break the stream lifecycle.
    }
  };

  const cleanupTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    if (!expectedSymbols.size || typeof WebSocket === "undefined") {
      setStatus("error");
      return;
    }

    cleanupTimer();
    setStatus(socket ? "reconnecting" : "connecting");

    try {
      socket = new WebSocket(buildStreamUrl([...expectedSymbols]));
    } catch (error) {
      setStatus("error");
      onError?.(error);
      return;
    }

    socket.onopen = (event) => {
      currentReconnectDelay = reconnectDelayMs;
      setStatus("connected");
      onOpen?.(event);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const payload = message.data || message;
        if (!payload?.s || !expectedSymbols.has(payload.s)) return;
        onTicker?.(normalizeTicker(payload));
      } catch (error) {
        onError?.(error);
      }
    };

    socket.onerror = (event) => {
      setStatus("error");
      onError?.(event);
    };

    socket.onclose = (event) => {
      onClose?.(event);
      socket = null;

      if (closedManually || !reconnect) {
        setStatus("disconnected");
        return;
      }

      setStatus("reconnecting");
      reconnectTimer = setTimeout(() => {
        currentReconnectDelay = Math.min(15000, Math.round(currentReconnectDelay * 1.5));
        connect();
      }, currentReconnectDelay);
    };
  };

  connect();

  return {
    close() {
      closedManually = true;
      cleanupTimer();
      if (socket) {
        socket.close();
        socket = null;
      }
      setStatus("disconnected");
    },
    reconnect() {
      closedManually = false;
      cleanupTimer();
      if (socket) {
        socket.close();
        socket = null;
      }
      connect();
    },
  };
}

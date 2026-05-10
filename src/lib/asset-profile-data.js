const TIMEFRAMES = ["1H", "24H", "7D", "30D", "90D"];

function makeChartData(base, drift = 1) {
  const pointsByFrame = { "1H": 24, "24H": 48, "7D": 56, "30D": 60, "90D": 72 };
  return Object.fromEntries(TIMEFRAMES.map((frame) => {
    const count = pointsByFrame[frame];
    const data = Array.from({ length: count }, (_, index) => {
      const wave = Math.sin(index / 3) * base * 0.012;
      const trend = (index - count / 2) * base * 0.0009 * drift;
      const micro = Math.cos(index / 5) * base * 0.006;
      return {
        label: `${index + 1}`,
        value: Math.max(0.0001, base + wave + trend + micro),
      };
    });
    return [frame, data];
  }));
}

function sentiment(seed, label = "Greed") {
  const bullishPct = Math.max(35, Math.min(82, seed));
  const bearishPct = 100 - bullishPct;
  return {
    bullishPct,
    bearishPct,
    socialScore: bullishPct + 4,
    fearGreedLabel: label,
    sample: true,
    sentimentTrend: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
      const bullish = Math.max(25, Math.min(85, bullishPct + Math.round(Math.sin(index) * 5)));
      return { label: day, bullish, bearish: 100 - bullish };
    }),
  };
}

const profile = ({
  symbol,
  pair,
  name,
  website,
  whitepaper = null,
  socials = {},
  explorers = [],
  wallets = [],
  ucid = null,
  basePrice,
  marketDetails,
  sentimentScore,
  sentimentLabel,
}) => ({
  symbol,
  pair,
  name,
  website,
  whitepaper,
  socials,
  certikRating: { label: "N/A", score: null, url: null },
  explorers,
  wallets,
  ucid,
  marketDetails,
  sentiment: sentiment(sentimentScore, sentimentLabel),
  chartData: makeChartData(basePrice, sentimentScore >= 55 ? 1 : -1),
  dataSourceNote: "Sample profile data. Binance does not provide token profile, CertiK rating, UCID, FDV or supply profile fields directly.",
});

export const ASSET_PROFILES = {
  BTC: profile({
    symbol: "BTC",
    pair: "BTCUSDT",
    name: "Bitcoin",
    website: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf",
    socials: { github: "https://github.com/bitcoin/bitcoin", reddit: "https://reddit.com/r/bitcoin" },
    explorers: [{ label: "mempool.space", url: "https://mempool.space" }],
    wallets: [{ label: "Choose wallet", url: "https://bitcoin.org/en/choose-your-wallet" }],
    ucid: 1,
    basePrice: 104250,
    sentimentScore: 68,
    sentimentLabel: "Greed",
    marketDetails: { marketCap: 2050000000000, volume24h: 48200000000, fdv: 2180000000000, totalSupply: 19800000, maxSupply: 21000000, circulatingSupply: 19700000, treasuryHoldings: null },
  }),
  ETH: profile({
    symbol: "ETH", pair: "ETHUSDT", name: "Ethereum", website: "https://ethereum.org", whitepaper: "https://ethereum.org/en/whitepaper/",
    socials: { github: "https://github.com/ethereum", reddit: "https://reddit.com/r/ethereum" },
    explorers: [{ label: "Etherscan", url: "https://etherscan.io" }],
    wallets: [{ label: "Ethereum wallets", url: "https://ethereum.org/en/wallets/" }],
    ucid: 1027, basePrice: 3850, sentimentScore: 64, sentimentLabel: "Greed",
    marketDetails: { marketCap: 462800000000, volume24h: 21400000000, fdv: 462800000000, totalSupply: 120100000, maxSupply: null, circulatingSupply: 120100000, treasuryHoldings: null },
  }),
  BNB: profile({ symbol: "BNB", pair: "BNBUSDT", name: "BNB", website: "https://www.bnbchain.org", explorers: [{ label: "BscScan", url: "https://bscscan.com" }], ucid: 1839, basePrice: 610, sentimentScore: 58, sentimentLabel: "Neutral", marketDetails: { marketCap: 93900000000, volume24h: 1850000000, fdv: 93900000000, totalSupply: 153850000, maxSupply: 200000000, circulatingSupply: 153850000, treasuryHoldings: null } }),
  SOL: profile({ symbol: "SOL", pair: "SOLUSDT", name: "Solana", website: "https://solana.com", explorers: [{ label: "Solscan", url: "https://solscan.io" }], wallets: [{ label: "Solana wallets", url: "https://solana.com/ecosystem/explore?categories=wallet" }], ucid: 5426, basePrice: 172, sentimentScore: 72, sentimentLabel: "Greed", marketDetails: { marketCap: 77000000000, volume24h: 4300000000, fdv: 99000000000, totalSupply: 575000000, maxSupply: null, circulatingSupply: 448000000, treasuryHoldings: null } }),
  XRP: profile({ symbol: "XRP", pair: "XRPUSDT", name: "XRP", website: "https://xrpl.org", explorers: [{ label: "XRPL Explorer", url: "https://livenet.xrpl.org" }], ucid: 52, basePrice: 0.62, sentimentScore: 54, sentimentLabel: "Neutral", marketDetails: { marketCap: 34600000000, volume24h: 1400000000, fdv: 62000000000, totalSupply: 99990000000, maxSupply: 100000000000, circulatingSupply: 55800000000, treasuryHoldings: null } }),
  ADA: profile({ symbol: "ADA", pair: "ADAUSDT", name: "Cardano", website: "https://cardano.org", explorers: [{ label: "Cardanoscan", url: "https://cardanoscan.io" }], ucid: 2010, basePrice: 0.48, sentimentScore: 51, sentimentLabel: "Neutral", marketDetails: { marketCap: 17100000000, volume24h: 520000000, fdv: 21600000000, totalSupply: 36600000000, maxSupply: 45000000000, circulatingSupply: 35600000000, treasuryHoldings: null } }),
  DOGE: profile({ symbol: "DOGE", pair: "DOGEUSDT", name: "Dogecoin", website: "https://dogecoin.com", explorers: [{ label: "Dogechain", url: "https://dogechain.info" }], ucid: 74, basePrice: 0.16, sentimentScore: 57, sentimentLabel: "Neutral", marketDetails: { marketCap: 23000000000, volume24h: 1100000000, fdv: 23000000000, totalSupply: 144000000000, maxSupply: null, circulatingSupply: 144000000000, treasuryHoldings: null } }),
  AVAX: profile({ symbol: "AVAX", pair: "AVAXUSDT", name: "Avalanche", website: "https://www.avax.network", explorers: [{ label: "SnowTrace", url: "https://snowtrace.io" }], ucid: 5805, basePrice: 38, sentimentScore: 60, sentimentLabel: "Neutral", marketDetails: { marketCap: 15400000000, volume24h: 680000000, fdv: 27300000000, totalSupply: 447000000, maxSupply: 720000000, circulatingSupply: 407000000, treasuryHoldings: null } }),
  LINK: profile({ symbol: "LINK", pair: "LINKUSDT", name: "Chainlink", website: "https://chain.link", explorers: [{ label: "Etherscan", url: "https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca" }], ucid: 1975, basePrice: 18, sentimentScore: 63, sentimentLabel: "Greed", marketDetails: { marketCap: 10500000000, volume24h: 540000000, fdv: 18000000000, totalSupply: 1000000000, maxSupply: 1000000000, circulatingSupply: 587000000, treasuryHoldings: null } }),
  DOT: profile({ symbol: "DOT", pair: "DOTUSDT", name: "Polkadot", website: "https://polkadot.network", explorers: [{ label: "Subscan", url: "https://polkadot.subscan.io" }], ucid: 6636, basePrice: 7.2, sentimentScore: 49, sentimentLabel: "Neutral", marketDetails: { marketCap: 10400000000, volume24h: 310000000, fdv: 10400000000, totalSupply: 1450000000, maxSupply: null, circulatingSupply: 1450000000, treasuryHoldings: null } }),
};

import { useEffect, useRef } from "react";

const symbols = [
  { text: "BTC", color: "#FFB300" },
  { text: "ETH", color: "#00D4FF" },
  { text: "SOL", color: "#00E676" },
  { text: "BNB", color: "#FFB300" },
  { text: "XRP", color: "#0094FF" },
  { text: "ADA", color: "#00E676" },
  { text: "AVAX", color: "#FF3B30" },
  { text: "USDT", color: "rgba(232,237,245,0.55)" },
  { text: "DOGE", color: "#FFB300" },
  { text: "TRX", color: "#FF3B30" },
  { text: "LINK", color: "#00D4FF" },
  { text: "DOT", color: "#0094FF" },
  { text: "MATIC", color: "#00E676" },
  { text: "TON", color: "#0094FF" },
  { text: "SHIB", color: "#FFB300" },
  { text: "LTC", color: "#E8EDF5" },
  { text: "BCH", color: "#00E676" },
  { text: "UNI", color: "#00D4FF" },
  { text: "ATOM", color: "#0094FF" },
  { text: "ETC", color: "#00E676" },
  { text: "XLM", color: "#E8EDF5" },
  { text: "APT", color: "#00D4FF" },
  { text: "FIL", color: "#0094FF" },
  { text: "NEAR", color: "#00E676" },
  { text: "ARB", color: "#0094FF" },
  { text: "OP", color: "#FF3B30" },
  { text: "ICP", color: "#FFB300" },
  { text: "HBAR", color: "#00D4FF" },
  { text: "VET", color: "#00E676" },
  { text: "INJ", color: "#00D4FF" },
  { text: "IMX", color: "#0094FF" },
  { text: "SUI", color: "#00D4FF" },
  { text: "SEI", color: "#FF3B30" },
  { text: "TIA", color: "#0094FF" },
  { text: "AAVE", color: "#00E676" },
  { text: "GRT", color: "#0094FF" },
  { text: "ALGO", color: "#E8EDF5" },
  { text: "MKR", color: "#00E676" },
  { text: "QNT", color: "#00D4FF" },
  { text: "EGLD", color: "#FFB300" },
  { text: "STX", color: "#FFB300" },
  { text: "RUNE", color: "#00D4FF" },
  { text: "FLOW", color: "#00E676" },
  { text: "SAND", color: "#FFB300" },
  { text: "MANA", color: "#0094FF" },
  { text: "AXS", color: "#FF3B30" },
  { text: "APE", color: "#FFB300" },
  { text: "GALA", color: "#00E676" },
  { text: "CHZ", color: "#FF3B30" },
  { text: "ENJ", color: "#0094FF" },
  { text: "DYDX", color: "#00D4FF" },
  { text: "SNX", color: "#00D4FF" },
  { text: "CRV", color: "#0094FF" },
  { text: "COMP", color: "#00E676" },
  { text: "YFI", color: "#FFB300" },
  { text: "SUSHI", color: "#FF3B30" },
  { text: "1INCH", color: "#0094FF" },
  { text: "LDO", color: "#00D4FF" },
  { text: "RPL", color: "#FFB300" },
  { text: "FET", color: "#00D4FF" },
  { text: "AGIX", color: "#0094FF" },
  { text: "RNDR", color: "#00E676" },
  { text: "OCEAN", color: "#0094FF" },
  { text: "ROSE", color: "#00E676" },
  { text: "MINA", color: "#00D4FF" },
  { text: "KAVA", color: "#FF3B30" },
  { text: "ZEC", color: "#FFB300" },
  { text: "DASH", color: "#0094FF" },
  { text: "XMR", color: "#FFB300" },
  { text: "WAVES", color: "#00D4FF" },
  { text: "KSM", color: "#E8EDF5" },
  { text: "ZIL", color: "#00E676" },
  { text: "ONT", color: "#0094FF" },
  { text: "QTUM", color: "#00D4FF" },
  { text: "IOTA", color: "#E8EDF5" },
  { text: "EOS", color: "#E8EDF5" },
  { text: "XTZ", color: "#0094FF" },
  { text: "CAKE", color: "#FFB300" },
  { text: "KLAY", color: "#FFB300" },
  { text: "FTM", color: "#0094FF" },
  { text: "CELO", color: "#00E676" },
  { text: "LRC", color: "#00D4FF" },
  { text: "BAT", color: "#FFB300" },
  { text: "ANKR", color: "#0094FF" },
  { text: "HOT", color: "#FF3B30" },
  { text: "ICX", color: "#00E676" },
  { text: "DGB", color: "#0094FF" },
  { text: "RVN", color: "#FFB300" },
  { text: "SC", color: "#00E676" },
  { text: "ZEN", color: "#00D4FF" },
  { text: "BTT", color: "#FF3B30" },
  { text: "GMT", color: "#00E676" },
  { text: "WOO", color: "#00D4FF" },
  { text: "JASMY", color: "#0094FF" },
  { text: "ENS", color: "#00D4FF" },
  { text: "MASK", color: "#FFB300" },
  { text: "BLUR", color: "#0094FF" },
  { text: "PEPE", color: "#00E676" },
  { text: "FLOKI", color: "#FFB300" },
  { text: "BONK", color: "#FFB300" },
];

function createToken(width, height, initial = false) {
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : height + 40,
    vx: (Math.random() - 0.5) * 0.12,
    vy: -(0.08 + Math.random() * 0.22),
    size: 10 + Math.random() * 16,
    opacity: 0.2 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    symbol,
  };
}

export default function CryptoBackdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let tokens = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      tokens = Array.from({ length: 22 }, () => createToken(width, height, true));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      tokens = tokens.map((token) => {
        const next = { ...token };
        next.phase += 0.008;
        next.x += next.vx + Math.sin(next.phase) * 0.06;
        next.y += next.vy;
        if (next.y < -50 || next.x < -80 || next.x > width + 80) {
          return createToken(width, height);
        }
        context.save();
        context.globalAlpha = next.opacity;
        context.fillStyle = next.symbol.color;
        context.shadowColor = next.symbol.color;
        context.shadowBlur = 10;
        context.font = `${next.size}px JetBrains Mono, Consolas, monospace`;
        context.textAlign = "center";
        context.fillText(next.symbol.text, next.x, next.y);
        context.restore();
        return next;
      });
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-60 mix-blend-screen" />;
}

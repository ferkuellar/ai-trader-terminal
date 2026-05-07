import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AnalystLoadingState() {
  const messages = [
    "Pidiendo análisis a Claude...",
    "Evaluando filtros del plan...",
    "Computando confluencia técnica...",
    "Buscando setup válido...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1500);
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="border border-cyan-500/30 bg-cyan-500/5 p-8 text-center">
      <Loader2 className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin" />
      <div className="text-cyan-400 text-xs tracking-[0.3em] mb-1">// {messages[msgIdx]}</div>
      <div className="text-[10px] text-zinc-500 mt-2">esto puede tomar 10-20s</div>
    </div>
  );
}

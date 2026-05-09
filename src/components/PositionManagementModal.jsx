import { useEffect, useMemo, useState } from "react";
import TradeHealthBar from "./TradeHealthBar";
import {
  applyPositionEventToTrade,
  buildJournalEntryFromPositionEvent,
  createPositionEvent,
  POSITION_EVENT_TYPES,
} from "@/lib/position-events";

const EMOTIONS = [
  { id: "calm", label: "Calmado" },
  { id: "focused", label: "Enfocado" },
  { id: "doubt", label: "Duda" },
  { id: "fomo", label: "FOMO" },
  { id: "fear", label: "Miedo" },
  { id: "revenge", label: "Revenge" },
];

const ACTIONS = [
  { id: POSITION_EVENT_TYPES.CLOSE, label: "Cerrar posición" },
  { id: POSITION_EVENT_TYPES.REDUCE, label: "Reducir posición" },
  { id: POSITION_EVENT_TYPES.INCREASE, label: "Aumentar posición" },
  { id: POSITION_EVENT_TYPES.MOVE_STOP, label: "Mover Stop Loss" },
];

const numberOrNull = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const fmt = (value, decimals = 2) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const money = (value) => `$${fmt(value, 2)}`;

const positionSizeValue = (trade = {}) =>
  numberOrNull(trade.positionUnits) ?? numberOrNull(trade.positionSize);

const directionOf = (trade = {}) =>
  String(trade.direction || trade.side || "long").toLowerCase() === "short" ? "short" : "long";

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] tracking-[0.18em] text-zinc-500">{label}</div>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
    />
  );
}

export default function PositionManagementModal({
  trade,
  currentPrice,
  open,
  onClose,
  onSave,
}) {
  const [action, setAction] = useState(POSITION_EVENT_TYPES.CLOSE);
  const [exitPrice, setExitPrice] = useState("");
  const [realizedPnl, setRealizedPnl] = useState("");
  const [newPositionSize, setNewPositionSize] = useState("");
  const [newStopLoss, setNewStopLoss] = useState("");
  const [reason, setReason] = useState("");
  const [followedPlan, setFollowedPlan] = useState(true);
  const [planDeviationReason, setPlanDeviationReason] = useState("");
  const [emotionalState, setEmotionalState] = useState("calm");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !trade) return;
    const size = positionSizeValue(trade);
    setAction(POSITION_EVENT_TYPES.CLOSE);
    setExitPrice(currentPrice ? String(currentPrice) : "");
    setRealizedPnl("");
    setNewPositionSize(size ? String(size) : "");
    setNewStopLoss(trade.stopLoss ? String(trade.stopLoss) : "");
    setReason("");
    setFollowedPlan(true);
    setPlanDeviationReason("");
    setEmotionalState("calm");
    setNotes("");
    setError("");
  }, [open, trade, currentPrice]);

  const preview = useMemo(() => {
    if (!trade) return null;
    const entry = numberOrNull(trade.entryPrice ?? trade.entry);
    const size = positionSizeValue(trade);
    const exit = numberOrNull(exitPrice);
    const units = numberOrNull(trade.positionUnits) ?? (entry && size ? size / entry : null);
    const direction = directionOf(trade);
    const estimatedRealizedPnl = action === POSITION_EVENT_TYPES.CLOSE && exit && units
      ? direction === "short"
        ? (entry - exit) * units
        : (exit - entry) * units
      : null;

    const warnings = [];
    if (!trade.id) warnings.push("La posición no tiene identificador; no se puede guardar.");
    if (!currentPrice) warnings.push("No hay precio actual; el impacto de riesgo puede ser parcial.");
    if (!size && [POSITION_EVENT_TYPES.REDUCE, POSITION_EVENT_TYPES.INCREASE].includes(action)) {
      warnings.push("Falta positionSize; no se puede ajustar tamaño con precisión.");
    }
    if (action === POSITION_EVENT_TYPES.INCREASE) {
      warnings.push("Aumentar posición puede incrementar tu riesgo. Registra esta acción solo si estaba contemplada en tu plan.");
    }
    if (action === POSITION_EVENT_TYPES.MOVE_STOP) {
      const previousStop = numberOrNull(trade.stopLoss);
      const nextStop = numberOrNull(newStopLoss);
      if (nextStop && currentPrice) {
        if (direction === "long" && nextStop >= currentPrice) warnings.push("Para LONG, el nuevo stop debe quedar debajo del precio actual.");
        if (direction === "short" && nextStop <= currentPrice) warnings.push("Para SHORT, el nuevo stop debe quedar encima del precio actual.");
      }
      if (previousStop && nextStop) {
        if (direction === "long" && nextStop < previousStop) warnings.push("Estás ampliando riesgo al bajar el stop.");
        if (direction === "short" && nextStop > previousStop) warnings.push("Estás ampliando riesgo al subir el stop.");
      }
    }

    return { estimatedRealizedPnl, warnings };
  }, [trade, action, exitPrice, newStopLoss, currentPrice]);

  if (!open || !trade) return null;

  const submitLabel = action === POSITION_EVENT_TYPES.CLOSE
    ? "Guardar cierre en journal"
    : "Guardar ajuste en journal";

  const handleSave = () => {
    try {
      setError("");
      const currentSize = positionSizeValue(trade);
      const nextSize = numberOrNull(newPositionSize);
      const input = {
        trade,
        tradeId: trade.id,
        symbol: trade.pair || trade.symbol,
        type: action,
        currentPrice: numberOrNull(currentPrice),
        exitPrice: numberOrNull(exitPrice),
        realizedPnl: numberOrNull(realizedPnl) ?? preview?.estimatedRealizedPnl,
        newPositionSize: numberOrNull(newPositionSize),
        reduceAmount: action === POSITION_EVENT_TYPES.REDUCE && currentSize !== null && nextSize !== null
          ? Math.max(0, currentSize - nextSize)
          : null,
        increaseAmount: action === POSITION_EVENT_TYPES.INCREASE && currentSize !== null && nextSize !== null
          ? Math.max(0, nextSize - currentSize)
          : null,
        previousStopLoss: numberOrNull(trade.stopLoss),
        newStopLoss: numberOrNull(newStopLoss),
        reason,
        followedPlan,
        planDeviationReason,
        emotionalState,
        notes,
      };
      const event = createPositionEvent(input);
      const journalEntry = buildJournalEntryFromPositionEvent(trade, event);
      const updatedTrade = {
        ...applyPositionEventToTrade(trade, event),
        journalEntries: [...(trade.journalEntries || []), journalEntry],
      };
      onSave({ event, journalEntry, updatedTrade });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el registro.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-zinc-800 bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div>
            <div className="text-[11px] tracking-[0.2em] text-zinc-300">GESTIONAR POSICIÓN</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>{trade.pair || trade.symbol}</span>
              <span className={trade.direction === "short" ? "text-red-400" : "text-emerald-400"}>
                {String(trade.direction || "long").toUpperCase()}
              </span>
              <TradeHealthBar
                trade={{ ...trade, entry: trade.entryPrice, currentPrice }}
                size="compact"
              />
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300">
            Salir
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="border border-cyan-500/25 bg-cyan-950/20 p-3 text-xs text-cyan-200">
            Este registro no ejecuta órdenes reales. Solo actualiza tu journal local y el estado de la posición dentro del sistema.
          </div>

          <Field label="ACCIÓN">
            <div className="grid gap-2 sm:grid-cols-4">
              {ACTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAction(item.id)}
                  className={`border px-2 py-2 text-[10px] tracking-[0.14em] transition-colors ${
                    action === item.id
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>

          {action === POSITION_EVENT_TYPES.CLOSE && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="PRECIO DE SALIDA REGISTRADO">
                <Input type="number" step="any" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} />
                {preview?.estimatedRealizedPnl != null && (
                  <div className="mt-2 text-xs text-zinc-400">
                    P&L estimado local: <span className={preview.estimatedRealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}>{money(preview.estimatedRealizedPnl)}</span>
                  </div>
                )}
              </Field>
              <Field label="P&L REALIZADO LOCAL">
                <Input
                  type="number"
                  step="any"
                  value={realizedPnl}
                  onChange={(event) => setRealizedPnl(event.target.value)}
                  placeholder={preview?.estimatedRealizedPnl != null ? String(preview.estimatedRealizedPnl.toFixed(2)) : "0.00"}
                />
              </Field>
            </div>
          )}

          {[POSITION_EVENT_TYPES.REDUCE, POSITION_EVENT_TYPES.INCREASE].includes(action) && (
            <Field label="NUEVO TAMAÑO LOCAL DE POSICIÓN">
              <Input type="number" step="any" value={newPositionSize} onChange={(event) => setNewPositionSize(event.target.value)} />
            </Field>
          )}

          {action === POSITION_EVENT_TYPES.MOVE_STOP && (
            <Field label="NUEVO STOP LOSS LOCAL">
              <Input type="number" step="any" value={newStopLoss} onChange={(event) => setNewStopLoss(event.target.value)} />
            </Field>
          )}

          <Field label="RAZÓN DE LA ACCIÓN">
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Ej. Reducir riesgo antes de noticia macro."
              className="w-full resize-none border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
            />
          </Field>

          <Field label="¿SIGUE EL PLAN ORIGINAL?">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFollowedPlan(true)}
                className={`border py-2 text-xs tracking-wider ${followedPlan ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 text-zinc-500"}`}
              >
                SÍ
              </button>
              <button
                type="button"
                onClick={() => setFollowedPlan(false)}
                className={`border py-2 text-xs tracking-wider ${!followedPlan ? "border-amber-500/60 bg-amber-500/10 text-amber-400" : "border-zinc-800 text-zinc-500"}`}
              >
                NO
              </button>
            </div>
          </Field>

          {!followedPlan && (
            <Field label="MOTIVO DE DESVIACIÓN">
              <Input value={planDeviationReason} onChange={(event) => setPlanDeviationReason(event.target.value)} />
            </Field>
          )}

          <Field label="ESTADO EMOCIONAL">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              {EMOTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEmotionalState(item.id)}
                  className={`border px-2 py-2 text-[10px] tracking-[0.12em] ${
                    emotionalState === item.id
                      ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                      : "border-zinc-800 text-zinc-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="NOTAS OPCIONALES">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full resize-none border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
            />
          </Field>

          <div className="border border-zinc-800 bg-zinc-950/70 p-3">
            <div className="mb-2 text-[10px] tracking-[0.18em] text-zinc-500">RESUMEN ANTES DE GUARDAR</div>
            <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
              <div>Size actual: <span className="text-zinc-200">{fmt(positionSizeValue(trade), 6)}</span></div>
              <div>Stop actual: <span className="text-zinc-200">{fmt(trade.stopLoss, 6)}</span></div>
              <div>Nuevo size: <span className="text-zinc-200">{newPositionSize || "sin cambio"}</span></div>
              <div>Nuevo stop: <span className="text-zinc-200">{newStopLoss || "sin cambio"}</span></div>
            </div>
            {preview?.warnings?.length > 0 && (
              <div className="mt-3 space-y-1 text-xs text-amber-300">
                {preview.warnings.map((warning) => (
                  <div key={warning}>• {warning}</div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>
          )}

          <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr]">
            <button
              type="button"
              onClick={onClose}
              className="border border-zinc-800 px-4 py-3 text-xs tracking-[0.18em] text-zinc-400 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-amber-500 px-4 py-3 text-xs font-bold tracking-[0.18em] text-zinc-950 hover:bg-amber-400"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

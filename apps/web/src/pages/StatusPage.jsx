import { Activity, ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatRelativeTime } from "../utils/time";
import { incidentTimeline, metricGlossary, monitoringPipeline, statusServices } from "../data/statusMetrics";
import { legalNotices } from "../data/legalDisclaimers";

const BUILD_VERSION = import.meta.env.VITE_APP_BUILD_VERSION || "WEB_0.1.0";

const toneClass = {
  ok: {
    text: "text-cockpit-green",
    dot: "bg-cockpit-green shadow-[0_0_10px_rgba(0,230,118,0.7)]",
    badge: "border-cockpit-green/30 bg-cockpit-green/10 text-cockpit-green",
  },
  warn: {
    text: "text-cockpit-amber",
    dot: "bg-cockpit-amber shadow-[0_0_10px_rgba(255,179,0,0.65)]",
    badge: "border-cockpit-amber/30 bg-cockpit-amber/10 text-cockpit-amber",
  },
  error: {
    text: "text-cockpit-red",
    dot: "bg-cockpit-red shadow-[0_0_10px_rgba(255,59,48,0.7)]",
    badge: "border-cockpit-red/30 bg-cockpit-red/10 text-cockpit-red",
  },
  info: {
    text: "text-cockpit-cyan",
    dot: "bg-cockpit-cyan shadow-[0_0_10px_rgba(0,212,255,0.7)]",
    badge: "border-cockpit-cyan/30 bg-cockpit-cyan/10 text-cockpit-cyan",
  },
};

const MotionDiv = motion.div;

function clampLatency(value) {
  return Math.min(220, Math.max(25, value));
}

function getOverallStatus(services) {
  if (services.some((service) => service.level === "error")) return { label: "Degraded", level: "error" };
  if (services.some((service) => service.level === "warn")) return { label: "Monitoring", level: "warn" };
  return { label: "Operational", level: "ok" };
}

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function StatusPage() {
  const [services, setServices] = useState(statusServices);
  const [lastCheckedAt, setLastCheckedAt] = useState(() => new Date());
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isChecking, setIsChecking] = useState(false);
  const checkTimerRef = useRef(null);

  const overallStatus = useMemo(() => getOverallStatus(services), [services]);
  const averageLatency = useMemo(
    () => Math.round(services.reduce((total, service) => total + service.latency, 0) / services.length),
    [services],
  );
  const summaryMetrics = [
    {
      label: "Overall Status",
      value: isChecking ? "Checking..." : overallStatus.label,
      tone: isChecking ? "info" : overallStatus.level,
      description: "Estado consolidado de todos los servicios criticos.",
    },
    {
      label: "Uptime Preview",
      value: "99.98%",
      tone: "ok",
      description: "Porcentaje estimado de disponibilidad en el periodo medido.",
    },
    {
      label: "Average Latency",
      value: `${averageLatency}ms`,
      tone: "info",
      description: "Tiempo promedio de respuesta entre la aplicacion y los servicios monitoreados.",
    },
    {
      label: "Services Monitored",
      value: String(services.length),
      tone: "info",
      description: "Numero de componentes incluidos en el modelo de salud.",
    },
    {
      label: "Open Incidents",
      value: "0",
      tone: "ok",
      description: "Incidentes activos que requieren atencion.",
    },
  ];

  const runMockStatusRefresh = useCallback(() => {
    window.clearTimeout(checkTimerRef.current);
    setIsChecking(true);

    const delay = 600 + Math.round(Math.random() * 300);
    checkTimerRef.current = window.setTimeout(() => {
      setServices((currentServices) =>
        currentServices.map((service) => ({
          ...service,
          latency: clampLatency(service.latency + Math.round(Math.random() * 12 - 6)),
          status: service.name === "Billing" ? "Monitoring" : "Operational",
          level: service.name === "Billing" ? "warn" : "ok",
        })),
      );
      setLastCheckedAt(new Date());
      setCurrentTime(new Date());
      setIsChecking(false);
    }, delay);
  }, []);

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    const statusInterval = window.setInterval(runMockStatusRefresh, 30000);

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(statusInterval);
      window.clearTimeout(checkTimerRef.current);
    };
  }, [runMockStatusRefresh]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cockpit-bg text-cockpit-text">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:48px_48px] opacity-[0.06]" />
      <div className="section-shell relative py-6 md:py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-cockpit-border bg-cockpit-bg2/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cockpit-text transition hover:text-cockpit-cyan"
            onClick={() => navigateTo("/")}
          >
            <span className="grid h-8 w-8 place-items-center border border-cockpit-cyan/50 bg-cockpit-bg3 text-cockpit-cyan">
              TT
            </span>
            TRADING.TERMINAL
          </button>
          <span className="border border-cockpit-cyan/30 bg-cockpit-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cockpit-cyan">
            STATUS PREVIEW
          </span>
        </header>

        <section className="terminal-card overflow-hidden">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <MotionDiv initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <div className="inline-flex items-center gap-2 border border-cockpit-green/30 bg-cockpit-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cockpit-green">
                <span className={`h-2 w-2 rounded-full animate-ping ${toneClass.ok.dot}`} />
                All preview systems operational
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-cockpit-text md:text-5xl">
                Public Status Page Coming Soon
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-cockpit-dim md:text-base">
                Estamos preparando una pagina publica de estado para mostrar disponibilidad, latencia, servicios
                monitoreados e historial de incidentes de TRADING.TERMINAL.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cockpit-dim">
                Mientras la version publica queda lista, esta vista muestra una simulacion del modelo de observabilidad
                que usaremos para reportar salud del sistema, degradaciones e incidencias de forma transparente.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-cockpit-cyan px-4 py-3 text-sm font-bold text-cockpit-bg transition hover:bg-cyan-300"
                  onClick={() => navigateTo("/")}
                >
                  <ArrowLeft size={16} />
                  Back to Landing
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-cockpit-border2 px-4 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan disabled:opacity-55"
                  onClick={runMockStatusRefresh}
                  disabled={isChecking}
                >
                  <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
                  Refresh Status
                </button>
              </div>
            </MotionDiv>

            <aside className="border border-cockpit-border bg-cockpit-bg/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cockpit-dim">Current check</p>
                  <p className={`mt-2 text-2xl font-semibold ${toneClass[overallStatus.level].text}`}>
                    {isChecking ? "Checking..." : overallStatus.label}
                  </p>
                </div>
                <ShieldCheck className={toneClass[overallStatus.level].text} size={34} />
              </div>
              <div className="mt-6 grid gap-3 text-[11px] uppercase tracking-[0.12em] text-cockpit-dim">
                <p aria-live="polite">Last check: {formatRelativeTime(lastCheckedAt, currentTime)}</p>
                <p>BUILD {BUILD_VERSION}</p>
                <p>Mode: mock telemetry</p>
              </div>
              <div className="mt-5 border border-cockpit-amber/30 bg-cockpit-amber/10 p-3 text-xs leading-6 text-cockpit-dim">
                <span className="font-bold uppercase tracking-[0.16em] text-cockpit-amber">STATUS PREVIEW</span>
                <br />
                Mock data for product preview. Real uptime and incident data will be connected once the backend monitoring
                pipeline is available.
                <br />
                {legalNotices.statusPreview}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cockpit-cyan">System overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-cockpit-text">Overall System Status</h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {summaryMetrics.map((metric) => {
              const tone = toneClass[metric.tone] || toneClass.info;
              return (
                <article key={metric.label} className="terminal-card p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">{metric.label}</p>
                  <p className={`mt-3 text-2xl font-semibold ${tone.text}`}>{metric.value}</p>
                  <p className="mt-3 text-xs leading-5 text-cockpit-dim">{metric.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 terminal-card overflow-hidden">
          <div className="border-b border-cockpit-border bg-cockpit-bg2 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cockpit-text">Services Monitored</h2>
          </div>
          <div className="divide-y divide-cockpit-border">
            {services.map((service) => {
              const tone = toneClass[service.level] || toneClass.info;
              return (
                <article key={service.name} className="grid gap-4 px-4 py-5 lg:grid-cols-[0.75fr_1fr_1fr] lg:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                      <h3 className="text-base font-semibold text-cockpit-text">{service.name}</h3>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${tone.badge}`}>
                        {service.status}
                      </span>
                      <span className="border border-cockpit-border px-2 py-1 text-[10px] text-cockpit-dim">
                        {service.latency}ms
                      </span>
                      <span className="border border-cockpit-border px-2 py-1 text-[10px] text-cockpit-dim">
                        {service.uptime}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-cockpit-dim">{service.description}</p>
                  <p className="border border-cockpit-border bg-cockpit-bg/70 p-3 text-xs leading-6 text-cockpit-dim">
                    {service.metricExplanation}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          <div className="terminal-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cockpit-text">Metric Glossary</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {metricGlossary.map((metric) => (
                <article key={metric.name} className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                  <h3 className="text-sm font-semibold text-cockpit-cyan">{metric.name}</h3>
                  <p className="mt-2 text-xs leading-6 text-cockpit-dim">{metric.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="terminal-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cockpit-text">Incident Timeline Preview</h2>
            <p className="mt-3 text-xs leading-6 text-cockpit-dim">
              Timeline de preview con datos mock. No representa incidentes reales de produccion todavia.
            </p>
            <div className="mt-5 grid gap-3">
              {incidentTimeline.map((incident) => {
                const tone = toneClass[incident.level] || toneClass.info;
                return (
                  <article key={incident.title} className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-cockpit-dim">{incident.date}</p>
                        <h3 className="mt-1 text-sm font-semibold text-cockpit-text">{incident.title}</h3>
                      </div>
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${tone.badge}`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-cockpit-dim">{incident.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-8 terminal-card p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cockpit-text">Future Monitoring Pipeline</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-cockpit-dim">
            Esta pagina sera conectada despues a una arquitectura de monitoreo real basada en health checks, telemetria,
            metadata de despliegue e historial de incidentes.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {monitoringPipeline.map((item) => (
              <article key={item.name} className="border border-cockpit-border bg-cockpit-bg/70 p-4">
                <h3 className="text-sm font-semibold text-cockpit-cyan">{item.name}</h3>
                <p className="mt-2 text-xs leading-6 text-cockpit-dim">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="my-8 terminal-card p-6 text-center md:p-8">
          <Activity className="mx-auto text-cockpit-cyan" size={28} />
          <h2 className="mt-4 text-3xl font-semibold text-cockpit-text">Transparency before scale.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cockpit-dim">
            Antes de escalar una plataforma, se debe saber si respira bien. Esta pagina sera el punto publico de
            referencia para disponibilidad, degradaciones e incidentes de TRADING.TERMINAL.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-cockpit-cyan px-5 py-3 text-sm font-bold text-cockpit-bg transition hover:bg-cyan-300"
              onClick={() => navigateTo("/")}
            >
              <ArrowLeft size={16} />
              Back to Landing
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 border border-cockpit-border2 px-5 py-3 text-sm font-bold text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
              onClick={runMockStatusRefresh}
            >
              <ExternalLink size={16} />
              Return to System Health
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

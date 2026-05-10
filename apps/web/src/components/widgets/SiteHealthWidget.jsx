import { Activity, ExternalLink, RefreshCw, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialServices } from "../../data/siteHealth";
import { formatRelativeTime } from "../../utils/time";

const BUILD_VERSION = import.meta.env.VITE_APP_BUILD_VERSION || "WEB_0.1.0";
const STATUS_PAGE_URL = import.meta.env.VITE_STATUS_PAGE_URL || "/status";

const levelClass = {
  ok: {
    dot: "bg-cockpit-green shadow-[0_0_10px_rgba(0,230,118,0.7)]",
    text: "text-cockpit-green",
    badge: "border-cockpit-green/30 bg-cockpit-green/10 text-cockpit-green",
  },
  warn: {
    dot: "bg-cockpit-amber shadow-[0_0_10px_rgba(255,179,0,0.65)]",
    text: "text-cockpit-amber",
    badge: "border-cockpit-amber/30 bg-cockpit-amber/10 text-cockpit-amber",
  },
  error: {
    dot: "bg-cockpit-red shadow-[0_0_10px_rgba(255,59,48,0.7)]",
    text: "text-cockpit-red",
    badge: "border-cockpit-red/30 bg-cockpit-red/10 text-cockpit-red",
  },
  info: {
    dot: "bg-cockpit-cyan shadow-[0_0_10px_rgba(0,212,255,0.7)]",
    text: "text-cockpit-cyan",
    badge: "border-cockpit-cyan/30 bg-cockpit-cyan/10 text-cockpit-cyan",
  },
};

const statusConfig = {
  OPERATIONAL: {
    label: "OPERATIONAL",
    copy: "All core systems online.",
    level: "ok",
  },
  MONITORING: {
    label: "MONITORING",
    copy: "Core systems online with one service under watch.",
    level: "warn",
  },
  DEGRADED: {
    label: "DEGRADED",
    copy: "One or more services need attention.",
    level: "error",
  },
};

const widgetMotion = {
  initial: { opacity: 0, y: 16, x: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, x: 0, scale: 1 },
  exit: { opacity: 0, y: 12, x: 8, scale: 0.97 },
  transition: { duration: 0.18, ease: "easeOut" },
};

const MotionAside = motion.aside;
const MotionButton = motion.button;

function clampLatency(value) {
  return Math.min(220, Math.max(25, value));
}

function getOverallStatus(services) {
  if (services.some((service) => service.level === "error")) return statusConfig.DEGRADED;
  if (services.some((service) => service.level === "warn")) return statusConfig.MONITORING;
  return statusConfig.OPERATIONAL;
}

function nextServiceState(service) {
  const delta = Math.round(Math.random() * 12 - 6);
  const latency = clampLatency(service.latency + delta);

  if (service.name === "Billing") {
    return { ...service, status: "Monitoring", level: "warn", latency };
  }

  return { ...service, status: "Operational", level: "ok", latency };
}

export default function SiteHealthWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [services, setServices] = useState(initialServices);
  const [lastCheckedAt, setLastCheckedAt] = useState(() => new Date());
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const statusMessageTimerRef = useRef(null);
  const healthCheckTimerRef = useRef(null);

  const overallStatus = useMemo(() => getOverallStatus(services), [services]);
  const displayedStatus = isChecking ? "Checking..." : overallStatus.label;
  const displayedTone = isChecking ? levelClass.info : levelClass[overallStatus.level];
  const relativeLastCheck = formatRelativeTime(lastCheckedAt, currentTime);
  const hasStatusPageUrl = STATUS_PAGE_URL !== "#";
  const isInternalStatusPage = STATUS_PAGE_URL === "/status";

  // TODO: Replace mock health check with real backend endpoint: GET /api/health
  const runMockHealthCheck = useCallback(() => {
    window.clearTimeout(healthCheckTimerRef.current);
    setIsChecking(true);

    const delay = 600 + Math.round(Math.random() * 300);
    healthCheckTimerRef.current = window.setTimeout(() => {
      setServices((currentServices) => currentServices.map(nextServiceState));
      setLastCheckedAt(new Date());
      setCurrentTime(new Date());
      setIsChecking(false);
    }, delay);
  }, []);

  const handleStatusPageClick = () => {
    if (isInternalStatusPage) {
      window.history.pushState({}, "", "/status");
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (hasStatusPageUrl) return;

    window.clearTimeout(statusMessageTimerRef.current);
    setStatusMessage("Public status page coming soon.");
    statusMessageTimerRef.current = window.setTimeout(() => {
      setStatusMessage("");
    }, 3000);
  };

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const healthInterval = window.setInterval(() => {
      runMockHealthCheck();
    }, 30000);

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(healthInterval);
      window.clearTimeout(statusMessageTimerRef.current);
      window.clearTimeout(healthCheckTimerRef.current);
    };
  }, [runMockHealthCheck]);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <MotionAside
            key="expanded"
            {...widgetMotion}
            className="w-[calc(100vw-2rem)] max-w-[340px] overflow-hidden border border-cockpit-border bg-cockpit-bg2/95 shadow-cyan backdrop-blur-xl"
            aria-label="System health status"
          >
            <header className="flex items-start justify-between gap-4 border-b border-cockpit-border bg-cockpit-bg3/70 px-4 py-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cockpit-cyan">
                  <ShieldCheck size={14} aria-hidden="true" />
                  SYSTEM HEALTH
                </div>
                <p className="mt-2 text-[11px] text-cockpit-dim">{isChecking ? "Running service checks." : overallStatus.copy}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${displayedTone.badge}`}
                  aria-live="polite"
                >
                  {displayedStatus}
                </span>
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center border border-cockpit-border2 text-cockpit-dim transition hover:border-cockpit-cyan hover:text-cockpit-cyan"
                  aria-label="Collapse system health widget"
                  onClick={() => setIsExpanded(false)}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="grid gap-2 px-4 py-3">
              {services.map((service) => {
                const tone = levelClass[service.level] || levelClass.info;
                return (
                  <div
                    key={service.name}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border border-cockpit-border/70 bg-cockpit-bg/70 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                      <span className="truncate text-[11px] font-semibold text-cockpit-text">{service.name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold ${tone.text}`}>{service.status}</span>
                    <span className="text-[10px] tabular-nums text-cockpit-dim">{service.latency}ms</span>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-cockpit-border bg-cockpit-bg/80 px-4 py-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 text-[10px] uppercase tracking-[0.12em] text-cockpit-dim">
                  <p aria-live="polite">Last check: {relativeLastCheck}</p>
                  <p className="mt-1">BUILD {BUILD_VERSION}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 border border-cockpit-border2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cockpit-text transition hover:border-cockpit-cyan hover:text-cockpit-cyan disabled:cursor-not-allowed disabled:opacity-55"
                    aria-label="Refresh system health"
                    onClick={runMockHealthCheck}
                    disabled={isChecking}
                  >
                    <RefreshCw size={12} className={isChecking ? "animate-spin" : ""} aria-hidden="true" />
                    Refresh
                  </button>
                  {isInternalStatusPage ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 border border-cockpit-border2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cockpit-cyan transition hover:border-cockpit-cyan hover:bg-cockpit-cyan/10"
                      onClick={handleStatusPageClick}
                    >
                      View Status
                      <ExternalLink size={12} aria-hidden="true" />
                    </button>
                  ) : hasStatusPageUrl ? (
                    <a
                      href={STATUS_PAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 border border-cockpit-border2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cockpit-cyan transition hover:border-cockpit-cyan hover:bg-cockpit-cyan/10"
                    >
                      View Status
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 border border-cockpit-border2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cockpit-cyan transition hover:border-cockpit-cyan hover:bg-cockpit-cyan/10"
                      onClick={handleStatusPageClick}
                      aria-label="View public status page information"
                    >
                      View Status
                      <ExternalLink size={12} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              {statusMessage && <p className="mt-3 text-[10px] text-cockpit-amber">{statusMessage}</p>}
            </footer>
          </MotionAside>
        ) : (
          <MotionButton
            key="collapsed"
            type="button"
            {...widgetMotion}
            className="group flex items-center gap-3 border border-cockpit-border bg-cockpit-bg2/95 px-3 py-2 text-left shadow-cyan backdrop-blur-xl transition hover:border-cockpit-cyan"
            aria-label="Expand system health widget"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(true)}
          >
            <span className={`relative flex h-8 w-8 items-center justify-center border ${displayedTone.badge}`}>
              {!isChecking && <span className={`absolute h-2.5 w-2.5 rounded-full opacity-60 animate-ping ${displayedTone.dot}`} />}
              <Activity size={15} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-cockpit-cyan">SYSTEM HEALTH</span>
              <span className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] ${displayedTone.text}`}>
                {displayedStatus}
              </span>
            </span>
          </MotionButton>
        )}
      </AnimatePresence>
    </div>
  );
}

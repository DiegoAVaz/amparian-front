"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookie } from "@/lib/auth";

import type { EventSummary } from "./types";
import { CreateEventModal } from "./create-event-modal";
import { EventDetailModal } from "./event-detail-modal";
import { PublishSuccessModal } from "./publish-success-modal";
import { PublishErrorModal } from "./publish-error-modal";

type ModalState = "none" | "create-event" | "event-detail" | "publish-success" | "publish-error";

const SAMPLE_EVENTS: EventSummary[] = [
  { id: 1, title: "Mutirão de limpeza", org: "Ong Guerrilha do BEM", imageKey: "eventoMutirao" },
  { id: 2, title: "Instrutor Voluntário", org: "Ong Sabber", imageKey: "eventoInstrutor" },
];

const CHART_DATA = [
  { label: "2021", value: 8 },
  { label: "2022", value: 16 },
  { label: "2023", value: 27 },
  { label: "2024", value: 36 },
  { label: "2025", value: 46 },
];

export function HomeContent() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>("none");
  const [selectedEvent, setSelectedEvent] = useState<EventSummary>(SAMPLE_EVENTS[0]);

  function handleLogout() {
    clearAuthCookie();
    router.push("/login");
  }

  function openDetail(event: EventSummary) {
    setSelectedEvent(event);
    setModal("event-detail");
  }

  return (
    <div className="flex min-h-screen flex-col bg-teal-50">
      {/* ── Top header ───────────────────────────────────── */}
      <header className="flex items-center justify-between bg-brand-teal px-6 py-3">
        <div className="flex items-center gap-2">
          <ShieldIcon variant="white" size={28} />
          <span className="text-lg font-bold text-white">Amparian</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Olá, Bianca!</span>
          <button className="text-white/80 hover:text-white" aria-label="Perfil">
            <UserIcon />
          </button>
          <button className="text-white/80 hover:text-white" aria-label="Notificações">
            <BellIcon />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="flex w-52 flex-shrink-0 flex-col bg-white shadow-sm">
          <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-5">
            <SidebarItem icon={<HomeNavIcon />} label="Home" active />
            <SidebarItem icon={<EventsNavIcon />} label="Meus eventos" />
            <SidebarItem icon={<AgendaNavIcon />} label="Agenda" />
            <SidebarItem icon={<SettingsNavIcon />} label="Configurações" />
          </nav>
          <div className="flex flex-col gap-0.5 border-t border-gray-100 p-3">
            <SidebarItem icon={<HelpNavIcon />} label="Ajuda" />
            <SidebarItem icon={<LogoutNavIcon />} label="Sair da conta" danger onClick={handleLogout} />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-6">
          {/* Banner */}
          <div className="flex h-48 overflow-hidden rounded-xl shadow-sm">
            {/* Imagem — adicionar src/assets/bannerVoluntarios.jpg */}
            <div className="flex flex-1 items-center justify-center bg-gray-300">
              <span className="text-xs text-gray-400">bannerVoluntarios.jpg</span>
            </div>
            {/* CTA card */}
            <div className="flex w-72 flex-shrink-0 flex-col items-start justify-center gap-3 bg-[#064e3b] p-7">
              <p className="text-sm font-bold leading-snug text-white">
                Você sabia que pode criar seu próprio evento?
              </p>
              <p className="text-xs text-white/70">Seja mudança, comece um movimento!</p>
              <button
                onClick={() => setModal("create-event")}
                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Criar evento
              </button>
            </div>
          </div>

          {/* Opportunities + Impact */}
          <div className="flex gap-6">
            {/* Opportunities */}
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="text-base font-semibold text-brand-teal">
                Oportunidades recomendadas para você
              </h2>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Pesquise por evento, ONG ou habilidade"
                  className="flex-1 text-sm text-gray-500 outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Event cards */}
              <div className="flex flex-col gap-3">
                {SAMPLE_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="flex overflow-hidden rounded-xl bg-white shadow-sm"
                  >
                    {/* Imagem — adicionar src/assets/{event.imageKey}.jpg */}
                    <div className="flex w-28 flex-shrink-0 items-center justify-center bg-gray-200">
                      <span className="px-1 text-center text-[9px] text-gray-400">
                        {event.imageKey}.jpg
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-brand-teal">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.org}</p>
                      </div>
                      <button
                        onClick={() => openDetail(event)}
                        className="rounded-lg bg-brand-teal px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-teal-hover"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact chart */}
            <div className="flex w-64 flex-shrink-0 flex-col gap-3">
              <h2 className="text-base font-semibold text-brand-teal">Meu impacto</h2>
              <ImpactChart data={CHART_DATA} />
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {modal === "create-event" && (
        <CreateEventModal
          onClose={() => setModal("none")}
          onPublish={() => setModal("publish-success")}
          onError={() => setModal("publish-error")}
        />
      )}
      {modal === "event-detail" && (
        <EventDetailModal event={selectedEvent} onClose={() => setModal("none")} />
      )}
      {modal === "publish-success" && (
        <PublishSuccessModal onClose={() => setModal("none")} />
      )}
      {modal === "publish-error" && (
        <PublishErrorModal
          onClose={() => setModal("none")}
          onRetry={() => setModal("create-event")}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sub-components
──────────────────────────────────────────────────────────── */

function SidebarItem({
  icon,
  label,
  active,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
        active
          ? "bg-brand-teal/10 text-brand-teal"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:bg-gray-100",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

type ChartPoint = { label: string; value: number };

function ImpactChart({ data }: { data: ChartPoint[] }) {
  const W = 240;
  const H = 170;
  const pad = { top: 12, right: 8, bottom: 28, left: 36 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const maxV = 50;

  const x = (i: number) => (i / (data.length - 1)) * cW;
  const y = (v: number) => cH - (v / maxV) * cH;

  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");

  const area = `M0,${cH} ${data.map((d, i) => `L${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ")} L${cW},${cH} Z`;

  const yTicks = [50, 40, 30, 20, 10, 0];

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <g transform={`translate(${pad.left},${pad.top})`}>
          {/* Grid + Y labels */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1="0"
                y1={y(v).toFixed(1)}
                x2={cW}
                y2={y(v).toFixed(1)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="-5"
                y={y(v) + 3.5}
                textAnchor="end"
                fontSize="9"
                fill="#9ca3af"
              >
                {v > 0 ? `${v / 10}k` : "0"}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={area} fill="url(#areaGrad)" />

          {/* Line */}
          <path
            d={line}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {data.map((d, i) => (
            <circle key={d.label} cx={x(i)} cy={y(d.value)} r="3" fill="#7c3aed" />
          ))}

          {/* X labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={x(i)}
              y={cH + 17}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {d.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Icons
──────────────────────────────────────────────────────────── */

function ShieldIcon({ size = 28, variant = "teal" }: { size?: number; variant?: "teal" | "white" }) {
  const outer = variant === "white" ? "white" : "#064e3b";
  const inner = variant === "white" ? "rgba(255,255,255,0.65)" : "#0d9488";
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 3L5 8.5V17C5 24.18 10.64 30.9 18 33C25.36 30.9 31 24.18 31 17V8.5L18 3Z" fill={outer} />
      <path d="M18 6L8 10.8V17C8 23.12 12.56 28.78 18 30.6C23.44 28.78 28 23.12 28 17V10.8L18 6Z" fill={inner} />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HomeNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function EventsNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function AgendaNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}

function SettingsNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LogoutNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

"use client";

import { useState } from "react";

import type { EventSummary } from "./types";
import { CreateEventModal } from "./create-event-modal";
import { DashboardShell } from "./dashboard-shell";
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
  const [modal, setModal] = useState<ModalState>("none");
  const [selectedEvent, setSelectedEvent] = useState<EventSummary>(SAMPLE_EVENTS[0]);

  function openDetail(event: EventSummary) {
    setSelectedEvent(event);
    setModal("event-detail");
  }

  return (
    <DashboardShell activeNav="home">
      <>
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-6">
          <div className="flex h-48 overflow-hidden rounded-xl shadow-sm">
            <div className="flex flex-1 items-center justify-center bg-gray-300">
              <span className="text-xs text-gray-400">bannerVoluntarios.jpg</span>
            </div>
            <div className="flex w-72 flex-shrink-0 flex-col items-start justify-center gap-3 bg-[#064e3b] p-7">
              <p className="text-sm font-bold leading-snug text-white">
                Você sabia que pode criar seu próprio evento?
              </p>
              <p className="text-xs text-white/70">Seja mudança, comece um movimento!</p>
              <button
                type="button"
                onClick={() => setModal("create-event")}
                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Criar evento
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="text-base font-semibold text-brand-teal">
                Oportunidades recomendadas para você
              </h2>

              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Pesquise por evento, ONG ou habilidade"
                  className="flex-1 text-sm text-gray-500 outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-3">
                {SAMPLE_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="flex overflow-hidden rounded-xl bg-white shadow-sm"
                  >
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
                        type="button"
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

            <div className="flex w-64 flex-shrink-0 flex-col gap-3">
              <h2 className="text-base font-semibold text-brand-teal">Meu impacto</h2>
              <ImpactChart data={CHART_DATA} />
            </div>
          </div>
        </main>

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
      </>
    </DashboardShell>
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
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <g transform={`translate(${pad.left},${pad.top})`}>
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
              <text x="-5" y={y(v) + 3.5} textAnchor="end" fontSize="9" fill="#9ca3af">
                {v > 0 ? `${v / 10}k` : "0"}
              </text>
            </g>
          ))}

          <path d={area} fill="url(#areaGrad)" />

          <path
            d={line}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => (
            <circle key={d.label} cx={x(i)} cy={y(d.value)} r="3" fill="#7c3aed" />
          ))}

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

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

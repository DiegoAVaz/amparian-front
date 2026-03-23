"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateEventModal } from "@/components/dashboard/create-event-modal";
import { PublishErrorModal } from "@/components/dashboard/publish-error-modal";
import { PublishSuccessModal } from "@/components/dashboard/publish-success-modal";

import type { EventTimeFilter } from "./my-events-data";
import { listOrganizerEvents } from "./my-events-data";

type ModalState = "none" | "create-event" | "publish-success" | "publish-error";

const TABS: { id: EventTimeFilter; label: string }[] = [
  { id: "upcoming", label: "Próximos" },
  { id: "past", label: "Passados" },
  { id: "ongoing", label: "No momento" },
];

export function MyEventsList() {
  const [tab, setTab] = useState<EventTimeFilter>("upcoming");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>("none");

  const events = useMemo(() => listOrganizerEvents(tab), [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, query]);

  return (
    <DashboardShell activeNav="events">
      <>
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold text-brand-teal">Meus Eventos</h1>
            <button
              type="button"
              onClick={() => setModal("create-event")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600 sm:w-auto"
            >
              <span className="text-lg leading-none">+</span>
              Criar Evento
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    "relative px-4 pb-3 text-sm font-medium transition-colors",
                    tab === t.id
                      ? "text-brand-teal"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-teal" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-80">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar eventos..."
                className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyEventsState />
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:flex-row"
                >
                  <div
                    className={`flex h-32 w-full flex-shrink-0 bg-gradient-to-br sm:h-32 sm:w-44 ${event.imageClassName}`}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-brand-teal">{event.title}</h2>
                    </div>
                    <Link
                      href={`/home/meus-eventos/${event.id}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-teal-hover sm:w-auto sm:flex-shrink-0"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {modal === "create-event" && (
          <CreateEventModal
            onClose={() => setModal("none")}
            onPublish={() => setModal("publish-success")}
            onError={() => setModal("publish-error")}
          />
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
      className="flex-shrink-0 text-gray-400"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EmptyEventsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-12 text-center sm:flex-row sm:items-start sm:justify-between sm:px-10 sm:text-left">
      <div className="max-w-md space-y-2">
        <p className="text-base font-semibold text-brand-teal">Nenhum evento por aqui</p>
        <p className="text-sm text-gray-600">
          Não há eventos para mostrar nesta aba. Que tal criar um novo evento ou conferir outro
          período?
        </p>
      </div>
      <MascotIllustration />
    </div>
  );
}

function MascotIllustration() {
  return (
    <div className="relative flex w-full max-w-[200px] flex-col items-center">
      <div className="absolute -right-2 top-0 max-w-[140px] rounded-2xl rounded-bl-none bg-white px-3 py-2 text-center text-xs font-medium text-gray-700 shadow-md">
        Ops! Nada por aqui ainda.
      </div>
      <svg viewBox="0 0 120 140" className="h-36 w-28 text-emerald-500" aria-hidden>
        <ellipse cx="60" cy="120" rx="40" ry="8" fill="currentColor" opacity="0.15" />
        <path
          d="M60 20c-22 0-40 18-40 40v28c0 6 5 11 11 11h58c6 0 11-5 11-11V60c0-22-18-40-40-40z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="45" cy="55" r="6" fill="white" />
        <circle cx="75" cy="55" r="6" fill="white" />
        <circle cx="47" cy="56" r="3" fill="#064e3b" />
        <circle cx="77" cy="56" r="3" fill="#064e3b" />
        <path
          d="M48 78c8 6 16 6 24 0"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="60" cy="105" rx="18" ry="10" fill="#34d399" opacity="0.5" />
      </svg>
    </div>
  );
}

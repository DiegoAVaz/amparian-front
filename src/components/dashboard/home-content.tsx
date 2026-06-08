"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  SearchInput,
} from "@/components/ui";
import {
  type OrganizerEventDetail,
  type UserStats,
  getMyProfile,
  getMyStats,
  getPublicEvents,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

import type { EventSummary } from "./types";
import { CreateEventModal } from "./create-event-modal";
import { DashboardShell } from "./dashboard-shell";
import { EventDetailModal } from "./event-detail-modal";
import { PublishSuccessModal } from "./publish-success-modal";
import { PublishErrorModal } from "./publish-error-modal";

type ModalState = "none" | "create-event" | "event-detail" | "publish-success" | "publish-error";

export function HomeContent() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>("none");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [savedEvent, setSavedEvent] = useState<OrganizerEventDetail | null>(null);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [profile, nextStats] = await Promise.all([getMyProfile(), getMyStats()]);
        if (!cancelled) {
          setUserName(profile.publicOrganizationName || profile.name);
          setStats(nextStats);
        }
      } catch {
        /* dashboard can still load events */
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError("");
      try {
        const nextEvents = await getPublicEvents(query);
        if (!cancelled) {
          setEvents(nextEvents);
          setSelectedEvent((current) => {
            if (current && nextEvents.some((event) => event.id === current.id)) return current;
            return nextEvents[0] ?? null;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar os eventos.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function openDetail(event: EventSummary) {
    setSelectedEvent(event);
    setModal("event-detail");
  }

  function handleSaved(event: OrganizerEventDetail, action: "draft" | "published") {
    setSavedEvent(event);
    void refreshEvents();
    setModal(action === "published" ? "publish-success" : "none");
  }

  async function refreshEvents() {
    try {
      const nextEvents = await getPublicEvents(query);
      setEvents(nextEvents);
    } catch {
      /* keep current UI */
    }
  }

  const statCards = stats
    ? [
        { label: "Horas doadas", value: stats.hoursDonated },
        { label: "Causas apoiadas", value: stats.causesSupported },
        { label: "Eventos frequentados", value: stats.eventsAttended },
        { label: "Eventos criados", value: stats.eventsCreated },
      ]
    : [];

  return (
    <DashboardShell activeNav="home">
      <>
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">
          <div className="flex min-h-[12rem] flex-col overflow-hidden rounded-xl shadow-sm sm:min-h-0 sm:h-48 sm:flex-row">
            <div className="flex min-h-[8rem] flex-1 items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700 px-6 text-center sm:min-h-0">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Comunidade em ação
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  Descubra novas causas para apoiar e crie seu próprio movimento.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-shrink-0 flex-col items-start justify-center gap-3 bg-[#064e3b] p-5 sm:w-72 sm:p-7">
              <p className="text-sm font-bold leading-snug text-white">
                Você sabia que pode criar seu próprio evento?
              </p>
              <p className="text-xs text-white/70">Seja mudança, comece um movimento!</p>
              <Button
                type="button"
                onClick={() => setModal("create-event")}
                variant="success"
                size="sm"
              >
                Criar evento
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-brand-teal">
                  Oportunidades abertas para você
                </h2>
                {userName && <span className="text-xs text-gray-500">por {userName}</span>}
              </div>

              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery("")}
                placeholder="Pesquise por evento, ONG ou habilidade"
              />

              {loading ? (
                <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                  Carregando eventos...
                </p>
              ) : error ? (
                <p className="rounded-xl bg-red-50 px-4 py-8 text-center text-sm text-red-600 shadow-sm">
                  {error}
                </p>
              ) : events.length === 0 ? (
                <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                  Nenhum evento encontrado no momento.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm sm:flex-row"
                    >
                      <div className="flex h-32 w-full flex-shrink-0 items-center justify-center bg-gray-200 sm:h-auto sm:w-28">
                        {event.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="px-1 text-center text-[9px] text-gray-400">Sem capa</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-teal">{event.title}</p>
                          <p className="text-xs text-gray-400">{event.org}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(event.startsAt).toLocaleDateString("pt-BR")} •{" "}
                            {event.isRemote ? "Remoto" : event.locationName ?? "Local a confirmar"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => openDetail(event)}
                          className="w-full shrink-0 sm:w-auto"
                          size="sm"
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex w-full flex-shrink-0 flex-col gap-3 lg:w-80">
              <h2 className="text-base font-semibold text-brand-teal">Meu impacto</h2>
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((item) => (
                  <div key={item.label} className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-2xl font-bold text-brand-teal">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                  </div>
                ))}
                {statCards.length === 0 && (
                  <div className="col-span-2 rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                    Não foi possível carregar seus indicadores agora.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {modal === "create-event" && (
          <CreateEventModal
            onClose={() => setModal("none")}
            onSaved={handleSaved}
            onError={(message) => {
              setPublishError(message);
              setModal("publish-error");
            }}
          />
        )}
        {modal === "event-detail" && selectedEvent && (
          <EventDetailModal event={selectedEvent} onClose={() => setModal("none")} />
        )}
        {modal === "publish-success" && (
          <PublishSuccessModal
            onClose={() => setModal("none")}
            eventTitle={savedEvent?.title}
            eventOrg={userName ?? undefined}
            eventDate={savedEvent ? new Date(savedEvent.startsAt).toLocaleDateString("pt-BR") : null}
            onViewEvent={() => savedEvent && router.push(`/home/meus-eventos/${savedEvent.id}`)}
          />
        )}
        {modal === "publish-error" && (
          <PublishErrorModal
            onClose={() => setModal("none")}
            onRetry={() => setModal("create-event")}
            message={publishError}
          />
        )}
      </>
    </DashboardShell>
  );
}

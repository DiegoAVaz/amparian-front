"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { IconButton } from "@/components/ui";
import { type AgendaItem, getAgenda } from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

import { DashboardShell } from "./dashboard-shell";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function useCalendarCells(year: number, month: number) {
  return useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const cells: { day: number; inMonth: boolean; muted: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      cells.push({ day: prevDays - i, inMonth: false, muted: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, muted: false });
    }
    const tail = 42 - cells.length;
    for (let d = 1; d <= tail; d++) {
      cells.push({ day: d, inMonth: false, muted: true });
    }
    return cells.slice(0, 42);
  }, [year, month]);
}

export function AgendaContent() {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [events, setEvents] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cells = useCalendarCells(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const monthNameCap = capitalize(
    new Date(cursor.y, cursor.m, 1).toLocaleDateString("pt-BR", { month: "long" }),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setLoading(true);
      setError("");
      try {
        const nextEvents = await getAgenda(cursor.y, cursor.m + 1);
        if (!cancelled) setEvents(nextEvents);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar a agenda.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAgenda();
    return () => {
      cancelled = true;
    };
  }, [cursor.y, cursor.m]);

  const eventDays = useMemo(
    () =>
      new Set(
        events.map((event) => {
          const date = new Date(event.startsAt);
          return date.getDate();
        }),
      ),
    [events],
  );

  function prevMonth() {
    setCursor((c) => {
      const d = new Date(c.y, c.m - 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function nextMonth() {
    setCursor((c) => {
      const d = new Date(c.y, c.m + 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function isEventDay(day: number, inMonth: boolean) {
    if (!inMonth) return false;
    return eventDays.has(day);
  }

  return (
    <DashboardShell activeNav="agenda">
      <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">
        <h1 className="text-xl font-bold text-brand-teal">Agenda</h1>

        <div className="flex flex-1 flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-sm text-gray-700">
              Você tem <span className="font-semibold text-brand-teal">{events.length}</span> eventos no
              mês de {monthNameCap}.
            </p>

            {loading ? (
              <p className="rounded-xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-500">
                Carregando agenda...
              </p>
            ) : error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                {error}
              </p>
            ) : events.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 bg-white/80 px-4 py-8 text-center text-sm text-gray-500">
                Nenhum evento listado para este mês.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((ev, index) => (
                  <div
                    key={ev.eventId}
                    className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:flex-row"
                  >
                    <div
                      className={`h-32 w-full flex-shrink-0 bg-gradient-to-br sm:h-32 sm:w-44 ${
                        index % 2 === 0 ? "from-teal-600 to-cyan-500" : "from-emerald-600 to-teal-400"
                      }`}
                      aria-hidden
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{ev.title}</p>
                        <p className="text-sm text-gray-500">{ev.org}</p>
                        <p className="text-xs text-gray-400">{ev.dayLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full flex-shrink-0 xl:w-[380px]">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <IconButton
                  type="button"
                  icon={<ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />}
                  label="Mês anterior"
                  onClick={prevMonth}
                  size="sm"
                  variant="ghost"
                />
                <span className="text-base font-bold capitalize text-gray-900">{monthLabel}</span>
                <IconButton
                  type="button"
                  icon={<ChevronRight size={16} strokeWidth={2} aria-hidden="true" />}
                  label="Próximo mês"
                  onClick={nextMonth}
                  size="sm"
                  variant="ghost"
                />
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-0.5 text-center text-xs sm:gap-1 sm:text-sm">
                {cells.map((cell, i) => {
                  const highlighted = isEventDay(cell.day, cell.inMonth);
                  return (
                    <div
                      key={`${cell.day}-${i}`}
                      className={[
                        "flex h-8 items-center justify-center rounded-full sm:h-9",
                        cell.muted ? "text-gray-300" : "text-gray-800",
                        highlighted ? "bg-brand-teal font-semibold text-white" : "",
                      ].join(" ")}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

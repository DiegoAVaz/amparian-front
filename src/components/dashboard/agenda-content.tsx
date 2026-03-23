"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardShell } from "./dashboard-shell";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const AGENDA_EVENTS = [
  {
    id: "1",
    title: "Mutirão de limpeza",
    org: "Ong Guardiões do BEM",
    dayLabel: "07 de abril",
    imageClass: "from-teal-600 to-cyan-500",
  },
  {
    id: "2",
    title: "Instrutor Voluntário",
    org: "Ong Saúde+",
    dayLabel: "24 de abril",
    imageClass: "from-emerald-600 to-teal-400",
  },
  {
    id: "3",
    title: "Reunião de captação",
    org: "Amparian",
    dayLabel: "27 de abril",
    imageClass: "from-sky-600 to-blue-400",
  },
  {
    id: "4",
    title: "Workshop de voluntariado",
    org: "Ong Guardiões do BEM",
    dayLabel: "29 de abril",
    imageClass: "from-amber-600 to-orange-500",
  },
];

/** Dias com evento em abril/2026 (apenas para o mock do Figma) */
const EVENT_DAYS_APR_2026 = new Set([7, 24, 27, 29]);

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
  const now = new Date(2026, 3, 1);
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const cells = useCalendarCells(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const monthNameCap = capitalize(
    new Date(cursor.y, cursor.m, 1).toLocaleDateString("pt-BR", { month: "long" }),
  );
  const isApril2026 = cursor.y === 2026 && cursor.m === 3;
  const visibleEvents = isApril2026 ? AGENDA_EVENTS : [];
  const eventCountThisMonth = visibleEvents.length;

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
    return cursor.y === 2026 && cursor.m === 3 && EVENT_DAYS_APR_2026.has(day);
  }

  return (
    <DashboardShell activeNav="agenda">
      <main className="flex flex-1 flex-col gap-6 overflow-auto p-6">
        <h1 className="text-xl font-bold text-brand-teal">Agenda</h1>

        <div className="flex flex-1 flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-sm text-gray-700">
              Você tem{" "}
              <span className="font-semibold text-brand-teal">{eventCountThisMonth}</span> eventos no
              mês de {monthNameCap}.
            </p>

            <div className="flex flex-col gap-3">
              {visibleEvents.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 bg-white/80 px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum evento listado para este mês.
                </p>
              )}
              {visibleEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <div
                    className={`h-28 w-32 flex-shrink-0 bg-gradient-to-br sm:h-32 sm:w-44 ${ev.imageClass}`}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{ev.title}</p>
                      <p className="text-sm text-gray-500">{ev.org}</p>
                      <p className="text-xs text-gray-400">{ev.dayLabel}</p>
                    </div>
                    <Link
                      href="/home/em-breve"
                      className="inline-flex flex-shrink-0 items-center justify-center rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-teal-hover"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex-shrink-0 xl:w-[380px]">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft />
                </button>
                <span className="text-base font-bold capitalize text-gray-900">{monthLabel}</span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Próximo mês"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
                {cells.map((cell, i) => {
                  const highlighted = isEventDay(cell.day, cell.inMonth);
                  return (
                    <div
                      key={`${cell.day}-${i}`}
                      className={[
                        "flex h-9 items-center justify-center rounded-full text-sm",
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

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

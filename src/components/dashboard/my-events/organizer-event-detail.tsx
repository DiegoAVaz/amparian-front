"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import type { OrganizerEventRecord, SubscriberRecord } from "./my-events-data";
import { getSubscribersForEvent } from "./my-events-data";
import { SubscriberProfileModal } from "./subscriber-profile-modal";

type Props = {
  event: OrganizerEventRecord;
};

export function OrganizerEventDetail({ event }: Props) {
  const [rows, setRows] = useState<SubscriberRecord[]>(() => getSubscribersForEvent(event.id));
  const [subscriberModal, setSubscriberModal] = useState<SubscriberRecord | null>(null);

  const exportCsv = useCallback(() => {
    const header = ["Nome", "Status", "E-mail", "Telefone", "Cidade/UF", "Data de Inscrição"];
    const lines = [header.join(";")];
    for (const r of rows) {
      lines.push(
        [r.name, r.status, r.email, r.phone, r.cityUf, r.registrationDate].map(csvEscape).join(";"),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${event.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [event.id, rows]);

  function removeSubscriber(id: string) {
    if (!confirm("Remover este inscrito do evento?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSubscriberModal((m) => (m?.id === id ? null : m));
  }

  return (
    <DashboardShell activeNav="events">
      <>
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-6">
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/home/meus-eventos" className="font-medium text-brand-teal hover:underline">
                  Meus Eventos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-gray-800">{event.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-xl font-bold text-brand-teal sm:max-w-xl">{event.title}</h1>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-teal-hover"
              >
                Gerenciar Inscritos
              </button>
              <button
                type="button"
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                Editar
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className={`h-48 w-full bg-gradient-to-r ${event.imageClassName} sm:h-56`} />
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-3xl text-sm leading-relaxed text-gray-700">{event.description}</p>
              <div className="flex flex-shrink-0 flex-col items-start gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</span>
                <span
                  className={[
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    event.statusLabel === "Encerrado"
                      ? "bg-gray-100 text-gray-700"
                      : event.statusLabel === "Em andamento"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-green-100 text-green-800",
                  ].join(" ")}
                >
                  {event.statusLabel}
                </span>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-brand-teal">Meus Inscritos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                        Nenhum inscrito ainda.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <td className="px-6 py-3 font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              row.status === "Confirmado"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800",
                            ].join(" ")}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSubscriberModal(row)}
                              className="rounded-lg p-2 text-brand-teal hover:bg-brand-teal/10"
                              aria-label={`Ver perfil de ${row.name}`}
                            >
                              <EyeIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSubscriber(row.id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              aria-label={`Remover ${row.name}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                Adicionar Inscrito
              </button>
            </div>
          </section>
        </main>

        {subscriberModal && (
          <SubscriberProfileModal
            subscriber={subscriberModal}
            onClose={() => setSubscriberModal(null)}
            onConfirmPresence={() => {
              const id = subscriberModal.id;
              setRows((prev) =>
                prev.map((r) =>
                  r.id === id ? { ...r, status: "Confirmado" as const } : r,
                ),
              );
              setSubscriberModal(null);
            }}
          />
        )}
      </>
    </DashboardShell>
  );
}

function csvEscape(value: string) {
  if (/[;"\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

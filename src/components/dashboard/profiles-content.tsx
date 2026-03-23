"use client";

import Link from "next/link";

import { DashboardShell } from "./dashboard-shell";

const STATS = [
  { label: "HORAS DOADAS", value: "48" },
  { label: "CAUSAS APOIADAS", value: "12" },
  { label: "EVENTOS FREQUENTADOS", value: "8" },
  { label: "EVENTOS CRIADOS", value: "2" },
];

const LAST_EVENTS = [
  {
    id: "1",
    title: "Mutirão de limpeza",
    org: "Ong Guardiões do BEM",
    imageClass: "from-teal-600 to-cyan-500",
  },
  {
    id: "2",
    title: "Instrutor Voluntário",
    org: "Ong Guardiões do BEM",
    imageClass: "from-emerald-600 to-teal-400",
  },
];

export function ProfilesContent() {
  return (
    <DashboardShell activeNav="profiles">
      <main className="flex flex-1 flex-col gap-8 overflow-auto p-6">
        <h1 className="text-xl font-bold text-brand-teal">Perfis</h1>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-4xl font-bold text-white">
                BP
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Nome</span>
                <input
                  readOnly
                  defaultValue="Bianca Pereira Leão"
                  className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-800"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Telefone</span>
                <input
                  readOnly
                  defaultValue="11460228922"
                  className="rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-800"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Descrição</span>
                <textarea
                  readOnly
                  rows={4}
                  defaultValue="Entusiasta na causa ambiental, criando mutirões e eventos de reflorestamento."
                  className="resize-y rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-800"
                />
              </label>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-brand-teal px-4 py-6 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-base font-bold text-brand-teal">Meus últimos eventos</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            {LAST_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div
                  className={`h-24 w-28 flex-shrink-0 bg-gradient-to-br sm:w-32 ${ev.imageClass}`}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col justify-center px-4 py-2">
                  <p className="truncate font-semibold text-gray-900">{ev.title}</p>
                  <p className="truncate text-sm text-gray-500">{ev.org}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/home/em-breve"
              className="inline-flex items-center justify-center rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
            >
              Ver meu histórico de eventos
            </Link>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link
                href="/home/configuracoes"
                className="inline-flex items-center justify-center rounded-lg border-2 border-brand-teal bg-white px-4 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal/5"
              >
                Editar perfil
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border-2 border-brand-teal bg-white px-4 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal/5"
              >
                Compartilhar perfil
              </button>
            </div>
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}

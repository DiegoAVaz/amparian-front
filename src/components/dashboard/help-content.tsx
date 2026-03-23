"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardShell } from "./dashboard-shell";

const CATEGORIES: { label: string; icon: ReactNode }[] = [
  { label: "Primeiros passos", icon: <IconFootprints /> },
  { label: "Gestão de eventos", icon: <IconCalendarGear /> },
  { label: "Assinatura e pagamentos", icon: <IconCard /> },
  { label: "Segurança e conduta", icon: <IconShield /> },
  { label: "Certificados e conquistas", icon: <IconRibbon /> },
];

export function HelpContent() {
  return (
    <DashboardShell activeNav="help">
      <main className="flex flex-1 flex-col gap-8 overflow-auto p-4 sm:gap-10 sm:p-6">
        <div className="text-center">
          <h1 className="text-lg font-bold text-brand-teal sm:text-xl">
            Olá, Bianca! Como podemos te ajudar hoje? 🌱
          </h1>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <SearchIcon />
            <input
              type="search"
              placeholder="Pesquise por termos como: 'meus eventos', 'fatura', 'certificados'..."
              className="flex-1 border-0 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href="/home/em-breve"
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-colors hover:border-brand-teal/30 hover:shadow-md"
            >
              <span className="text-brand-teal">{c.icon}</span>
              <span className="text-xs font-semibold leading-tight text-gray-800 sm:text-sm">
                {c.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-auto flex w-full max-w-4xl flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-8 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-brand-teal">Ainda precisa de uma mãozinha?</h2>
            <p className="max-w-xl text-sm text-gray-600">
              Nossa equipe está aqui para garantir que sua única preocupação seja mudar o mundo.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <a
              href="https://wa.me/5521999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full justify-center rounded-lg bg-brand-teal px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-teal-hover sm:px-5"
            >
              <span className="break-words">Falar com suporte no whatsapp</span>
            </a>
            <span className="text-xs text-gray-500">amparian.suporte@gmail.com</span>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="flex-shrink-0 text-gray-400"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconFootprints() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
      <path d="M20 20.5v.5a2 2 0 1 1-4 0v-.5c0-2.05 1.131-3.768 1.834-5.527a1.06 1.06 0 0 0 .163-.819C17.41 12.66 18 11.74 18 10c0-2.21-1.79-4-4-4-1.288 0-2.318.55-3.08 1.203" />
    </svg>
  );
}

function IconCalendarGear() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="15" r="2" />
      <path d="M12 13v-1M12 18v-1M14.5 14.5l.7-.7M10.2 16.8l.7-.7M14.5 17.5l.7.7M10.2 15.2l.7.7" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function IconRibbon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path d="M12 15v7M8 22h8" />
      <path d="M8 11h8" />
    </svg>
  );
}

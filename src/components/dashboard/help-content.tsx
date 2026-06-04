"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  CalendarCog,
  CreditCard,
  Footprints,
  Shield,
} from "lucide-react";

import { SearchInput } from "@/components/ui";

import { DashboardShell } from "./dashboard-shell";

const CATEGORIES: { label: string; icon: ReactNode }[] = [
  {
    label: "Primeiros passos",
    icon: <Footprints size={28} strokeWidth={2} aria-hidden="true" />,
  },
  {
    label: "Gestão de eventos",
    icon: <CalendarCog size={28} strokeWidth={2} aria-hidden="true" />,
  },
  {
    label: "Assinatura e pagamentos",
    icon: <CreditCard size={28} strokeWidth={2} aria-hidden="true" />,
  },
  {
    label: "Segurança e conduta",
    icon: <Shield size={28} strokeWidth={2} aria-hidden="true" />,
  },
  {
    label: "Certificados e conquistas",
    icon: <Award size={28} strokeWidth={2} aria-hidden="true" />,
  },
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
          <SearchInput placeholder="Pesquise por termos como: 'meus eventos', 'fatura', 'certificados'..." />
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

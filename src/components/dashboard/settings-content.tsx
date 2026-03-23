"use client";

import Link from "next/link";
import { useState } from "react";

import { DashboardShell } from "./dashboard-shell";

type Plan = "basic" | "pro";

const PRO_FEATURES = [
  "Eventos ilimitados por mês",
  "Destaque nos resultados de busca",
  "Relatórios de impacto avançados",
  "Acesso à assistente com IA",
  "Suporte prioritário por WhatsApp",
];

const BASIC_FEATURES = [
  "Publicar 3 eventos gratuitos no mês",
  "Participar de eventos limitados",
];

export function SettingsContent() {
  const [plan, setPlan] = useState<Plan>("basic");
  const [nome, setNome] = useState("Bianca Pereira Leão");
  const [telefone, setTelefone] = useState("1140028922");
  const [descricao, setDescricao] = useState(
    "Entusiasta na causa ambiental, criando mutirões e eventos de reflorestamento.",
  );

  return (
    <DashboardShell activeNav="settings">
      <main className="flex flex-1 flex-col gap-8 overflow-auto p-6">
        <h1 className="text-xl font-bold text-brand-teal">Configurações</h1>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-3xl font-bold text-white">
                BP
              </div>
              <button
                type="button"
                className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-teal-hover"
              >
                Alterar foto
              </button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Nome</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Telefone</span>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Descrição</span>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                />
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-hover"
                >
                  Salvar detalhes da conta
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Segurança e acesso</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/home/em-breve" className="text-brand-teal underline hover:no-underline">
                  Alterar senha
                </Link>
              </li>
              <li>
                <Link href="/home/em-breve" className="text-brand-teal underline hover:no-underline">
                  Alterar email
                </Link>
              </li>
              <li>
                <Link href="/home/em-breve" className="font-medium text-red-600 hover:underline">
                  Desejo encerrar minha conta
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Cartões e pagamentos</h2>
            <Link
              href="/home/em-breve"
              className="mt-3 inline-block text-sm text-brand-teal underline hover:no-underline"
            >
              Gerenciar cartão cadastrado
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Linguagem</h2>
            <Link
              href="/home/em-breve"
              className="mt-3 inline-block text-sm text-brand-teal underline hover:no-underline"
            >
              Gerenciar Idioma
            </Link>
          </section>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500">Visualização do plano (demo)</span>
            <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPlan("basic")}
                className={[
                  "rounded-md px-3 py-1.5 font-semibold",
                  plan === "basic" ? "bg-brand-teal text-white" : "text-gray-600",
                ].join(" ")}
              >
                Básico
              </button>
              <button
                type="button"
                onClick={() => setPlan("pro")}
                className={[
                  "rounded-md px-3 py-1.5 font-semibold",
                  plan === "pro" ? "bg-brand-teal text-white" : "text-gray-600",
                ].join(" ")}
              >
                Pro
              </button>
            </div>
          </div>

          {plan === "basic" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold text-gray-900">Seu plano atual: Básico</p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
                  {BASIC_FEATURES.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Plano Pro</p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
                  {PRO_FEATURES.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2">
                <button
                  type="button"
                  className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-600"
                >
                  Faça upgrade para Pro
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-gray-900">Seu Plano Pro</p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
                {PRO_FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg border-2 border-brand-teal bg-white px-5 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal/5"
                >
                  Gerenciar plano
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </DashboardShell>
  );
}

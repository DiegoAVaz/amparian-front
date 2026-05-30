"use client";

import { useEffect, useMemo, useState } from "react";

import { FormField, LinkButton, Textarea, TextInput } from "@/components/ui";
import {
  type MyRegistration,
  type UserProfile,
  type UserStats,
  getMyProfile,
  getMyRegistrations,
  getMyStats,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

import { DashboardShell } from "./dashboard-shell";

export function ProfilesContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [nextProfile, nextStats, nextRegistrations] = await Promise.all([
          getMyProfile(),
          getMyStats(),
          getMyRegistrations(2),
        ]);

        if (!cancelled) {
          setProfile(nextProfile);
          setStats(nextStats);
          setRecentEvents(nextRegistrations);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar o perfil.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => getInitials(profile?.name ?? ""), [profile?.name]);
  const statCards = stats
    ? [
        { label: "HORAS DOADAS", value: String(stats.hoursDonated) },
        { label: "CAUSAS APOIADAS", value: String(stats.causesSupported) },
        { label: "EVENTOS FREQUENTADOS", value: String(stats.eventsAttended) },
        { label: "EVENTOS CRIADOS", value: String(stats.eventsCreated) },
      ]
    : [];

  return (
    <DashboardShell activeNav="profiles">
      <main className="flex flex-1 flex-col gap-8 overflow-auto p-4 sm:p-6">
        <h1 className="text-xl font-bold text-brand-teal">Perfis</h1>

        {loading ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Carregando perfil...</p>
          </section>
        ) : error ? (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-red-600">{error}</p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-4xl font-bold text-white">
                    {initials}
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <ReadOnlyField label="Nome" value={profile?.name ?? ""} />
                  <ReadOnlyField label="Telefone" value={profile?.phone ?? "Não informado"} />
                  <ReadOnlyField
                    label="Organização pública"
                    value={profile?.publicOrganizationName ?? "Não informado"}
                  />
                  <ReadOnlyField
                    label="Cidade / UF"
                    value={[profile?.city, profile?.state].filter(Boolean).join(" / ") || "Não informado"}
                  />
                  <ReadOnlyTextArea
                    label="Descrição"
                    value={profile?.bio ?? "Você ainda não adicionou uma descrição."}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl bg-brand-teal px-4 py-6 text-center shadow-sm">
                  <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 sm:text-xs">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <section>
              <h2 className="mb-4 text-base font-bold text-brand-teal">Meus últimos eventos</h2>
              {recentEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
                  Você ainda não tem eventos recentes na sua agenda.
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {recentEvents.map((registration, index) => (
                    <div
                      key={registration.id}
                      className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                    >
                      <div
                        className={`h-24 w-28 flex-shrink-0 bg-gradient-to-br sm:w-32 ${
                          index % 2 === 0 ? "from-teal-600 to-cyan-500" : "from-emerald-600 to-teal-400"
                        }`}
                        aria-hidden
                      />
                      <div className="flex min-w-0 flex-col justify-center px-4 py-2">
                        <p className="truncate font-semibold text-gray-900">
                          {registration.event.title}
                        </p>
                        <p className="truncate text-sm text-gray-500">{registration.event.org}</p>
                        <p className="truncate text-xs text-gray-400">
                          {new Date(registration.event.startsAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <LinkButton
                  href="/home/agenda"
                  className="w-full sm:w-auto"
                  variant="success"
                >
                  Ver minha agenda
                </LinkButton>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                  <LinkButton
                    href="/home/configuracoes"
                    className="w-full sm:w-auto"
                    variant="secondary"
                  >
                    Editar perfil
                  </LinkButton>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </DashboardShell>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <FormField label={label}>
      <TextInput
        readOnly
        value={value}
        className="bg-gray-50/80 text-gray-800"
      />
    </FormField>
  );
}

function ReadOnlyTextArea({ label, value }: { label: string; value: string }) {
  return (
    <FormField label={label}>
      <Textarea
        readOnly
        rows={4}
        value={value}
        className="bg-gray-50/80 text-gray-800"
      />
    </FormField>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AM";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

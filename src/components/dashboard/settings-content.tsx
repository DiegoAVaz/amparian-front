"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { setAuthCookie, updateStoredUser } from "@/lib/auth";
import { getMyProfile, updateMyProfile, type UserProfile } from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

import { DashboardShell } from "./dashboard-shell";

type FormState = {
  name: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  publicOrganizationName: string;
  avatarUrl: string;
};

export function SettingsContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const nextProfile = await getMyProfile();
        if (!cancelled) {
          setProfile(nextProfile);
          setForm({
            name: nextProfile.name,
            phone: nextProfile.phone ?? "",
            city: nextProfile.city ?? "",
            state: nextProfile.state ?? "",
            bio: nextProfile.bio ?? "",
            publicOrganizationName: nextProfile.publicOrganizationName ?? "",
            avatarUrl: nextProfile.avatarUrl ?? "",
          });
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

  const initials = useMemo(() => getInitials(form.name || profile?.name || ""), [form.name, profile]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const nextProfile = await updateMyProfile({
        name: form.name.trim(),
        phone: nullable(form.phone),
        city: nullable(form.city),
        state: nullable(form.state)?.toUpperCase() ?? null,
        bio: nullable(form.bio),
        publicOrganizationName: nullable(form.publicOrganizationName),
        avatarUrl: nullable(form.avatarUrl),
      });

      setProfile(nextProfile);
      updateStoredUser({ name: nextProfile.name, email: nextProfile.email });
      setAuthCookie(nextProfile.name);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar suas alterações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell activeNav="settings">
      <main className="flex flex-1 flex-col gap-8 overflow-auto p-4 sm:p-6">
        <h1 className="text-xl font-bold text-brand-teal">Configurações</h1>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Carregando perfil...</p>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-3xl font-bold text-white">
                  {initials}
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-500">Nome</span>
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputCls}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray-500">Telefone</span>
                    <input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray-500">Email</span>
                    <input
                      value={profile?.email ?? ""}
                      readOnly
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray-500">Cidade</span>
                    <input
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-gray-500">UF</span>
                    <input
                      maxLength={2}
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-gray-500">Nome público da organização</span>
                    <input
                      value={form.publicOrganizationName}
                      onChange={(e) => updateField("publicOrganizationName", e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-gray-500">URL do avatar</span>
                    <input
                      value={form.avatarUrl}
                      onChange={(e) => updateField("avatarUrl", e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-500">Descrição</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                    className={`${inputCls} resize-y`}
                  />
                </label>

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
                {success && (
                  <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
                )}

                <div className="flex pt-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || loading}
                    className="w-full rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-hover disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? "Salvando..." : "Salvar detalhes da conta"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Plano atual</h2>
            <p className="mt-3 text-sm text-gray-700">
              Seu plano é <span className="font-semibold">{profile?.plan === "pro" ? "Pro" : "Básico"}</span>.
            </p>
            <Link
              href="/home/em-breve"
              className="mt-3 inline-block text-sm text-brand-teal underline hover:no-underline"
            >
              Gerenciar plano
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Idioma</h2>
            <Link
              href="/home/em-breve"
              className="mt-3 inline-block text-sm text-brand-teal underline hover:no-underline"
            >
              Gerenciar idioma
            </Link>
          </section>
        </div>
      </main>
    </DashboardShell>
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }
}

const inputCls =
  "rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal";

const emptyForm: FormState = {
  name: "",
  phone: "",
  city: "",
  state: "",
  bio: "",
  publicOrganizationName: "",
  avatarUrl: "",
};

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AM";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

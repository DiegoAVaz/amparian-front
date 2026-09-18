"use client";

import { useEffect, useState } from "react";

import {
  Avatar,
  Button,
  FormAlert,
  FormField,
  MutedUnderlineLink,
  Textarea,
  TextInput,
} from "@/components/ui";
import { updateStoredUser } from "@/lib/auth";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/lib/amparian-api";
import {
  ApiError,
  getApiFormError,
  type ApiErrorFieldMap,
  type ApiFieldErrors,
} from "@/lib/api";
import {
  formatBrazilianPhone,
  getBrazilianPhoneDigits,
  isValidBrazilianPhone,
} from "@/lib/phone";

import { AvatarUploadModal } from "./avatar-upload-modal";
import { DashboardShell } from "./dashboard-shell";

type FormState = {
  name: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  publicOrganizationName: string;
};

type ProfileField = keyof FormState;

const PROFILE_FIELD_MAP: ApiErrorFieldMap<ProfileField> = {
  public_organization_name: "publicOrganizationName",
  publicOrganizationName: "publicOrganizationName",
};

export function SettingsContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<ProfileField>>(
    {},
  );
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
            phone: nextProfile.phone
              ? formatBrazilianPhone(nextProfile.phone)
              : "",
            city: nextProfile.city ?? "",
            state: nextProfile.state ?? "",
            bio: nextProfile.bio ?? "",
            publicOrganizationName: nextProfile.publicOrganizationName ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar o perfil.",
          );
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

  async function handleSave() {
    const localErrors = getLocalFieldErrors();
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setSuccess("");
      setError("Revise os campos destacados antes de salvar.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const nextProfile = await updateMyProfile({
        name: form.name.trim(),
        phone: nullable(getBrazilianPhoneDigits(form.phone)),
        city: nullable(form.city),
        state: nullable(form.state)?.toUpperCase() ?? null,
        bio: nullable(form.bio),
        publicOrganizationName: nullable(form.publicOrganizationName),
      });

      setProfile(nextProfile);
      setForm((current) => ({
        ...current,
        phone: nextProfile.phone ? formatBrazilianPhone(nextProfile.phone) : "",
      }));
      updateStoredUser({ name: nextProfile.name, email: nextProfile.email });

      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      const { fieldErrors: nextFieldErrors, formError } =
        getApiFormError<ProfileField>(
          err,
          "Não foi possível salvar suas alterações.",
          { fieldMap: PROFILE_FIELD_MAP },
        );
      setFieldErrors(nextFieldErrors);
      setError(formError);
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
              <div className="flex w-full flex-col items-center gap-2 lg:w-auto">
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  disabled={saving}
                  className="group relative cursor-pointer rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Alterar foto de perfil"
                >
                  <Avatar
                    name={form.name || profile?.name || ""}
                    src={profile?.avatarUrl}
                    size="md"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Alterar
                  </span>
                </button>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <FormField label="Nome" required error={fieldErrors.name}>
                  <TextInput
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={fieldErrors.name}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Telefone" error={fieldErrors.phone}>
                    <TextInput
                      value={form.phone}
                      onChange={(e) => updatePhoneField(e.target.value)}
                      inputMode="numeric"
                      placeholder="(DDD) xxxxx-xxxx ou (DDD) xxxx-xxxx"
                      error={fieldErrors.phone}
                    />
                  </FormField>
                  <FormField label="Email">
                    <TextInput
                      value={profile?.email ?? ""}
                      readOnly
                      className="bg-gray-50 text-gray-500"
                    />
                  </FormField>
                  <FormField label="Cidade" error={fieldErrors.city}>
                    <TextInput
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      error={fieldErrors.city}
                    />
                  </FormField>
                  <FormField label="UF" error={fieldErrors.state}>
                    <TextInput
                      maxLength={2}
                      value={form.state}
                      onChange={(e) =>
                        updateField("state", e.target.value.toUpperCase())
                      }
                      error={fieldErrors.state}
                    />
                  </FormField>
                  <FormField
                    label="Nome público da organização"
                    className="sm:col-span-2"
                    error={fieldErrors.publicOrganizationName}
                  >
                    <TextInput
                      value={form.publicOrganizationName}
                      onChange={(e) =>
                        updateField("publicOrganizationName", e.target.value)
                      }
                      error={fieldErrors.publicOrganizationName}
                    />
                  </FormField>
                </div>

                <FormField label="Descrição" error={fieldErrors.bio}>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                    error={fieldErrors.bio}
                  />
                </FormField>

                <FormAlert variant="error">{error}</FormAlert>
                <FormAlert variant="success">{success}</FormAlert>

                <div className="flex pt-2 sm:justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || loading}
                    className="w-full sm:w-auto"
                    loading={saving}
                    loadingLabel="Salvando..."
                  >
                    Salvar detalhes da conta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">
              Segurança e acesso
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <MutedUnderlineLink href="/home/em-breve">
                  Alterar senha
                </MutedUnderlineLink>
              </li>
              <li>
                <MutedUnderlineLink href="/home/em-breve">
                  Alterar email
                </MutedUnderlineLink>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Plano atual</h2>
            <p className="mt-3 text-sm text-gray-700">
              Seu plano é{" "}
              <span className="font-semibold">
                {profile?.plan === "pro" ? "Pro" : "Básico"}
              </span>
              .
            </p>
            <MutedUnderlineLink
              href="/home/em-breve"
              className="mt-3 inline-block"
            >
              Gerenciar plano
            </MutedUnderlineLink>
            <MutedUnderlineLink
              href="/home/configuracoes/cartoes"
              className="mt-2 block"
            >
              Gerenciar cartões
            </MutedUnderlineLink>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-brand-teal">Idioma</h2>
            <MutedUnderlineLink
              href="/home/em-breve"
              className="mt-3 inline-block"
            >
              Gerenciar idioma
            </MutedUnderlineLink>
          </section>
        </div>
      </main>

      {avatarModalOpen ? (
        <AvatarUploadModal
          name={form.name || profile?.name || ""}
          savedUrl={profile?.avatarUrl}
          onSaved={setProfile}
          onClose={() => setAvatarModalOpen(false)}
        />
      ) : null}
    </DashboardShell>
  );

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess("");
  }

  function updatePhoneField(value: string) {
    setForm((current) => ({ ...current, phone: value }));
    setFieldErrors((current) => ({
      ...current,
      phone:
        value.trim() && getBrazilianPhoneDigits(value).length > 11
          ? "Informe no máximo 11 dígitos para telefone ou celular."
          : undefined,
    }));
    setSuccess("");
  }

  function getLocalFieldErrors(): ApiFieldErrors<ProfileField> {
    const nextErrors: ApiFieldErrors<ProfileField> = {};
    if (!form.name.trim()) nextErrors.name = "Informe seu nome.";
    if (form.phone.trim() && !isValidBrazilianPhone(form.phone)) {
      nextErrors.phone =
        "Informe o telefone no formato (DDD) xxxxx-xxxx ou (DDD) xxxx-xxxx.";
    }
    if (form.state.trim() && form.state.trim().length !== 2) {
      nextErrors.state = "Informe a UF com 2 letras.";
    }
    return nextErrors;
  }
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  city: "",
  state: "",
  bio: "",
  publicOrganizationName: "",
};

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

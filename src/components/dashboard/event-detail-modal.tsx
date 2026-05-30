"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  Button,
  Checkbox,
  FormAlert,
  FormField,
  IconButton,
  TextInput,
} from "@/components/ui";
import {
  type PublicEventDetail,
  getPublicEvent,
  registerForPublicEvent,
} from "@/lib/amparian-api";
import {
  ApiError,
  getApiFormError,
  type ApiErrorFieldMap,
  type ApiFieldErrors,
} from "@/lib/api";

import type { EventSummary } from "./types";

type Props = {
  event: EventSummary;
  onClose: () => void;
};

type RegistrationField = "participantRole" | "agreedResponsibility";

const REGISTRATION_FIELD_MAP: ApiErrorFieldMap<RegistrationField> = {
  agreed: "agreedResponsibility",
  responsibility: "agreedResponsibility",
};

export function EventDetailModal({ event, onClose }: Props) {
  const [detail, setDetail] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [participantRole, setParticipantRole] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<RegistrationField>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const next = await getPublicEvent(event.id);
        if (!cancelled) setDetail(next);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar o evento.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  async function handleRegistration() {
    if (!agreed) {
      setFieldErrors({
        agreedResponsibility: "Você precisa aceitar o termo de responsabilidade.",
      });
      setError("");
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});
    setSuccess("");

    try {
      await registerForPublicEvent(event.id, {
        participantRole: participantRole.trim() || undefined,
        agreedResponsibility: true,
      });
      setSuccess("Inscrição realizada com sucesso.");
    } catch (err) {
      const {
        fieldErrors: nextFieldErrors,
        formError,
      } = getApiFormError<RegistrationField>(
        err,
        "Não foi possível concluir a inscrição.",
        { fieldMap: REGISTRATION_FIELD_MAP },
      );
      setFieldErrors(nextFieldErrors);
      setError(formError);
    } finally {
      setSubmitting(false);
    }
  }

  const data = detail ?? {
    ...event,
    description: event.summary,
    rulesTerms: null,
    organizerId: 0,
    endsAt: null,
    highlightSkill: null,
    types: [],
    requirements: [],
    computedStatus: "upcoming" as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:max-h-[90vh] md:rounded-2xl md:flex-row">
        <IconButton
          className="absolute right-3 top-3 z-10 bg-white/80"
          icon={<XIcon />}
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
        />

        <div className="flex h-40 w-full flex-shrink-0 items-center justify-center bg-gray-200 md:h-auto md:w-44">
          {data.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[10px] text-gray-400">Sem capa</span>
          )}
        </div>

        <div className="flex max-h-[min(60vh,28rem)] flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 md:max-h-[85vh]">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-brand-teal">
              {data.title}
            </h2>
            <p className="text-sm text-gray-400">{data.org}</p>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Carregando detalhes...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">{data.summary}</p>

              {data.description && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">O que você fará</p>
                  <p className="text-sm text-gray-600">{data.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon />
                  <span>{formatLongDate(data.startsAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LocationIcon />
                  <span>{data.isRemote ? "Remoto" : data.locationName ?? "Local a confirmar"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PersonIcon />
                  <span>{data.capacity ? `${data.capacity} vagas` : "Sem limite de vagas"}</span>
                </div>
              </div>

              {(data.highlightSkill || data.types.length > 0 || data.requirements.length > 0) && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-gray-700">Requisitos e habilidades</p>
                  <div className="flex flex-wrap gap-2">
                    {data.highlightSkill && <Badge>{data.highlightSkill}</Badge>}
                    {data.types.map((item) => (
                      <Badge key={item.code}>{item.label}</Badge>
                    ))}
                    {data.requirements.map((item) => (
                      <Badge key={item.code}>{item.label}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <FormField label="Papel no evento" error={fieldErrors.participantRole}>
                <TextInput
                  type="text"
                  value={participantRole}
                  onChange={(e) => {
                    setParticipantRole(e.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      participantRole: undefined,
                    }));
                  }}
                  placeholder="Ex: Voluntário, Designer, Instrutor"
                  error={fieldErrors.participantRole}
                />
              </FormField>

              <Checkbox
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setFieldErrors((current) => ({
                    ...current,
                    agreedResponsibility: undefined,
                  }));
                }}
                label="Li e concordo com o termo de responsabilidade do evento."
                error={fieldErrors.agreedResponsibility}
              />

              <FormAlert variant="error">{error}</FormAlert>
              <FormAlert variant="success">{success}</FormAlert>

              <Button
                type="button"
                disabled={
                  submitting ||
                  data.computedStatus === "past" ||
                  data.computedStatus === "draft" ||
                  data.computedStatus === "cancelled"
                }
                onClick={() => void handleRegistration()}
                fullWidth
                loading={submitting}
                loadingLabel="Enviando..."
                size="lg"
              >
                Quero participar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal">
      {children}
    </span>
  );
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

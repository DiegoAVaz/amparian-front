"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type EventFormInput,
  type LookupOption,
  type OrganizerEventDetail,
  createOrganizerEvent,
  getLookups,
  updateOrganizerEvent,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

type Props = {
  onClose: () => void;
  onSaved: (event: OrganizerEventDetail, action: "draft" | "published") => void;
  onError: (message: string) => void;
  initialEvent?: OrganizerEventDetail | null;
};

type FormState = {
  title: string;
  summary: string;
  description: string;
  rulesTerms: string;
  eventDate: string;
  eventTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  isRemote: boolean;
  capacity: string;
  coverImageUrl: string;
  highlightSkill: string;
  typeCodes: string[];
  requirementCodes: string[];
};

const EMPTY_FORM: FormState = {
  title: "",
  summary: "",
  description: "",
  rulesTerms: "",
  eventDate: "",
  eventTime: "",
  endDate: "",
  endTime: "",
  locationName: "",
  isRemote: false,
  capacity: "",
  coverImageUrl: "",
  highlightSkill: "",
  typeCodes: [],
  requirementCodes: [],
};

export function CreateEventModal({ onClose, onSaved, onError, initialEvent }: Props) {
  const [form, setForm] = useState<FormState>(() => mapEventToForm(initialEvent));
  const [loading, setLoading] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [error, setError] = useState("");
  const [eventTypeOptions, setEventTypeOptions] = useState<LookupOption[]>([]);
  const [requirementOptions, setRequirementOptions] = useState<LookupOption[]>([]);

  const title = initialEvent ? "Editar evento" : "Criar evento";
  const primaryLabel = initialEvent ? "Salvar e publicar" : "Publicar evento";

  const canSubmit = useMemo(
    () =>
      form.title.trim() &&
      form.summary.trim() &&
      form.eventDate &&
      form.eventTime &&
      form.typeCodes.length > 0,
    [form],
  );

  useEffect(() => {
    void loadLookups();
  }, []);

  async function handleSubmit(publish: boolean) {
    if (!canSubmit) {
      setError("Preencha título, resumo, data, horário e ao menos um tipo de evento.");
      return;
    }

    setError("");
    setLoading(true);

    const payload: EventFormInput = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: nullable(form.description),
      rulesTerms: nullable(form.rulesTerms),
      startsAt: combineDateTime(form.eventDate, form.eventTime),
      endsAt:
        form.endDate && form.endTime ? combineDateTime(form.endDate, form.endTime) : null,
      locationName: nullable(form.locationName),
      isRemote: form.isRemote,
      capacity: form.capacity.trim() ? Number(form.capacity) : null,
      coverImageUrl: nullable(form.coverImageUrl),
      highlightSkill: nullable(form.highlightSkill),
      typeCodes: form.typeCodes,
      requirementCodes: form.requirementCodes,
      publish,
    };

    try {
      const event = initialEvent
        ? await updateOrganizerEvent(initialEvent.id, payload)
        : await createOrganizerEvent(payload);
      onSaved(event, publish ? "published" : "draft");
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível salvar o evento agora.";
      setError(message);
      onError(message);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        <h2 className="mb-6 text-xl font-bold text-brand-teal">{title}</h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Field label="Título do evento *">
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Ex: Mutirão de limpeza na praia do Sal"
                className={inputCls}
              />
            </Field>

            <Field label="Resumo do evento *">
              <textarea
                rows={3}
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Descreva rapidamente o propósito do evento."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Descrição">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Detalhes completos para os voluntários."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Regras e termos">
              <textarea
                rows={3}
                value={form.rulesTerms}
                onChange={(e) => updateField("rulesTerms", e.target.value)}
                placeholder="Orientações de participação e responsabilidade."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Data e local *">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => updateField("eventDate", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => updateField("eventTime", e.target.value)}
                  className={`${inputCls} sm:w-32`}
                />
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={form.locationName}
                  onChange={(e) => updateField("locationName", e.target.value)}
                  placeholder="Local"
                  className={`${inputCls} flex-1`}
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.isRemote}
                    onChange={(e) => updateField("isRemote", e.target.checked)}
                    className="accent-brand-teal"
                  />
                  Remoto
                </label>
              </div>
            </Field>

            <Field label="Encerramento (opcional)">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className={inputCls}
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className={`${inputCls} sm:w-32`}
                />
              </div>
            </Field>

            <Field label="Requisitos">
              <CheckboxGroup
                options={requirementOptions}
                values={form.requirementCodes}
                onToggle={(code) => toggleArrayValue("requirementCodes", code)}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Quantidade de vagas">
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Habilidade em destaque">
                <input
                  type="text"
                  value={form.highlightSkill}
                  onChange={(e) => updateField("highlightSkill", e.target.value)}
                  placeholder="Ex: Consciência ambiental"
                  className={inputCls}
                />
              </Field>
              <Field label="URL da capa">
                <input
                  type="url"
                  value={form.coverImageUrl}
                  onChange={(e) => updateField("coverImageUrl", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="w-full flex-shrink-0 border-t border-gray-100 pt-4 lg:w-56 lg:border-t-0 lg:pt-0">
            <p className="mb-2 text-xs font-medium text-brand-teal">Tipo de evento *</p>
            {loadingLookups && (
              <p className="mb-2 text-xs text-gray-500">Carregando opções...</p>
            )}
            <CheckboxGroup
              options={eventTypeOptions}
              values={form.typeCodes}
              onToggle={(code) => toggleArrayValue("typeCodes", code)}
              className="max-h-72 overflow-y-auto pr-1"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSubmit(true)}
            className="w-full rounded-lg bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Salvando..." : primaryLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSubmit(false)}
            className="text-xs text-gray-500 hover:underline disabled:opacity-60"
          >
            Salvar rascunho
          </button>
        </div>
      </div>
    </div>
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleArrayValue(field: "typeCodes" | "requirementCodes", value: string) {
    setForm((current) => {
      const hasValue = current[field].includes(value);
      return {
        ...current,
        [field]: hasValue
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  }

  async function loadLookups() {
    setLoadingLookups(true);
    try {
      const data = await getLookups();
      setEventTypeOptions(data.eventTypes);
      setRequirementOptions(data.requirementOptions);
    } catch {
      setEventTypeOptions([]);
      setRequirementOptions([]);
      setError("Não foi possível carregar os tipos e requisitos do evento.");
    } finally {
      setLoadingLookups(false);
    }
  }
}

function CheckboxGroup({
  options,
  values,
  onToggle,
  className = "",
}: {
  options: LookupOption[];
  values: string[];
  onToggle: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
      {options.map((option) => (
        <label key={option.code} className="flex items-center gap-1.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={values.includes(option.code)}
            onChange={() => onToggle(option.code)}
            className="accent-brand-teal"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="text-xs font-medium text-brand-teal">{label}</p>
      {children}
    </div>
  );
}

function mapEventToForm(event?: OrganizerEventDetail | null): FormState {
  if (!event) return EMPTY_FORM;
  const start = splitIsoDateTime(event.startsAt);
  const end = event.endsAt ? splitIsoDateTime(event.endsAt) : null;

  return {
    title: event.title,
    summary: event.summary,
    description: event.description ?? "",
    rulesTerms: event.rulesTerms ?? "",
    eventDate: start.date,
    eventTime: start.time,
    endDate: end?.date ?? "",
    endTime: end?.time ?? "",
    locationName: event.locationName ?? "",
    isRemote: event.isRemote,
    capacity: event.capacity ? String(event.capacity) : "",
    coverImageUrl: event.coverImageUrl ?? "",
    highlightSkill: event.highlightSkill ?? "",
    typeCodes: event.types.map((item) => item.code),
    requirementCodes: event.requirements.map((item) => item.code),
  };
}

function splitIsoDateTime(value: string) {
  const date = new Date(value);
  const tzAdjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return {
    date: tzAdjusted.toISOString().slice(0, 10),
    time: tzAdjusted.toISOString().slice(11, 16),
  };
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal";

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
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

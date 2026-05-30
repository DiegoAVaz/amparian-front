"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormAlert,
  FormField,
  IconButton,
  Textarea,
  TextInput,
} from "@/components/ui";
import {
  type EventFormInput,
  type LookupOption,
  type OrganizerEventDetail,
  createOrganizerEvent,
  getLookups,
  updateOrganizerEvent,
} from "@/lib/amparian-api";
import { getApiFormError, type ApiErrorFieldMap, type ApiFieldErrors } from "@/lib/api";

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

type EventFormField = keyof FormState;

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

const EVENT_FIELD_MAP: ApiErrorFieldMap<EventFormField> = {
  startsAt: "eventDate",
  "body.startsAt": "eventDate",
  endsAt: "endDate",
  "body.endsAt": "endDate",
};

export function CreateEventModal({ onClose, onSaved, onError, initialEvent }: Props) {
  const [form, setForm] = useState<FormState>(() => mapEventToForm(initialEvent));
  const [loading, setLoading] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<EventFormField>>({});
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
    const localErrors = getRequiredFieldErrors();

    if (!canSubmit || Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError("Preencha os campos obrigatórios para salvar o evento.");
      return;
    }

    setError("");
    setFieldErrors({});
    setLoading(true);

    const payload: EventFormInput = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: nullable(form.description),
      rulesTerms: nullable(form.rulesTerms),
      startsAt: combineDateTime(form.eventDate, form.eventTime),
      endsAt: form.endDate && form.endTime ? combineDateTime(form.endDate, form.endTime) : null,
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
      const {
        fieldErrors: nextFieldErrors,
        formError,
      } = getApiFormError<EventFormField>(
        err,
        "Não foi possível salvar o evento agora.",
        { fieldMap: EVENT_FIELD_MAP },
      );
      setFieldErrors(nextFieldErrors);
      setError(formError);
      if (formError) onError(formError);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-8">
        <IconButton
          className="absolute right-4 top-4"
          icon={<XIcon />}
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
        />

        <h2 className="mb-6 text-xl font-bold text-brand-teal">{title}</h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <FormField label="Título do evento" required error={fieldErrors.title}>
              <TextInput
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Ex: Mutirão de limpeza na praia do Sal"
                error={fieldErrors.title}
              />
            </FormField>

            <FormField label="Resumo do evento" required error={fieldErrors.summary}>
              <Textarea
                rows={3}
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Descreva rapidamente o propósito do evento."
                error={fieldErrors.summary}
                resize="none"
              />
            </FormField>

            <FormField label="Descrição" error={fieldErrors.description}>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Detalhes completos para os voluntários."
                error={fieldErrors.description}
                resize="none"
              />
            </FormField>

            <FormField label="Regras e termos" error={fieldErrors.rulesTerms}>
              <Textarea
                rows={3}
                value={form.rulesTerms}
                onChange={(e) => updateField("rulesTerms", e.target.value)}
                placeholder="Orientações de participação e responsabilidade."
                error={fieldErrors.rulesTerms}
                resize="none"
              />
            </FormField>

            <FormField
              label="Data e local"
              required
              error={fieldErrors.eventDate || fieldErrors.eventTime || fieldErrors.locationName}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <TextInput
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => updateField("eventDate", e.target.value)}
                  error={fieldErrors.eventDate}
                />
                <TextInput
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => updateField("eventTime", e.target.value)}
                  error={fieldErrors.eventTime}
                  className="sm:w-32"
                />
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <TextInput
                  type="text"
                  value={form.locationName}
                  onChange={(e) => updateField("locationName", e.target.value)}
                  placeholder="Local"
                  error={fieldErrors.locationName}
                  className="flex-1"
                />
                <Checkbox
                  checked={form.isRemote}
                  onChange={(e) => updateField("isRemote", e.target.checked)}
                  label="Remoto"
                  className="mt-0"
                />
              </div>
            </FormField>

            <FormField
              label="Encerramento (opcional)"
              error={fieldErrors.endDate || fieldErrors.endTime}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <TextInput
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  error={fieldErrors.endDate}
                />
                <TextInput
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  error={fieldErrors.endTime}
                  className="sm:w-32"
                />
              </div>
            </FormField>

            <CheckboxGroup
              legend="Requisitos"
              options={toCheckboxOptions(requirementOptions)}
              values={form.requirementCodes}
              onChange={(values) => updateField("requirementCodes", values)}
              error={fieldErrors.requirementCodes}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Quantidade de vagas" error={fieldErrors.capacity}>
                <TextInput
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                  error={fieldErrors.capacity}
                />
              </FormField>
              <FormField label="Habilidade em destaque" error={fieldErrors.highlightSkill}>
                <TextInput
                  type="text"
                  value={form.highlightSkill}
                  onChange={(e) => updateField("highlightSkill", e.target.value)}
                  placeholder="Ex: Consciência ambiental"
                  error={fieldErrors.highlightSkill}
                />
              </FormField>
              <FormField label="URL da capa" error={fieldErrors.coverImageUrl}>
                <TextInput
                  type="url"
                  value={form.coverImageUrl}
                  onChange={(e) => updateField("coverImageUrl", e.target.value)}
                  placeholder="https://..."
                  error={fieldErrors.coverImageUrl}
                />
              </FormField>
            </div>

            <FormAlert variant="error">{error}</FormAlert>
          </div>

          <div className="w-full flex-shrink-0 border-t border-gray-100 pt-4 lg:w-56 lg:border-t-0 lg:pt-0">
            {loadingLookups && (
              <p className="mb-2 text-xs text-gray-500">Carregando opções...</p>
            )}
            <CheckboxGroup
              legend="Tipo de evento"
              options={toCheckboxOptions(eventTypeOptions)}
              values={form.typeCodes}
              onChange={(values) => updateField("typeCodes", values)}
              className="max-h-72 overflow-y-auto pr-1"
              error={fieldErrors.typeCodes}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            type="button"
            disabled={loading}
            loading={loading}
            loadingLabel="Salvando..."
            onClick={() => void handleSubmit(true)}
            className="w-full px-6 py-2.5 sm:w-auto"
          >
            {primaryLabel}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => void handleSubmit(false)}
            variant="link"
            size="sm"
          >
            Salvar rascunho
          </Button>
        </div>
      </div>
    </div>
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
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

  function getRequiredFieldErrors(): ApiFieldErrors<EventFormField> {
    const nextErrors: ApiFieldErrors<EventFormField> = {};
    if (!form.title.trim()) nextErrors.title = "Informe o título do evento.";
    if (!form.summary.trim()) nextErrors.summary = "Informe o resumo do evento.";
    if (!form.eventDate) nextErrors.eventDate = "Informe a data do evento.";
    if (!form.eventTime) nextErrors.eventTime = "Informe o horário do evento.";
    if (form.typeCodes.length === 0) {
      nextErrors.typeCodes = "Informe ao menos um tipo de evento.";
    }
    return nextErrors;
  }
}

function toCheckboxOptions(options: LookupOption[]) {
  return options.map((option) => ({
    label: option.label,
    value: option.code,
  }));
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

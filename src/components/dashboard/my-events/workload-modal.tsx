"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button, FormAlert, FormField, IconButton, TextInput } from "@/components/ui";
import { type OrganizerEventDetail, updateOrganizerEvent } from "@/lib/amparian-api";
import { ApiError, getApiFormError } from "@/lib/api";
import { formatHours, formatHoursLabel, parseHoursInput } from "@/lib/hours";

type Props = {
  event: OrganizerEventDetail;
  // Duração do evento em horas quando ele é de um dia; é o que vale com o campo vazio (RC-03).
  durationHours: number | null;
  onClose: () => void;
  onSaved: (event: OrganizerEventDetail) => void;
  // Alguém emitiu o certificado enquanto o diálogo estava aberto: a API recusou (RC-11).
  onLocked: (message: string) => void;
};

// Único caminho de edição de um evento encerrado (RC-11). Manda só `workloadHours`: qualquer outro
// campo no corpo faria a API recusar o pedido inteiro com EVENT_ENDED.
export function WorkloadModal({ event, durationHours, onClose, onSaved, onLocked }: Props) {
  const [value, setValue] = useState(
    event.workloadHours !== null ? formatHours(event.workloadHours) : "",
  );
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");

  const emptyMeans =
    durationHours !== null
      ? `Em branco, vale a duração do evento: ${formatHoursLabel(durationHours)}.`
      : "Em branco, os certificados mostram só o período do evento.";

  async function handleSave() {
    const workloadHours = parseHoursInput(value);
    if (workloadHours !== null && Number.isNaN(workloadHours)) {
      setFieldError("Informe a carga horária em horas, como 4 ou 2,5.");
      return;
    }

    setSaving(true);
    setFieldError("");
    setError("");
    try {
      onSaved(await updateOrganizerEvent(event.id, { workloadHours }));
    } catch (err) {
      if (err instanceof ApiError && err.code === "EVENT_WORKLOAD_LOCKED") {
        onLocked(err.message);
        return;
      }
      const { fieldErrors, formError } = getApiFormError<"workloadHours">(
        err,
        "Não foi possível salvar a carga horária agora.",
      );
      setFieldError(fieldErrors.workloadHours ?? "");
      setError(formError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carga-horaria-titulo"
    >
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <IconButton
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 sm:right-4 sm:top-4"
          icon={<X size={18} strokeWidth={2} aria-hidden="true" />}
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
          disabled={saving}
        />

        <h2 id="carga-horaria-titulo" className="pr-8 text-lg font-bold text-brand-teal">
          Alterar carga horária
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          O evento já terminou, então os outros dados não mudam mais. A carga horária ainda pode ser
          ajustada até o primeiro voluntário emitir o certificado; a partir daí, todos os certificados
          do evento saem com o mesmo valor.
        </p>

        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <FormField
            label="Carga horária (horas)"
            htmlFor="carga-horaria-valor"
            helperText={emptyMeans}
            error={fieldError}
          >
            <TextInput
              id="carga-horaria-valor"
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setFieldError("");
              }}
              placeholder="Ex: 4 ou 2,5"
              error={fieldError}
              disabled={saving}
            />
          </FormField>

          <FormAlert variant="error" className="mt-4">{error}</FormAlert>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} loadingLabel="Salvando...">
              Salvar carga horária
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

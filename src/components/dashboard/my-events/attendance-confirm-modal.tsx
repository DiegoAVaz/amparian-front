"use client";

import { X } from "lucide-react";

import { Button, FormAlert, IconButton } from "@/components/ui";

type Props = {
  present: number;
  absent: number;
  unmarked: number;
  // Carga horária que os certificados vão mostrar, já formatada ("4 horas"); `null` quando o
  // evento não tem carga e os certificados mostram só o período.
  workloadLabel: string | null;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

// Confirmação antes de gravar a lista de chamada. É o segundo dos dois avisos de que a presença
// trava depois que o voluntário emite o certificado (RC-04) — o primeiro é a frase fixa no topo da
// lista. Texto simples, sem caixa decorativa, como o resto das mensagens do painel.
export function AttendanceConfirmModal({
  present,
  absent,
  unmarked,
  workloadLabel,
  saving,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const certificateText = workloadLabel
    ? `com carga horária de ${workloadLabel}`
    : "com o período do evento, sem carga horária";

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmar-presenca-titulo"
      aria-describedby="confirmar-presenca-texto"
    >
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <IconButton
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 sm:right-4 sm:top-4"
          icon={<X size={18} strokeWidth={2} aria-hidden="true" />}
          label="Fechar"
          onClick={onCancel}
          size="sm"
          variant="ghost"
          disabled={saving}
        />

        <h2 id="confirmar-presenca-titulo" className="pr-8 text-lg font-bold text-brand-teal">
          Salvar a lista de presença?
        </h2>

        <div id="confirmar-presenca-texto" className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-gray-700">
          <p>
            Você vai salvar {plural(present, "presente", "presentes")},{" "}
            {plural(absent, "falta", "faltas")} e {plural(unmarked, "inscrição sem marcação", "inscrições sem marcação")}.
          </p>
          {present > 0 && (
            <p>
              {present === 1 ? "Quem está como Presente já poderá" : `Os ${present} presentes já poderão`} emitir o
              certificado, {certificateText}. Depois que alguém emitir, a presença dessa pessoa não poderá mais ser
              alterada.
            </p>
          )}
          <p className="text-gray-600">
            Quem está como Faltou ou sem marcação não recebe certificado e ainda pode ser alterado depois.
          </p>
        </div>

        <FormAlert variant="error" className="mt-4">{error}</FormAlert>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            Voltar e revisar
          </Button>
          <Button type="button" onClick={onConfirm} loading={saving} loadingLabel="Salvando...">
            Salvar presença
          </Button>
        </div>
      </div>
    </div>
  );
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

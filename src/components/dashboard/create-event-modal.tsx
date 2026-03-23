"use client";

type Props = {
  onClose: () => void;
  onPublish: () => void;
  onError: () => void;
};

const EVENT_TYPES = [
  "Limpeza",
  "Educação",
  "Culinária",
  "Esportes",
  "Venda e/ou marketing",
  "Saúde e bem-estar",
  "Trabalho administrativo",
  "Logística e/ou operação",
  "Reflorestamento/plantio",
  "Bem-estar animal",
  "Monitoria",
  "Arrecadação",
  "Outro",
];

const REQUIREMENTS = ["18 anos", "Veículo próprio", "Aparelho próprio", "Esforço físico"];

export function CreateEventModal({ onClose, onPublish, onError: _onError }: Props) {
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

        <h2 className="mb-6 text-xl font-bold text-brand-teal">Criar evento</h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Field label="Título do evento *">
              <input
                type="text"
                placeholder="Ex: Mutirão de limpeza na praia do Sal"
                className={inputCls}
              />
            </Field>

            <Field label="Resumo do evento *">
              <textarea
                rows={3}
                placeholder="Ex: Coleta de lixo e resíduos às margens do Grande Rio da cidade e separação de materiais recicláveis."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Regras e termos">
              <textarea
                rows={3}
                placeholder="Ex: Ao se inscrever, o voluntário concorda que deve levar sua própria garrafa d'água e utilizar calçados fechados."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Data e local *">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input type="date" className={inputCls} />
                <input type="time" className={`${inputCls} sm:w-28`} />
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <input type="text" placeholder="Local" className={`${inputCls} flex-1`} />
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" className="accent-brand-teal" />
                  Remoto
                </label>
              </div>
            </Field>

            <Field label="Requisitos">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {REQUIREMENTS.map((req) => (
                  <label key={req} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input type="checkbox" className="accent-brand-teal" />
                    {req}
                  </label>
                ))}
              </div>
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Field label="Quantidade de vagas" className="min-w-0 flex-1">
                <input type="number" min={1} className={inputCls} />
              </Field>
              <Field label="Capa do evento" className="min-w-0 flex-1">
                <div className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:border-brand-teal">
                  Escolher arquivo
                </div>
              </Field>
            </div>
          </div>

          {/* Right column — Tipo de evento */}
          <div className="w-full flex-shrink-0 border-t border-gray-100 pt-4 lg:w-44 lg:border-t-0 lg:pt-0">
            <p className="mb-2 text-xs font-medium text-brand-teal">Tipo de evento *</p>
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1 sm:max-h-none">
              {EVENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" className="accent-brand-teal" />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            onClick={onPublish}
            className="w-full rounded-lg bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover sm:w-auto"
          >
            PUBLICAR EVENTO
          </button>
          <button type="button" className="text-xs text-gray-400 hover:underline sm:text-right">
            SALVAR RASCUNHO
          </button>
        </div>
      </div>
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

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal";

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

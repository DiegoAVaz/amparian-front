"use client";

type Props = {
  onClose: () => void;
  onRetry: () => void;
  message?: string;
};

export function PublishErrorModal({ onClose, onRetry, message }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 text-center shadow-xl sm:rounded-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 sm:right-4 sm:top-4"
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        <h2 className="text-xl font-bold text-brand-teal">Ops, algo deu errado</h2>
        <p className="mt-1 text-sm font-semibold text-brand-teal">
          Não conseguimos publicar o seu evento no momento.
        </p>

        <p className="mt-4 text-xs leading-relaxed text-gray-600">
          {message ??
            "Tivemos um problema ao processar as informações. Verifique os campos e tente novamente."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            className="text-sm text-brand-teal underline hover:text-brand-teal-hover"
          >
            Falar com suporte
          </button>
        </div>
      </div>
    </div>
  );
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

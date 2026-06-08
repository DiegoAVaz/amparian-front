"use client";

import { X } from "lucide-react";

import { Button, IconButton } from "@/components/ui";

type Props = {
  onClose: () => void;
  onRetry: () => void;
  message?: string;
};

export function PublishErrorModal({ onClose, onRetry, message }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 text-center shadow-xl sm:rounded-2xl sm:p-8">
        <IconButton
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 sm:right-4 sm:top-4"
          icon={<X size={18} strokeWidth={2} aria-hidden="true" />}
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
        />

        <h2 className="text-xl font-bold text-brand-teal">Ops, algo deu errado</h2>
        <p className="mt-1 text-sm font-semibold text-brand-teal">
          Não conseguimos publicar o seu evento no momento.
        </p>

        <p className="mt-4 text-xs leading-relaxed text-gray-600">
          {message ??
            "Tivemos um problema ao processar as informações. Verifique os campos e tente novamente."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            type="button"
            onClick={onRetry}
            fullWidth
          >
            Tentar novamente
          </Button>
          <Button
            type="button"
            variant="link"
          >
            Falar com suporte
          </Button>
        </div>
      </div>
    </div>
  );
}

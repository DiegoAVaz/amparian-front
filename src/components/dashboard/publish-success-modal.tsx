"use client";

import { Button, IconButton } from "@/components/ui";

type Props = {
  onClose: () => void;
  eventTitle?: string;
  eventOrg?: string;
  eventDate?: string | null;
  onViewEvent?: () => void;
};

export function PublishSuccessModal({
  onClose,
  eventTitle,
  eventOrg,
  eventDate,
  onViewEvent,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 text-center shadow-xl sm:rounded-2xl sm:p-8">
        <IconButton
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 sm:right-4 sm:top-4"
          icon={<XIcon />}
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
        />

        <h2 className="text-xl font-bold text-brand-teal">Seu evento foi publicado!</h2>
        <p className="mt-1 text-sm font-semibold text-brand-teal">
          Seu evento foi publicado com sucesso!
        </p>

        <div className="my-5 flex overflow-hidden rounded-xl bg-gray-100 text-left shadow-sm">
          <div className="flex w-20 flex-shrink-0 items-center justify-center bg-gray-300">
            <span className="px-1 text-center text-[8px] text-gray-400">evento.jpg</span>
          </div>
          <div className="flex flex-col justify-center gap-0.5 px-3 py-2">
            <p className="text-sm font-semibold text-brand-teal">{eventTitle ?? "Novo evento"}</p>
            <p className="text-xs text-gray-400">{eventOrg ?? "Amparian"}</p>
            <p className="text-xs text-gray-400">{eventDate ?? "Publicado agora"}</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-gray-600">
          Obrigado por ajudar a transformar o mundo! Seu evento já está disponível para outros
          voluntários da Amparian.
        </p>

        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-xs font-medium text-gray-600">Compartilhe nas redes sociais!</p>
          <div className="flex gap-3">
            <IconButton
              type="button"
              className="rounded-full bg-green-500 text-white hover:bg-green-600"
              icon={<WhatsAppIcon />}
              label="Compartilhar no WhatsApp"
              size="sm"
              variant="success"
            />
            <IconButton
              type="button"
              className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:opacity-90"
              icon={<InstagramIcon />}
              label="Compartilhar no Instagram"
              size="sm"
              variant="ghost"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            onClick={onViewEvent}
            className="flex-1"
            disabled={!onViewEvent}
            fullWidth
          >
            Ver meu evento
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="flex-1"
            fullWidth
            variant="secondary"
          >
            Voltar
          </Button>
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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.508 5.825L.057 23.25a.75.75 0 0 0 .917.917l5.426-1.451A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.6-.495-5.1-1.36l-.364-.214-3.773 1.009 1.01-3.773-.215-.364A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

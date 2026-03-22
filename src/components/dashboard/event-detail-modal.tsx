"use client";

import type { EventSummary } from "./types";

type Props = {
  event: EventSummary;
  onClose: () => void;
};

export function EventDetailModal({ event, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        {/* Image — adicionar src/assets/{event.imageKey}.jpg */}
        <div className="w-44 flex-shrink-0 bg-gray-200 flex items-center justify-center">
          <span className="text-[9px] text-gray-400 text-center px-2">{event.imageKey}.jpg</span>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-brand-teal">
              {event.title}
            </h2>
            <p className="text-sm text-gray-400">{event.org}</p>
          </div>

          <p className="text-sm text-gray-600">
            Junte-se a nós para limparmos o Grande Rio da cidade.
          </p>

          <div>
            <p className="mb-1 text-sm font-semibold text-gray-700">O que você fará:</p>
            <p className="text-sm text-gray-600">
              Coleta de lixo e resíduos às margens do Grande Rio da cidade e separação de materiais
              recicláveis.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <CalendarIcon />
              <span>22 de maio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LocationIcon />
              <span>Grande Rio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PersonIcon />
              <span>20 vagas</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Requisitos e Habilidades:</p>
            <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal">
              Consciência ambiental
            </span>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input type="checkbox" className="mt-0.5 accent-brand-teal" />
            <span>
              Li e concordo com o{" "}
              <a href="#" className="text-brand-teal underline">
                Termo de Responsabilidade
              </a>
            </span>
          </label>

          <button className="w-full rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover">
            QUERO PARTICIPAR
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

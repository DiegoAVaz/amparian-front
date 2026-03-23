"use client";

import type { SubscriberRecord } from "./my-events-data";

type Props = {
  subscriber: SubscriberRecord;
  onClose: () => void;
  onConfirmPresence: () => void;
};

export function SubscriberProfileModal({ subscriber, onClose, onConfirmPresence }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-perfil-titulo"
    >
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        <h2 id="modal-perfil-titulo" className="text-lg font-bold text-brand-teal">
          Perfil do Inscrito
        </h2>

        <div className="mt-6 flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 text-2xl font-bold text-white">
            {subscriber.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <p className="text-base font-semibold text-gray-900">{subscriber.name}</p>
            <p className="text-sm text-gray-500">{subscriber.role}</p>
            <span
              className={[
                "mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold",
                subscriber.status === "Confirmado"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800",
              ].join(" ")}
            >
              {subscriber.status}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">E-mail</dt>
            <dd className="mt-1 text-sm text-gray-800">{subscriber.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Telefone</dt>
            <dd className="mt-1 text-sm text-gray-800">{subscriber.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Cidade/UF</dt>
            <dd className="mt-1 text-sm text-gray-800">{subscriber.cityUf}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Data de Inscrição
            </dt>
            <dd className="mt-1 text-sm text-gray-800">{subscriber.registrationDate}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-red-600 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onConfirmPresence}
            className="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 sm:w-auto"
          >
            Confirmar Presença
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

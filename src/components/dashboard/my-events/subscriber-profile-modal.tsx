"use client";

import { X } from "lucide-react";

import { Button, IconButton } from "@/components/ui";
import type { SubscriberRecord } from "@/lib/amparian-api";

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
        <IconButton
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-transparent hover:text-gray-500"
          icon={
            <span className="flex h-4 w-4 items-center justify-center">
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </span>
          }
          label="Fechar"
          onClick={onClose}
          size="sm"
          variant="ghost"
        />

        <h2 id="modal-perfil-titulo" className="text-lg font-bold text-brand-teal">
          Perfil do inscrito
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
            <p className="text-sm text-gray-500">{subscriber.role || "Voluntário"}</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${statusCls(subscriber.status)}`}>
              {statusLabel(subscriber.status)}
            </span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="E-mail" value={subscriber.email} />
          <Field label="Telefone" value={subscriber.phone || "Não informado"} />
          <Field label="Cidade/UF" value={subscriber.cityUf || "Não informado"} />
          <Field label="Data de inscrição" value={formatDate(subscriber.registrationDate)} />
        </dl>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto"
            variant="outline"
          >
            Fechar
          </Button>
          {subscriber.status !== "confirmed" && (
            <Button
              type="button"
              onClick={onConfirmPresence}
              className="w-full sm:w-auto"
              variant="success"
            >
              Confirmar presença
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function statusLabel(status: SubscriberRecord["status"]) {
  if (status === "confirmed") return "Confirmado";
  if (status === "cancelled") return "Cancelado";
  return "Pendente";
}

function statusCls(status: SubscriberRecord["status"]) {
  if (status === "confirmed") return "bg-green-100 text-green-800";
  if (status === "cancelled") return "bg-gray-100 text-gray-700";
  return "bg-amber-100 text-amber-800";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Button, IconButton } from "@/components/ui";
import {
  type OrganizerEventDetail as OrganizerEventDetailRecord,
  type SubscriberRecord,
  deleteOrganizerEvent,
  getOrganizerEvent,
  getOrganizerRegistrations,
  updateOrganizerRegistrationStatus,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";
import { CreateEventModal } from "@/components/dashboard/create-event-modal";
import { PublishErrorModal } from "@/components/dashboard/publish-error-modal";
import { PublishSuccessModal } from "@/components/dashboard/publish-success-modal";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import { SubscriberProfileModal } from "./subscriber-profile-modal";

type Props = {
  eventId: string;
};

type ModalState = "none" | "edit" | "publish-success" | "publish-error";

export function OrganizerEventDetail({ eventId }: Props) {
  const router = useRouter();
  const [event, setEvent] = useState<OrganizerEventDetailRecord | null>(null);
  const [rows, setRows] = useState<SubscriberRecord[]>([]);
  const [subscriberModal, setSubscriberModal] = useState<SubscriberRecord | null>(null);
  const [modal, setModal] = useState<ModalState>("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [nextEvent, nextRows] = await Promise.all([
          getOrganizerEvent(eventId),
          getOrganizerRegistrations(eventId),
        ]);
        if (!cancelled) {
          setEvent(nextEvent);
          setRows(nextRows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar o evento.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleConfirmPresence(registrationId: string) {
    try {
      await updateOrganizerRegistrationStatus(eventId, registrationId, "confirmed");
      setRows((prev) =>
        prev.map((row) => (row.id === registrationId ? { ...row, status: "confirmed" } : row)),
      );
      setSubscriberModal(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível atualizar a inscrição.");
      setModal("publish-error");
    }
  }

  async function handleCancelRegistration(registrationId: string) {
    if (!confirm("Cancelar esta inscrição?")) return;

    try {
      await updateOrganizerRegistrationStatus(eventId, registrationId, "cancelled");
      setRows((prev) => prev.filter((row) => row.id !== registrationId));
      setSubscriberModal((current) => (current?.id === registrationId ? null : current));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível cancelar a inscrição.");
      setModal("publish-error");
    }
  }

  async function handleDeleteEvent() {
    if (!confirm("Excluir este evento? Essa ação não pode ser desfeita.")) return;

    try {
      await deleteOrganizerEvent(eventId);
      router.push("/home/meus-eventos");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível excluir o evento.");
      setModal("publish-error");
    }
  }

  function exportCsv() {
    if (!event) return;
    const header = ["Nome", "Status", "E-mail", "Telefone", "Cidade/UF", "Data de Inscrição"];
    const lines = [header.join(";")];
    for (const r of rows) {
      lines.push(
        [
          r.name,
          statusLabel(r.status),
          r.email,
          r.phone,
          r.cityUf,
          new Date(r.registrationDate).toLocaleDateString("pt-BR"),
        ]
          .map(csvEscape)
          .join(";"),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${event.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <DashboardShell activeNav="events">
        <main className="p-4 sm:p-6">
          <p className="text-sm text-gray-500">Carregando evento...</p>
        </main>
      </DashboardShell>
    );
  }

  if (!event || error) {
    return (
      <DashboardShell activeNav="events">
        <main className="p-4 sm:p-6">
          <p className="rounded-xl bg-red-50 px-4 py-8 text-sm text-red-600">{error || "Evento não encontrado."}</p>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activeNav="events">
      <>
        <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/home/meus-eventos" className="font-medium text-brand-teal hover:underline">
                  Meus Eventos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-gray-800">{event.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="break-words text-xl font-bold text-brand-teal sm:max-w-xl">{event.title}</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                onClick={() => setModal("edit")}
                className="w-full sm:w-auto"
                variant="success"
              >
                Editar
              </Button>
              <Button
                type="button"
                onClick={() => void handleDeleteEvent()}
                className="w-full sm:w-auto"
                variant="danger"
              >
                Excluir
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex h-48 w-full items-center justify-center bg-gradient-to-r from-teal-600 to-cyan-500 sm:h-56">
              {event.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-white/70">Sem capa</span>
              )}
            </div>
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-700">
                <p>{event.summary}</p>
                {event.description && <p>{event.description}</p>}
                <p>
                  <span className="font-semibold text-gray-900">Data:</span>{" "}
                  {formatLongDate(event.startsAt)}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Local:</span>{" "}
                  {event.isRemote ? "Remoto" : event.locationName ?? "A confirmar"}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Capacidade:</span>{" "}
                  {event.capacity ? `${event.capacity} vagas` : "Sem limite"}
                </p>
                {event.rulesTerms && (
                  <p>
                    <span className="font-semibold text-gray-900">Regras:</span> {event.rulesTerms}
                  </p>
                )}
                {(event.types.length > 0 || event.requirements.length > 0 || event.highlightSkill) && (
                  <div className="flex flex-wrap gap-2">
                    {event.highlightSkill && <Badge>{event.highlightSkill}</Badge>}
                    {event.types.map((item) => (
                      <Badge key={item.code}>{item.label}</Badge>
                    ))}
                    {event.requirements.map((item) => (
                      <Badge key={item.code}>{item.label}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 flex-col items-start gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusPill(event.computedStatus)}`}>
                  {computedStatusLabel(event.computedStatus)}
                </span>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-brand-teal">Inscritos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3 sm:px-6">Nome</th>
                    <th className="px-3 py-3 sm:px-6">Status</th>
                    <th className="px-3 py-3 text-right sm:px-6">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-10 text-center text-gray-500 sm:px-6">
                        Nenhum inscrito ainda.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-3 py-3 font-medium text-gray-900 sm:px-6">{row.name}</td>
                        <td className="px-3 py-3 sm:px-6">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${registrationPill(row.status)}`}>
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              type="button"
                              icon={<EyeIcon />}
                              label={`Ver perfil de ${row.name}`}
                              onClick={() => setSubscriberModal(row)}
                              size="sm"
                              variant="secondary"
                            />
                            <IconButton
                              type="button"
                              icon={<TrashIcon />}
                              label={`Cancelar inscrição de ${row.name}`}
                              onClick={() => void handleCancelRegistration(row.id)}
                              size="sm"
                              variant="danger"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                onClick={exportCsv}
                className="w-full sm:w-auto"
                variant="outline"
              >
                Exportar CSV
              </Button>
            </div>
          </section>
        </main>

        {subscriberModal && (
          <SubscriberProfileModal
            subscriber={subscriberModal}
            onClose={() => setSubscriberModal(null)}
            onConfirmPresence={() => void handleConfirmPresence(subscriberModal.id)}
          />
        )}

        {modal === "edit" && (
          <CreateEventModal
            initialEvent={event}
            onClose={() => setModal("none")}
            onSaved={(nextEvent, action) => {
              setEvent(nextEvent);
              setModal(action === "published" ? "publish-success" : "none");
            }}
            onError={(message) => {
              setActionError(message);
              setModal("publish-error");
            }}
          />
        )}

        {modal === "publish-success" && (
          <PublishSuccessModal
            onClose={() => setModal("none")}
            eventTitle={event.title}
            eventDate={new Date(event.startsAt).toLocaleDateString("pt-BR")}
          />
        )}

        {modal === "publish-error" && (
          <PublishErrorModal
            onClose={() => setModal("none")}
            onRetry={() => setModal("edit")}
            message={actionError}
          />
        )}
      </>
    </DashboardShell>
  );
}

function statusLabel(status: SubscriberRecord["status"]) {
  if (status === "confirmed") return "Confirmado";
  if (status === "cancelled") return "Cancelado";
  return "Pendente";
}

function computedStatusLabel(status: OrganizerEventDetailRecord["computedStatus"]) {
  if (status === "past") return "Encerrado";
  if (status === "ongoing") return "Em andamento";
  if (status === "draft") return "Rascunho";
  if (status === "cancelled") return "Cancelado";
  if (status === "published") return "Publicado";
  return "Ativo";
}

function statusPill(status: OrganizerEventDetailRecord["computedStatus"]) {
  if (status === "past") return "bg-gray-100 text-gray-700";
  if (status === "ongoing") return "bg-amber-100 text-amber-900";
  if (status === "draft") return "bg-sky-100 text-sky-800";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-800";
}

function registrationPill(status: SubscriberRecord["status"]) {
  if (status === "confirmed") return "bg-green-100 text-green-800";
  if (status === "cancelled") return "bg-gray-100 text-gray-700";
  return "bg-amber-100 text-amber-800";
}

function csvEscape(value: string) {
  if (/[;"\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal">
      {children}
    </span>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

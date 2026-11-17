"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";

import { Button, FormAlert, IconButton } from "@/components/ui";
import {
  type AttendanceStatus,
  type OrganizerEventDetail as OrganizerEventDetailRecord,
  type SubscriberRecord,
  deleteOrganizerEvent,
  getOrganizerEvent,
  getOrganizerRegistrations,
  recordAttendance,
  updateOrganizerRegistrationStatus,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";
import { attendanceWindow } from "@/lib/attendance";
import { durationWorkloadHours, formatHours, formatHoursLabel } from "@/lib/hours";
import { CreateEventModal } from "@/components/dashboard/create-event-modal";
import { PublishErrorModal } from "@/components/dashboard/publish-error-modal";
import { PublishSuccessModal } from "@/components/dashboard/publish-success-modal";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import { AttendanceConfirmModal } from "./attendance-confirm-modal";
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
  // Marcações feitas na tela e ainda não gravadas, por id de inscrição. A presença gravada fica em
  // `rows`; o que aparece na tela é a marcação local, quando existe, senão a gravada.
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  const [confirmAttendance, setConfirmAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceNotice, setAttendanceNotice] = useState("");

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

  async function handleConfirmRegistration(registrationId: string) {
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
      setAttendanceDraft((prev) => withoutKey(prev, registrationId));
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

  function markAttendance(registrationId: string, status: AttendanceStatus) {
    setAttendanceNotice("");
    setAttendanceDraft((prev) => {
      const saved = rows.find((row) => row.id === registrationId)?.attendance ?? null;
      // Voltar ao valor gravado desfaz a alteração, em vez de contá-la como pendente.
      return saved === status ? withoutKey(prev, registrationId) : { ...prev, [registrationId]: status };
    });
  }

  function markAllConfirmedPresent() {
    setAttendanceNotice("");
    setAttendanceDraft(() => {
      const next: Record<string, AttendanceStatus> = {};
      for (const row of rows) {
        if (row.status === "confirmed" && row.attendance !== "present") next[row.id] = "present";
      }
      return next;
    });
  }

  async function handleSaveAttendance() {
    const items = Object.entries(attendanceDraft).map(([registrationId, status]) => ({
      registrationId,
      status,
    }));
    if (items.length === 0) return;

    setSavingAttendance(true);
    setAttendanceError("");
    try {
      const saved = await recordAttendance(eventId, items);
      // A resposta é a lista inteira gravada do evento: redesenha a partir dela, casando por id.
      setRows((prev) =>
        prev.map((row) =>
          row.status === "confirmed" ? { ...row, attendance: saved.get(row.id) ?? null } : row,
        ),
      );
      setAttendanceDraft({});
      setConfirmAttendance(false);
      setAttendanceNotice("Presença salva.");
    } catch (err) {
      setAttendanceError(
        err instanceof ApiError ? err.message : "Não foi possível salvar a presença agora.",
      );
    } finally {
      setSavingAttendance(false);
    }
  }

  function exportCsv() {
    if (!event) return;
    const workload = effectiveWorkload(event);
    const header = [
      "Nome",
      "Status",
      "Presença",
      "Horas",
      "E-mail",
      "Telefone",
      "Cidade/UF",
      "Data de Inscrição",
    ];
    const lines = [header.join(";")];
    for (const r of rows) {
      lines.push(
        [
          r.name,
          statusLabel(r.status),
          attendanceLabel(r),
          // Só quem esteve presente tem horas; sem carga horária no evento, a coluna fica vazia.
          r.status === "confirmed" && r.attendance === "present" && workload !== null
            ? formatHours(workload)
            : "",
          r.email,
          r.phone,
          r.cityUf,
          new Date(r.registrationDate).toLocaleDateString("pt-BR"),
        ]
          .map(csvEscape)
          .join(";"),
      );
    }
    // O BOM (U+FEFF) faz o Excel abrir o arquivo como UTF-8: sem ele, "João" vira "JoÃ£o" no Excel
    // em português, que lê .csv pela página de código do Windows. O separador ";" é o que o Excel
    // pt-BR espera, e \r\n é a quebra de linha da RFC 4180.
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
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

  const presenceWindow = attendanceWindow(event.startsAt, event.endsAt);
  // Evento cancelado não recebe presença (a API recusa com EVENT_CANCELLED), mesmo dentro da janela.
  const eventCancelled = event.status === "cancelled";
  const canEditAttendance = presenceWindow.state === "open" && !eventCancelled;
  const workload = effectiveWorkload(event);
  const confirmedRows = rows.filter((row) => row.status === "confirmed");
  const shownAttendance = (row: SubscriberRecord) => attendanceDraft[row.id] ?? row.attendance;
  const presentCount = confirmedRows.filter((row) => shownAttendance(row) === "present").length;
  const absentCount = confirmedRows.filter((row) => shownAttendance(row) === "absent").length;
  const unmarkedCount = confirmedRows.length - presentCount - absentCount;
  const pendingCount = Object.keys(attendanceDraft).length;

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
            <h1 className="wrap-break-word text-xl font-bold text-brand-teal sm:max-w-xl">{event.title}</h1>
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
            <div className="flex h-48 w-full items-center justify-center bg-linear-to-r from-teal-600 to-cyan-500 sm:h-56">
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
                <p>
                  <span className="font-semibold text-gray-900">Carga horária:</span>{" "}
                  {workloadText(event)}
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
              <div className="flex shrink-0 flex-col items-start gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusPill(event.computedStatus)}`}>
                  {computedStatusLabel(event.computedStatus)}
                </span>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-brand-teal">
                {presenceWindow.state === "not-open" ? "Inscritos" : "Inscritos e lista de presença"}
              </h2>
              {presenceWindow.state === "not-open" && !eventCancelled && (
                <p className="text-sm text-gray-600">
                  A lista de presença abre no início do evento, em {formatShortDateTime(presenceWindow.opensAt)}.
                </p>
              )}
              {eventCancelled && (
                <p className="text-sm text-gray-600">
                  Este evento foi cancelado, então a presença não pode ser registrada.
                </p>
              )}
              {canEditAttendance && (
                <p className="text-sm leading-relaxed text-gray-600">
                  Marque quem compareceu: só quem estiver como Presente pode emitir certificado.{" "}
                  <strong className="font-semibold text-gray-900">
                    Depois da emissão, a presença dessa pessoa não pode mais ser alterada
                  </strong>{" "}
                  — confira cada marcação antes de salvar. A lista fica aberta até{" "}
                  {formatShortDate(presenceWindow.closesAt)}.
                </p>
              )}
              {presenceWindow.state === "closed" && !eventCancelled && (
                <p className="text-sm text-gray-600">
                  O prazo para lançar a presença terminou em {formatShortDate(presenceWindow.closedAt)}.
                </p>
              )}
              {presenceWindow.state !== "not-open" && !eventCancelled && workload === null && (
                <p className="text-sm text-gray-600">
                  Os certificados deste evento mostrarão só o período, sem carga horária. Para incluí-la,
                  informe a carga horária em Editar.
                </p>
              )}
              {presenceWindow.state !== "not-open" && confirmedRows.length > 0 && (
                <p className="text-xs font-medium text-gray-500">
                  {countLabel(confirmedRows.length, "confirmado", "confirmados")} ·{" "}
                  {countLabel(presentCount, "presente", "presentes")} ·{" "}
                  {countLabel(absentCount, "falta", "faltas")} · {unmarkedCount} sem marcação
                </p>
              )}
              <FormAlert variant="success">{attendanceNotice}</FormAlert>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3 sm:px-6">Nome</th>
                    <th className="px-3 py-3 sm:px-6">Status</th>
                    <th className="px-3 py-3 sm:px-6">Presença</th>
                    <th className="px-3 py-3 text-right sm:px-6">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-10 text-center text-gray-500 sm:px-6">
                        Nenhum inscrito ainda.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={
                          attendanceDraft[row.id]
                            ? "bg-amber-50"
                            : i % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/50"
                        }
                      >
                        <td className="px-3 py-3 font-medium text-gray-900 sm:px-6">
                          {row.name}
                          {attendanceDraft[row.id] && (
                            <span className="ml-2 text-xs font-medium text-amber-800">não salvo</span>
                          )}
                        </td>
                        <td className="px-3 py-3 sm:px-6">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${registrationPill(row.status)}`}>
                            {statusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6">
                          {row.status !== "confirmed" ? (
                            <span className="text-xs text-gray-500">Não se aplica</span>
                          ) : canEditAttendance ? (
                            <fieldset className="flex gap-2">
                              <legend className="sr-only">Presença de {row.name}</legend>
                              <AttendanceOption
                                name={`presenca-${row.id}`}
                                label="Presente"
                                tone="present"
                                checked={shownAttendance(row) === "present"}
                                onSelect={() => markAttendance(row.id, "present")}
                              />
                              <AttendanceOption
                                name={`presenca-${row.id}`}
                                label="Faltou"
                                tone="absent"
                                checked={shownAttendance(row) === "absent"}
                                onSelect={() => markAttendance(row.id, "absent")}
                              />
                            </fieldset>
                          ) : presenceWindow.state === "closed" ? (
                            <span className="text-xs font-medium text-gray-700">{attendanceLabel(row)}</span>
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 sm:px-6">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              type="button"
                              icon={<Eye size={18} strokeWidth={2} aria-hidden="true" />}
                              label={`Ver perfil de ${row.name}`}
                              onClick={() => setSubscriberModal(row)}
                              size="sm"
                              variant="secondary"
                            />
                            <IconButton
                              type="button"
                              icon={<Trash2 size={18} strokeWidth={2} aria-hidden="true" />}
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

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm font-medium text-amber-800" aria-live="polite">
                {pendingCount > 0
                  ? `${pendingCount} ${pendingCount === 1 ? "alteração não salva" : "alterações não salvas"}`
                  : ""}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {canEditAttendance && confirmedRows.length > 0 && (
                  <Button
                    type="button"
                    onClick={markAllConfirmedPresent}
                    className="w-full sm:w-auto"
                    variant="secondary"
                  >
                    Marcar todos os confirmados como presentes
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={exportCsv}
                  className="w-full sm:w-auto"
                  variant="outline"
                >
                  Exportar CSV
                </Button>
                {canEditAttendance && confirmedRows.length > 0 && (
                  <Button
                    type="button"
                    onClick={() => {
                      setAttendanceError("");
                      setConfirmAttendance(true);
                    }}
                    disabled={pendingCount === 0}
                    className="w-full sm:w-auto"
                  >
                    Salvar presença
                  </Button>
                )}
              </div>
            </div>
          </section>
        </main>

        {subscriberModal && (
          <SubscriberProfileModal
            subscriber={subscriberModal}
            onCloseAction={() => setSubscriberModal(null)}
            onConfirmRegistrationAction={() => void handleConfirmRegistration(subscriberModal.id)}
          />
        )}

        {confirmAttendance && (
          <AttendanceConfirmModal
            present={presentCount}
            absent={absentCount}
            unmarked={unmarkedCount}
            workloadLabel={workload !== null ? formatHoursLabel(workload) : null}
            saving={savingAttendance}
            error={attendanceError}
            onCancel={() => setConfirmAttendance(false)}
            onConfirm={() => void handleSaveAttendance()}
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
            onCloseAction={() => setModal("none")}
            eventTitle={event.title}
            eventDate={new Date(event.startsAt).toLocaleDateString("pt-BR")}
            coverImageUrl={event.coverImageUrl}
            onViewEventAction={() => setModal("none")}
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

// De onde vem a carga horária que os certificados vão mostrar (RC-03): informada, calculada pela
// duração (evento de um dia) ou nenhuma (só o período).
function workloadText(event: OrganizerEventDetailRecord): string {
  if (event.workloadHours !== null) return formatHoursLabel(event.workloadHours);
  const fromDuration = durationWorkloadHours(event.startsAt, event.endsAt);
  if (fromDuration !== null) return `${formatHoursLabel(fromDuration)}, pela duração do evento`;
  return "não informada — os certificados mostrarão só o período";
}

function effectiveWorkload(event: OrganizerEventDetailRecord): number | null {
  return event.workloadHours ?? durationWorkloadHours(event.startsAt, event.endsAt);
}

function attendanceLabel(row: SubscriberRecord): string {
  if (row.status !== "confirmed") return "Não se aplica";
  if (row.attendance === "present") return "Presente";
  if (row.attendance === "absent") return "Faltou";
  return "Sem marcação";
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

function formatShortDate(value: Date): string {
  return value.toLocaleDateString("pt-BR");
}

function formatShortDateTime(value: Date): string {
  return value.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Uma opção da lista de chamada. Além da cor, o texto ("Presente" / "Faltou") diz o estado, para
// não depender só de verde e vermelho.
function AttendanceOption({
  name,
  label,
  tone,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  tone: "present" | "absent";
  checked: boolean;
  onSelect: () => void;
}) {
  const selected =
    tone === "present"
      ? "border-green-600 bg-green-100 text-green-800"
      : "border-red-600 bg-red-100 text-red-800";
  return (
    <label
      className={`inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold ${
        checked ? selected : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className={tone === "present" ? "accent-green-600" : "accent-red-600"}
      />
      {label}
    </label>
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
  // Valor que começa com =, +, - ou @ vira fórmula quando o organizador abre o CSV no Excel (um nome
  // de inscrito como "=HIPERLINK(...)", por exemplo). O apóstrofo na frente faz o Excel tratar a
  // célula como texto.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[;"\r\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
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

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Award, CalendarX, Clock, Download, ShieldCheck } from "lucide-react";

import { Button, FieldError, LinkButton } from "@/components/ui";
import {
  type CertificateList,
  type CertificateListItem,
  downloadCertificatePdf,
  getMyCertificates,
  issueCertificate,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";
import { saveBlob } from "@/lib/download";
import {
  formatEventPeriod,
  formatNumericDate,
  formatShortDate,
} from "@/lib/event-period";
import { formatHours, formatHoursLabel } from "@/lib/hours";

import { DashboardShell } from "./dashboard-shell";

// Uma ação por vez na página inteira: emitir e baixar disputam o mesmo token e a mesma lista, e
// dois downloads simultâneos fazem alguns navegadores pedirem permissão para "vários arquivos".
type Busy = { registrationId: number; action: "issue" | "download" } | null;

const STRIP_GRADIENTS = [
  "from-teal-600 to-cyan-500",
  "from-emerald-600 to-teal-400",
  "from-emerald-500 to-teal-700",
];

export function CertificatesContent() {
  const [list, setList] = useState<CertificateList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  // Erro de cada cartão, pela inscrição: a mensagem fica junto do botão que falhou.
  const [cardErrors, setCardErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const next = await getMyCertificates();
        if (!cancelled) setList(next);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            errorMessage(err, "Não foi possível carregar seus certificados."),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function setCardError(registrationId: number, message: string | null) {
    setCardErrors((current) => {
      const next = { ...current };
      if (message) next[registrationId] = message;
      else delete next[registrationId];
      return next;
    });
  }

  // Relê a lista depois de emitir, para o cartão virar "emitido" e os totais contarem o novo
  // certificado como a API conta. Se a releitura falhar, a lista antiga continua na tela — e o
  // "Emitir e baixar" que sobrou é inofensivo: emitir de novo devolve o mesmo certificado (RC-05).
  async function refreshList() {
    try {
      setList(await getMyCertificates());
    } catch {
      /* mantém a lista anterior */
    }
  }

  async function handleIssue(item: CertificateListItem) {
    setBusy({ registrationId: item.registrationId, action: "issue" });
    setCardError(item.registrationId, null);
    try {
      let issued: Awaited<ReturnType<typeof issueCertificate>>;
      try {
        issued = await issueCertificate(item.registrationId);
      } catch (err) {
        setCardError(
          item.registrationId,
          errorMessage(err, "Não foi possível emitir o certificado."),
        );
        // A recusa pode vir de uma mudança desde que a página abriu (a presença foi alterada, o
        // evento foi cancelado): reler a lista tira daqui o botão que continuaria falhando.
        await refreshList();
        return;
      }

      try {
        const file = await downloadCertificatePdf(
          issued.certificate.id,
          issued.certificate.verificationCode,
        );
        saveBlob(file.blob, file.fileName);
      } catch {
        // O certificado já existe; só o arquivo não chegou. Depois da releitura o cartão mostra
        // "Baixar PDF", que é o caminho para tentar de novo.
        setCardError(
          item.registrationId,
          "O certificado foi emitido, mas o download falhou. Use “Baixar PDF” para tentar de novo.",
        );
      }
      await refreshList();
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload(item: CertificateListItem) {
    if (!item.certificate) return;
    setBusy({ registrationId: item.registrationId, action: "download" });
    setCardError(item.registrationId, null);
    try {
      const file = await downloadCertificatePdf(
        item.certificate.id,
        item.certificate.verificationCode,
      );
      saveBlob(file.blob, file.fileName);
    } catch (err) {
      setCardError(
        item.registrationId,
        errorMessage(err, "Não foi possível baixar o certificado."),
      );
    } finally {
      setBusy(null);
    }
  }

  const items = list?.items ?? [];
  const ready = items.filter(
    (i) => i.status === "issued" || i.status === "available",
  );
  const awaiting = items.filter((i) => i.status === "awaiting_attendance");
  const notRecorded = items.filter(
    (i) => i.status === "attendance_not_recorded",
  );

  return (
    <DashboardShell activeNav="certificates">
      <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold text-brand-teal sm:text-2xl">
              Certificados
            </h1>
            <p className="text-sm text-gray-600">
              Certificados das ações em que sua presença foi registrada pelo
              organizador.
            </p>
          </div>
          {list && items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <SummaryTile
                value={String(list.summary.issuedCount)}
                label="Certificados"
              />
              <SummaryTile
                value={`${formatHours(list.summary.certifiedHours)} h`}
                label="Horas certificadas"
              />
            </div>
          ) : null}
        </div>

        {loading ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500" role="status">
              Carregando certificados...
            </p>
          </section>
        ) : loadError ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-red-600" role="alert">
              {loadError}
            </p>
          </section>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {ready.length > 0 ? (
              <section
                aria-labelledby="certificados-disponiveis"
                className="flex flex-col gap-3"
              >
                <h2
                  id="certificados-disponiveis"
                  className="text-base font-semibold text-brand-teal"
                >
                  Disponíveis
                </h2>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {ready.map((item, index) => (
                    <CertificateCard
                      key={item.registrationId}
                      item={item}
                      gradient={STRIP_GRADIENTS[index % STRIP_GRADIENTS.length]}
                      busy={busy}
                      error={cardErrors[item.registrationId] ?? ""}
                      onIssue={handleIssue}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {awaiting.length > 0 ? (
              <section
                aria-labelledby="certificados-aguardando"
                className="flex flex-col gap-3"
              >
                <h2
                  id="certificados-aguardando"
                  className="text-base font-semibold text-brand-teal"
                >
                  Aguardando o organizador
                </h2>
                {awaiting.map((item) => (
                  <PendingRow
                    key={item.registrationId}
                    item={item}
                    icon={<Clock size={20} strokeWidth={2} aria-hidden="true" />}
                    iconClassName="bg-surface-accent text-brand-teal"
                    message={
                      item.attendanceClosesAt
                        ? `O certificado fica disponível quando o organizador registrar sua presença. Ele tem até ${formatShortDate(item.attendanceClosesAt)} para isso.`
                        : "O certificado fica disponível quando o organizador registrar sua presença."
                    }
                  />
                ))}
              </section>
            ) : null}

            {notRecorded.length > 0 ? (
              <section
                aria-labelledby="certificados-sem-presenca"
                className="flex flex-col gap-3"
              >
                <h2
                  id="certificados-sem-presenca"
                  className="text-base font-semibold text-brand-teal"
                >
                  Sem presença
                </h2>
                {notRecorded.map((item) => (
                  <PendingRow
                    key={item.registrationId}
                    item={item}
                    icon={
                      <CalendarX size={20} strokeWidth={2} aria-hidden="true" />
                    }
                    iconClassName="bg-gray-100 text-gray-600"
                    message="O prazo para o organizador registrar a presença terminou sem registro, então esta ação não tem certificado."
                  />
                ))}
              </section>
            ) : null}
          </>
        )}
      </main>
    </DashboardShell>
  );
}

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-36 flex-col gap-0.5 rounded-xl bg-brand-teal px-4 py-3 shadow-sm">
      <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white">
        {label}
      </span>
    </div>
  );
}

function CertificateCard({
  item,
  gradient,
  busy,
  error,
  onIssue,
  onDownload,
}: {
  item: CertificateListItem;
  gradient: string;
  busy: Busy;
  error: string;
  onIssue: (item: CertificateListItem) => void;
  onDownload: (item: CertificateListItem) => void;
}) {
  const mine = busy?.registrationId === item.registrationId;
  const blocked = busy !== null && !mine;
  const certificate = item.certificate;

  return (
    <article className="flex overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div
        className={`hidden w-28 shrink-0 items-center justify-center bg-linear-to-br text-white sm:flex ${gradient}`}
        aria-hidden="true"
      >
        <Award size={36} strokeWidth={1.6} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white sm:hidden ${gradient}`}
            aria-hidden="true"
          >
            <Award size={24} strokeWidth={1.8} />
          </span>
          <h3 className="min-w-0 break-words text-[15px] font-semibold text-gray-900">
            {item.eventTitle}
          </h3>
        </div>
        <p className="text-[13px] text-gray-700">
          {formatEventPeriod(item.eventStartsAt, item.eventEndsAt)}
          {item.workloadHours !== null
            ? ` · ${formatHoursLabel(item.workloadHours)}`
            : null}
        </p>
        {certificate ? (
          <p className="text-xs text-gray-600">
            Emitido em {formatNumericDate(certificate.issuedAt)} · Código{" "}
            <span className="font-semibold tracking-wider text-gray-900">
              {certificate.verificationCode}
            </span>
          </p>
        ) : (
          <p className="text-xs text-gray-600">Pronto para emitir</p>
        )}

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {certificate ? (
            <>
              <Button
                className="min-h-11 w-full sm:min-h-10 sm:w-auto"
                leftIcon={<Download size={16} strokeWidth={2} />}
                loading={mine && busy?.action === "download"}
                loadingLabel="Baixando..."
                disabled={blocked}
                onClick={() => onDownload(item)}
              >
                Baixar PDF
              </Button>
              <LinkButton
                href={`/certificados/verificar/${certificate.verificationCode}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="min-h-11 w-full sm:min-h-10 sm:w-auto"
                leftIcon={<ShieldCheck size={16} strokeWidth={2} />}
              >
                Página de verificação
              </LinkButton>
            </>
          ) : (
            <Button
              className="min-h-11 w-full sm:min-h-10 sm:w-auto"
              leftIcon={<Download size={16} strokeWidth={2} />}
              loading={mine && busy?.action === "issue"}
              loadingLabel="Gerando PDF..."
              disabled={blocked}
              onClick={() => onIssue(item)}
            >
              Emitir e baixar
            </Button>
          )}
        </div>

        <FieldError className="text-sm">{error}</FieldError>
      </div>
    </article>
  );
}

function PendingRow({
  item,
  icon,
  iconClassName,
  message,
}: {
  item: CertificateListItem;
  icon: ReactNode;
  iconClassName: string;
  message: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="break-words text-[15px] font-semibold text-gray-900">
          {item.eventTitle}
        </h3>
        <p className="text-[13px] text-gray-600">
          Terminou em {formatShortDate(item.eventEndsAt ?? item.eventStartsAt)}
        </p>
        <p className="text-[13px] leading-relaxed text-gray-700">{message}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-accent text-brand-teal"
        aria-hidden="true"
      >
        <Award size={28} strokeWidth={1.8} />
      </span>
      <h2 className="text-lg font-semibold text-gray-900">
        Você ainda não tem certificados
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-gray-600">
        Eles aparecem aqui quando um organizador registra sua presença numa
        ação que já terminou.
      </p>
      <LinkButton href="/home" className="mt-1">
        Ver oportunidades abertas
      </LinkButton>
    </section>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError && err.message ? err.message : fallback;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, SearchX } from "lucide-react";

import {
  BrandShield,
  Button,
  cn,
  FormField,
  LinkButton,
  TextInput,
} from "@/components/ui";
import {
  type CertificateVerification as Verification,
  type PublicCertificate,
  verifyCertificate,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";
import {
  formatCertificateLocation,
  formatCertificatePeriod,
  formatLongDate,
  formatWorkload,
} from "@/lib/certificate-text";
import {
  formatVerificationCode,
  normalizeVerificationCode,
} from "@/lib/verification-code";

// A consulta sai do navegador de quem confere, e não do servidor do Next: a API limita a
// verificação por IP (RC-08), e pelo servidor todas as pessoas dividiriam o limite do mesmo IP.
type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; result: Verification }
  | { kind: "error"; message: string };

// Um endereço digitado à mão pode trazer qualquer coisa; o título mostra no máximo isto.
const MAX_SHOWN_CODE = 64;

export function CertificateVerification({ code }: { code: string | null }) {
  const [state, setState] = useState<State>(
    code ? { kind: "loading" } : { kind: "idle" },
  );
  // Muda a cada "Tentar novamente" ou nova consulta do mesmo código, para refazer a consulta.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (code === null) return;
    const current = code;
    let cancelled = false;

    async function run() {
      setState({ kind: "loading" });
      try {
        const result = await verifyCertificate(current);
        if (!cancelled) setState({ kind: "done", result });
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: errorMessage(err),
          });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, attempt]);

  const normalized = code ? normalizeVerificationCode(code) : null;
  const shownCode = normalized
    ? formatVerificationCode(normalized)
    : (code ?? "").slice(0, MAX_SHOWN_CODE);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-canvas">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg">
          <BrandShield size={30} />
          <span className="text-lg font-bold text-brand-teal">Amparian</span>
        </Link>
        <LinkButton href="/login" variant="secondary" className="min-h-11 sm:min-h-10">
          Entrar
        </LinkButton>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-12">
        {code === null ? (
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-brand-teal">
              Verificar certificado
            </h1>
            <p className="text-sm leading-relaxed text-gray-600">
              Digite o código impresso no certificado, ao lado do QR code, para
              confirmar que ele foi emitido pela plataforma Amparian.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-teal-700">
              Verificação de certificado
            </span>
            <h1 className="break-all text-2xl font-bold text-brand-teal">
              Código {shownCode}
            </h1>
          </div>
        )}

        {state.kind === "loading" ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600" role="status">
              Verificando o código...
            </p>
          </section>
        ) : null}

        {state.kind === "error" ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Não foi possível verificar agora
            </h2>
            <p className="text-sm leading-relaxed text-gray-700" role="alert">
              {state.message}
            </p>
            <Button
              className="min-h-11 self-start sm:min-h-10"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Tentar novamente
            </Button>
            {/* Quem errou a digitação e bateu no limite de consultas corrige aqui, sem editar a
                URL. */}
            <div className="mt-2 border-t border-gray-100 pt-5">
              <CodeForm
                key={`erro-${code}`}
                label="Código do certificado"
                initialValue={shownCode}
                currentCode={normalized}
                onSameCode={() => setAttempt((n) => n + 1)}
              />
            </div>
          </section>
        ) : null}

        {state.kind === "done" && state.result.status === "valid" ? (
          <>
            <ValidCertificate certificate={state.result.certificate} />
            <CodeForm
              key={`outro-${code}`}
              label="Verificar outro código"
              initialValue=""
              currentCode={normalized}
              onSameCode={() => setAttempt((n) => n + 1)}
            />
          </>
        ) : null}

        {state.kind === "done" && state.result.status !== "valid" ? (
          <NotVerified
            title={
              state.result.status === "not_found"
                ? "Código não encontrado"
                : "Código inválido"
            }
            message={
              state.result.status === "not_found"
                ? "Confira se o código foi digitado como aparece no certificado: 12 caracteres em três blocos, ao lado do QR code."
                : "O código tem 12 caracteres em três blocos de quatro, como R4WT-8HZN-2QKC, e fica ao lado do QR code no certificado. Ele não usa as letras I e O nem os números 0 e 1."
            }
          >
            <CodeForm
              key={`corrigir-${code}`}
              label="Código do certificado"
              initialValue={shownCode}
              currentCode={normalized}
              onSameCode={() => setAttempt((n) => n + 1)}
            />
          </NotVerified>
        ) : null}

        {state.kind === "idle" ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CodeForm
              key="inicial"
              label="Código do certificado"
              initialValue=""
              currentCode={null}
              onSameCode={() => setAttempt((n) => n + 1)}
            />
          </section>
        ) : null}
      </main>

      <footer className="px-6 py-5 text-center text-xs text-gray-600">
        Amparian — gestão de voluntariado
      </footer>
    </div>
  );
}

function ValidCertificate({ certificate }: { certificate: PublicCertificate }) {
  const location = formatCertificateLocation(
    certificate.eventLocationName,
    certificate.eventIsRemote,
  );
  const workload = formatWorkload(certificate.workloadHours);

  return (
    <section
      aria-labelledby="certificado-valido"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3.5 border-b border-gray-100 px-5 py-5 sm:px-6">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
          aria-hidden="true"
        >
          <Check size={22} strokeWidth={2.4} />
        </span>
        <div className="flex flex-col gap-1">
          <h2
            id="certificado-valido"
            className="text-lg font-bold text-green-800"
          >
            Certificado válido
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            Emitido pela plataforma Amparian. Os dados abaixo devem ser iguais
            aos do certificado.
          </p>
        </div>
      </div>

      <dl className="px-5 py-2 text-sm sm:px-6">
        <Row label="Participante" strong>
          {certificate.participantName}
        </Row>
        <Row label="Ação" strong>
          {certificate.eventTitle}
        </Row>
        <Row label="Promovida por">{certificate.organizerName}</Row>
        {certificate.responsiblePersonName ? (
          <Row label="Responsável">{certificate.responsiblePersonName}</Row>
        ) : null}
        <Row label="Realizada">
          {withoutPreposition(
            formatCertificatePeriod(
              certificate.eventStartsAt,
              certificate.eventEndsAt,
            ),
          )}
        </Row>
        {location ? <Row label="Local">{location}</Row> : null}
        {workload ? (
          <Row label="Carga horária" strong>
            {workload}
          </Row>
        ) : null}
        <Row label="Emitido em">{formatLongDate(certificate.issuedAt)}</Row>
      </dl>

      <p className="border-t border-gray-100 bg-gray-50 px-5 py-3.5 text-xs leading-relaxed text-gray-600 sm:px-6">
        Por privacidade, esta página mostra apenas o que já está impresso no
        certificado. E-mail, telefone e o arquivo PDF não ficam disponíveis
        aqui.
      </p>
    </section>
  );
}

function Row({
  label,
  strong,
  children,
}: {
  label: string;
  strong?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-gray-600">{label}</dt>
      <dd className={cn("break-words text-gray-900", strong && "font-semibold")}>
        {children}
      </dd>
    </div>
  );
}

function NotVerified({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby="codigo-nao-verificado"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3.5 border-b border-gray-100 px-5 py-5 sm:px-6">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white"
          aria-hidden="true"
        >
          <SearchX size={20} strokeWidth={2.2} />
        </span>
        <div className="flex flex-col gap-1">
          <h2
            id="codigo-nao-verificado"
            className="text-lg font-bold text-gray-900"
          >
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">{message}</p>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

// Leva para a URL do código, que é o que o QR abre: o resultado pode ser compartilhado e o botão
// "voltar" do navegador volta ao código anterior. O que não pode ser um código é recusado aqui,
// sem gastar uma das consultas limitadas.
function CodeForm({
  label,
  initialValue,
  currentCode,
  onSameCode,
}: {
  label: string;
  initialValue: string;
  currentCode: string | null;
  onSameCode: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = normalizeVerificationCode(value);
    if (!next) {
      setError(
        "Digite os 12 caracteres do código, como aparecem no certificado.",
      );
      return;
    }
    setError("");
    // A mesma URL não remonta a página; consultar de novo é pedir explicitamente.
    if (next === currentCode) {
      onSameCode();
      return;
    }
    router.push(`/certificados/verificar/${formatVerificationCode(next)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label={label}
        htmlFor="codigo-certificado"
        error={error}
        className="[&>label]:text-sm [&>label]:font-semibold [&>label]:text-gray-800"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <TextInput
            id="codigo-certificado"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={MAX_SHOWN_CODE}
            error={Boolean(error)}
            className="min-h-11 text-[15px] tracking-wider"
          />
          <Button type="submit" className="min-h-11 shrink-0 px-5">
            Verificar
          </Button>
        </div>
      </FormField>
    </form>
  );
}

// A mensagem da API quando ela respondeu com o envelope de erro (o 429 tem a sua, em português).
// Sem código, a resposta não veio da API — um 504 em HTML da Vercel, por exemplo, que chegaria
// como "Gateway Timeout" — ou nem houve resposta: aí vale o texto genérico.
function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.code && err.message) return err.message;
  return "Não foi possível falar com o servidor. Confira sua conexão e tente de novo.";
}

// "em 8 de novembro…" / "de 6 a 8 de novembro…" → sem a preposição, que o rótulo "Realizada" já
// introduz.
function withoutPreposition(text: string): string {
  return text.replace(/^(em|de) /, "");
}

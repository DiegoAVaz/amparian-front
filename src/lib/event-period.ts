// Datas de evento em texto curto, no horário de Brasília — o mesmo fuso em que a API escreve o
// certificado. Sem o fuso fixo, quem abre a tela em outro fuso veria "8 de nov." numa lista cujo
// PDF diz "7 de novembro".
//
// É a versão curta de `formatEventPeriod` da API (o parágrafo do certificado): a lista não repete
// horários, só o dia ou o intervalo de dias.

import { isSingleDayEvent } from "./hours";

const PARTS = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const NUMERIC = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type DayParts = { day: string; month: string; year: string };

function dayParts(date: Date): DayParts {
  const parts = Object.fromEntries(
    PARTS.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return { day: parts.day, month: parts.month, year: parts.year };
}

// "8 de nov. de 2026".
export function formatShortDate(iso: string): string {
  return PARTS.format(new Date(iso));
}

// "10/11/2026".
export function formatNumericDate(iso: string): string {
  return NUMERIC.format(new Date(iso));
}

// "8 de nov. de 2026" para evento de um dia — inclusive a noite que termina na madrugada seguinte,
// que o certificado também trata como um dia — ou sem data de fim.
// "6 a 8 de nov. de 2026", "30 de out. a 2 de nov. de 2026" ou
// "30 de dez. de 2026 a 2 de jan. de 2027" para vários dias: mês e ano só se repetem quando mudam.
export function formatEventPeriod(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  if (!endIso) return formatShortDate(startIso);

  const end = new Date(endIso);
  if (isSingleDayEvent(start, end)) return formatShortDate(startIso);

  const s = dayParts(start);
  const e = dayParts(end);
  if (s.day === e.day && s.month === e.month && s.year === e.year) {
    return formatShortDate(startIso);
  }
  if (s.year !== e.year) {
    return `${formatShortDate(startIso)} a ${formatShortDate(endIso)}`;
  }
  if (s.month !== e.month) {
    return `${s.day} de ${s.month} a ${e.day} de ${e.month} de ${e.year}`;
  }
  return `${s.day} a ${e.day} de ${e.month} de ${e.year}`;
}

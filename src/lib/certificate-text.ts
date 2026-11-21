// A redação do certificado, para a página pública de verificação mostrar as datas, o local e a
// carga horária com as mesmas palavras do PDF — quem confere compara o papel com a tela, e "8h" no
// papel contra "08:00" na tela pareceria outro documento.
//
// Cópia de `api_amparian/src/services/certificates/certificate-text.ts`: as duas precisam
// concordar. Toda data sai no horário de Brasília, como no PDF.

import { isSingleDayEvent } from "./hours";

const PARTS = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
});

type LocalParts = {
  day: number;
  month: string;
  year: number;
  hour: number;
  minute: number;
};

function localParts(date: Date): LocalParts {
  const parts = Object.fromEntries(
    PARTS.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    day: Number(parts.day),
    month: parts.month,
    year: Number(parts.year),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

// "1º de novembro", como se escreve o primeiro dia do mês em português.
function dayLabel(day: number): string {
  return day === 1 ? "1º" : String(day);
}

function hourLabel({ hour, minute }: LocalParts): string {
  return minute === 0 ? `${hour}h` : `${hour}h${String(minute).padStart(2, "0")}`;
}

// 0h e 1h são singulares em português: "da 1h", "à 0h".
function isSingularHour(parts: LocalParts): boolean {
  return parts.hour < 2;
}

function fromHour(parts: LocalParts): string {
  return `${isSingularHour(parts) ? "da" : "das"} ${hourLabel(parts)}`;
}

function toHour(parts: LocalParts): string {
  return `${isSingularHour(parts) ? "à" : "às"} ${hourLabel(parts)}`;
}

function sameDay(a: LocalParts, b: LocalParts): boolean {
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

/** "8 de novembro de 2026". */
export function formatLongDate(iso: string): string {
  const parts = localParts(new Date(iso));
  return `${dayLabel(parts.day)} de ${parts.month} de ${parts.year}`;
}

/**
 * O período como o certificado escreve depois de "realizada":
 * "em 8 de novembro de 2026, das 8h às 12h", "das 22h às 2h do dia seguinte",
 * "em 8 de novembro de 2026, a partir das 8h" (sem término) ou "de 6 a 8 de novembro de 2026".
 */
export function formatCertificatePeriod(startIso: string, endIso: string | null): string {
  const startsAt = new Date(startIso);
  const start = localParts(startsAt);

  if (!endIso) {
    return `em ${formatLongDate(startIso)}, a partir ${fromHour(start)}`;
  }

  const endsAt = new Date(endIso);
  const end = localParts(endsAt);
  if (isSingleDayEvent(startsAt, endsAt)) {
    // Terminar à 0h em ponto é o fim do próprio dia; 0h → 0h é o dia inteiro.
    const endsAtMidnight = end.hour === 0 && end.minute === 0;
    const startsAtMidnight = start.hour === 0 && start.minute === 0;
    const crossesMidnight = !sameDay(start, end) && (!endsAtMidnight || startsAtMidnight);
    const suffix = crossesMidnight ? " do dia seguinte" : "";
    return `em ${formatLongDate(startIso)}, ${fromHour(start)} ${toHour(end)}${suffix}`;
  }
  if (start.year !== end.year) {
    return `de ${formatLongDate(startIso)} a ${formatLongDate(endIso)}`;
  }
  if (start.month !== end.month) {
    return `de ${dayLabel(start.day)} de ${start.month} a ${dayLabel(end.day)} de ${end.month} de ${end.year}`;
  }
  return `de ${dayLabel(start.day)} a ${dayLabel(end.day)} de ${end.month} de ${end.year}`;
}

/**
 * Carga horária por extenso: "4 horas", "2 horas e 30 minutos", "30 minutos". `null` quando o
 * certificado não imprime carga — sem carga, ou menos de meio minuto, que sairia "0 minutos".
 */
export function formatWorkload(hours: number | null): string | null {
  if (hours === null) return null;
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes <= 0) return null;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hoursText = `${h} ${h === 1 ? "hora" : "horas"}`;
  const minutesText = `${m} ${m === 1 ? "minuto" : "minutos"}`;
  if (h === 0) return minutesText;
  if (m === 0) return hoursText;
  return `${hoursText} e ${minutesText}`;
}

/** O local como o certificado imprime, sem a preposição; `null` quando ele não imprime local. */
export function formatCertificateLocation(
  locationName: string | null,
  isRemote: boolean,
): string | null {
  if (isRemote) return "De forma remota";
  const name = locationName?.trim();
  return name ? name : null;
}

// Horas na interface e no formulário, sempre no formato brasileiro.
//
// A API trabalha com número (`4.5`); a tela mostra "4,5" e aceita que o organizador digite com
// vírgula ou com ponto. Um helper só para Home, Perfil, detalhe do evento e formulário, para as
// telas não divergirem entre si.

const HOURS_FORMAT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

const BRAZIL_LOCAL = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const DAY_MS = 24 * 3_600_000;
const OVERNIGHT_END_LIMIT_MINUTES = 6 * 60;

function brazilLocal(date: Date): { day: string; minutes: number } {
  const parts = Object.fromEntries(BRAZIL_LOCAL.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function nextDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + 1)).toISOString().slice(0, 10);
}

// Evento "de um dia": dura até 24h e termina no mesmo dia ou na madrugada seguinte, até as
// 6h, no horário de Brasília. Cópia de `isSingleDayEvent` da API — as duas precisam concordar.
export function isSingleDayEvent(start: Date, end: Date): boolean {
  const duration = end.getTime() - start.getTime();
  if (!(duration > 0) || duration > DAY_MS) return false;
  const s = brazilLocal(start);
  const e = brazilLocal(end);
  if (s.day === e.day) return true;
  return e.day === nextDay(s.day) && e.minutes <= OVERNIGHT_END_LIMIT_MINUTES;
}

// "18,5", "4", "2,25".
export function formatHours(value: number): string {
  return HOURS_FORMAT.format(value);
}

// "1 hora", "4 horas", "2,5 horas".
export function formatHoursLabel(value: number): string {
  return `${formatHours(value)} ${value === 1 ? "hora" : "horas"}`;
}

// Lê o que o organizador digitou. Devolve `null` para campo vazio e `NaN` para texto inválido —
// quem chama decide o que fazer com cada caso, e `NaN` nunca deve ir para a API, porque
// `JSON.stringify(NaN)` vira `null` em silêncio.
export function parseHoursInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Só dígitos com vírgula ou ponto decimal: `Number` aceitaria "Infinity", "1e2" e "0x10", e
  // `Infinity` também vira `null` no JSON, apagando a carga horária gravada sem aviso.
  if (!/^\d+([.,]\d+)?$/.test(trimmed)) return Number.NaN;
  return Number(trimmed.replace(",", "."));
}

// Carga horária calculada quando o organizador não informa nenhuma (RC-03): a duração do evento,
// se ele é de um dia — inclusive a noite que termina na madrugada seguinte, como 20h à 0h. Em
// evento de vários dias, ou sem horário de término, não há cálculo e o certificado mostra só o
// período.
//
// É a mesma regra de `effectiveWorkloadHours` na API, que é quem decide o que vai no certificado;
// aqui ela serve só para mostrar ao organizador, antes de salvar, o que valerá com o campo vazio.
export function durationWorkloadHours(startIso: string | null, endIso: string | null): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (!isSingleDayEvent(start, end)) return null;
  return Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
}

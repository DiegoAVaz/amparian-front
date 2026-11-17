// Horas na interface e no formulário, sempre no formato brasileiro.
//
// A API trabalha com número (`4.5`); a tela mostra "4,5" e aceita que o organizador digite com
// vírgula ou com ponto. Um helper só para Home, Perfil, detalhe do evento e formulário, para as
// telas não divergirem entre si.

const HOURS_FORMAT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

const BRAZIL_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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
// se ele começa e termina no mesmo dia no horário de Brasília. Em evento de vários dias, ou sem
// horário de término, não há cálculo e o certificado mostra só o período.
//
// É a mesma regra de `effectiveWorkloadHours` na API, que é quem decide o que vai no certificado;
// aqui ela serve só para mostrar ao organizador, antes de salvar, o que valerá com o campo vazio.
export function durationWorkloadHours(startIso: string | null, endIso: string | null): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  if (BRAZIL_DAY.format(start) !== BRAZIL_DAY.format(end)) return null;
  return Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 100) / 100;
}

// "Hoje" é calculado no fuso do app, não no do servidor (que costuma rodar em UTC).
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "America/Sao_Paulo";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayStr(timeZone = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

export function isValidDateStr(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  return dateStrToDbDate(value).toISOString().slice(0, 10) === value;
}

// Colunas @db.Date do Prisma são lidas e gravadas como meia-noite UTC.
export function dateStrToDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function dbDateToDateStr(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(
    dateStrToDbDate(value),
  );
}

export function formatLongDateTime(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

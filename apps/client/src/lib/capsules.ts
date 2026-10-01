import type { Capsule, CapsuleCategory, CapsuleColor } from "@repo/types";

// pocket: tom intermediário usado nas dobras de baixo do envelope do mural.
export const CAPSULE_COLOR_OPTIONS: Record<CapsuleColor, { name: string; bg: string; flap: string; pocket: string }> = {
  rosa: { name: "Rosa", bg: "#ff6ba8", flap: "#e12562", pocket: "#f2528f" },
  laranja: { name: "Laranja", bg: "#ff6419", flap: "#ec7323", pocket: "#f86c1e" },
  lima: { name: "Lima", bg: "#b4fa64", flap: "#9ee34c", pocket: "#a8ee58" },
  vinho: { name: "Vinho", bg: "#740255", flap: "#8f1a6e", pocket: "#820e62" },
};

export const CAPSULE_CATEGORY_OPTIONS: Record<CapsuleCategory, { label: string; bg: string; fg: string }> = {
  memoria: { label: "Memória", bg: "#ffd6e7", fg: "#8a0f45" },
  sonho: { label: "Sonho", bg: "#f1dcef", fg: "#5a0142" },
  meta: { label: "Meta", bg: "#dcf8b8", fg: "#2c4a08" },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const pad = (n: number) => String(n).padStart(2, "0");

// Datas como "AAAA-MM-DD" no horário local: new Date("2026-09-25") seria lido em UTC.
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isValidDateStr(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function formatShortDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/\./g, "");
}

function parseDateStr(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// "27 de junho de 2026"
export function formatLongDate(value: string): string {
  return parseDateStr(value).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export type CapsuleFilterKey = "all" | "locked" | "ready";

export const CAPSULE_FILTERS: { key: CapsuleFilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "locked", label: "Guardadas" },
  { key: "ready", label: "Disponíveis para abrir" },
];

// Mesma regra do server (isCapsuleLocked): a cápsula abre no dia de openDate.
export function isCapsuleReady(capsule: Capsule, today: string = todayStr()): boolean {
  return capsule.openDate <= today;
}

export function daysUntil(openDate: string, today: string = todayStr()): number {
  const diff = parseDateStr(openDate).getTime() - parseDateStr(today).getTime();
  return Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)));
}

export function matchesFilter(capsule: Capsule, filter: CapsuleFilterKey, today: string = todayStr()): boolean {
  if (filter === "all") return true;
  const ready = isCapsuleReady(capsule, today);
  return filter === "ready" ? ready : !ready;
}

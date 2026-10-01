import type { Letter, LetterCategory } from "@repo/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type CapsuleFilterKey = "all" | "locked" | "ready";

export const CAPSULE_FILTERS: { key: CapsuleFilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "locked", label: "Guardadas" },
  { key: "ready", label: "Disponíveis para abrir" },
];

type CategoryStyle = {
  label: string;
  envelope: string;
  flap: string;
  pocket: string;
};

export const CATEGORY_STYLES: Record<LetterCategory, CategoryStyle> = {
  memoria: {
    label: "Memória",
    envelope: "#ff72ad",
    flap: "#e3245f",
    pocket: "#f2528f",
  },
  sonho: {
    label: "Sonho",
    envelope: "#b6f56d",
    flap: "#9ee34b",
    pocket: "#a4ea57",
  },
  conselho: {
    label: "Conselho",
    envelope: "#b69cff",
    flap: "#8a63f5",
    pocket: "#a184fb",
  },
};

// Mesma regra do server (letters.service.ts): a carta abre no instante exato de deliverAt.
export function isLetterReady(letter: Letter, now: Date = new Date()): boolean {
  return new Date(letter.deliverAt).getTime() <= now.getTime();
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS));
}

export function matchesFilter(letter: Letter, filter: CapsuleFilterKey, now: Date = new Date()): boolean {
  if (filter === "all") return true;
  const ready = isLetterReady(letter, now);
  return filter === "ready" ? ready : !ready;
}

// "25 de set de 2026"
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(iso))
    .replace(/\./g, "");
}

// "27 de junho de 2026"
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

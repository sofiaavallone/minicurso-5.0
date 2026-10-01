import type { Capsule, CapsuleCategory, CapsuleColor, CreateCapsuleInput } from "@repo/types";
import type { Capsule as CapsuleRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { dateStrToDbDate, dbDateToDateStr, todayStr } from "../lib/dates";

export function isCapsuleLocked(openDate: string, today: string = todayStr()): boolean {
  return openDate > today;
}

function toCapsule(row: CapsuleRow): Capsule {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    openDate: dbDateToDateStr(row.openDate),
    category: row.category as CapsuleCategory,
    color: row.color as CapsuleColor,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
    sentAt: row.sentAt?.toISOString() ?? null,
  };
}

export async function createCapsule(input: CreateCapsuleInput): Promise<Capsule> {
  const row = await prisma.capsule.create({
    data: { ...input, openDate: dateStrToDbDate(input.openDate) },
  });
  return toCapsule(row);
}

// Cápsula guardada sai com a mensagem vazia: o conteúdo só deixa o servidor na data de abertura.
export async function listCapsules(): Promise<Capsule[]> {
  const rows = await prisma.capsule.findMany({ orderBy: { openDate: "asc" } });
  return rows.map((row) => {
    const capsule = toCapsule(row);
    return isCapsuleLocked(capsule.openDate) ? { ...capsule, message: "" } : capsule;
  });
}

export async function deleteCapsule(id: string): Promise<boolean> {
  const { count } = await prisma.capsule.deleteMany({ where: { id } });
  return count === 1;
}

export async function findDueCapsules(): Promise<CapsuleRow[]> {
  return prisma.capsule.findMany({
    where: { sentAt: null, openDate: { lte: dateStrToDbDate(todayStr()) } },
    orderBy: { openDate: "asc" },
  });
}

// Marca como enviada antes de enviar: se outro processo já pegou a cápsula, count vem 0.
export async function claimCapsule(id: string): Promise<boolean> {
  const { count } = await prisma.capsule.updateMany({ where: { id, sentAt: null }, data: { sentAt: new Date() } });
  return count === 1;
}

export async function releaseCapsule(id: string): Promise<void> {
  await prisma.capsule.update({ where: { id }, data: { sentAt: null } });
}

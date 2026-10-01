import type { Letter as LetterRow } from "@prisma/client";
import type { Letter, LetterCategory } from "@repo/types";
import { prisma } from "../lib/prisma";

export type LetterInput = {
  title: string;
  category: LetterCategory;
  content: string;
  deliverAt: Date;
  authorName?: string | null;
};

export function isLetterLocked(deliverAt: Date | string, now: Date = new Date()): boolean {
  return new Date(deliverAt).getTime() > now.getTime();
}

// Converte a linha do banco no tipo compartilhado. Enquanto a carta estiver
// guardada, o conteúdo não sai do servidor: é esse o sentido da cápsula.
function toLetter(row: LetterRow): Letter {
  return {
    id: row.id,
    authorName: row.authorName,
    title: row.title,
    category: row.category,
    content: isLetterLocked(row.deliverAt) ? "" : row.content,
    deliverAt: row.deliverAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLetters(): Promise<Letter[]> {
  const rows = await prisma.letter.findMany({ orderBy: { deliverAt: "asc" } });
  return rows.map(toLetter);
}

export async function getLetterById(id: string): Promise<Letter | null> {
  const row = await prisma.letter.findUnique({ where: { id } });
  return row ? toLetter(row) : null;
}

export async function createLetter(input: LetterInput): Promise<Letter> {
  const row = await prisma.letter.create({ data: input });
  return toLetter(row);
}

export async function updateLetter(id: string, input: Partial<LetterInput>): Promise<Letter | null> {
  const exists = await prisma.letter.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;
  const row = await prisma.letter.update({ where: { id }, data: input });
  return toLetter(row);
}

export async function deleteLetter(id: string): Promise<boolean> {
  const { count } = await prisma.letter.deleteMany({ where: { id } });
  return count > 0;
}

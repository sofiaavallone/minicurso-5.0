import type { Request, Response } from "express";
import { z } from "zod";
import type { ApiResponse, Letter } from "@repo/types";
import {
  createLetter,
  deleteLetter,
  getLetterById,
  isLetterLocked,
  listLetters,
  updateLetter,
} from "../services/letters.service";

const letterSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório").max(120),
  category: z.enum(["memoria", "sonho", "conselho"]),
  content: z.string().trim().min(1, "A carta não pode estar vazia").max(10_000),
  // Só string ISO ou Date: z.coerce.date sozinho transformaria null em 1970.
  deliverAt: z
    .union([z.string(), z.date()], { errorMap: () => ({ message: "Data de abertura inválida" }) })
    .pipe(z.coerce.date({ invalid_type_error: "Data de abertura inválida" })),
  authorName: z.string().trim().max(80).nullish(),
});

// Uma cápsula nova precisa ser guardada para o futuro.
const createLetterSchema = letterSchema.refine((data) => isLetterLocked(data.deliverAt), {
  message: "A data de abertura precisa estar no futuro",
  path: ["deliverAt"],
});

const updateLetterSchema = letterSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Envie ao menos um campo para atualizar",
});

type IdParams = { id: string };

function validationError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
}

export async function getLetters(_req: Request, res: Response<ApiResponse<Letter[]>>) {
  const letters = await listLetters();
  res.json({ data: letters });
}

export async function getLetter(req: Request<IdParams>, res: Response<ApiResponse<Letter | null>>) {
  const letter = await getLetterById(req.params.id);
  if (!letter) {
    return res.status(404).json({ data: null, error: "Carta não encontrada" });
  }
  if (isLetterLocked(letter.deliverAt)) {
    return res.status(403).json({ data: letter, error: "Ainda não chegou a hora de abrir esta carta" });
  }
  res.json({ data: letter });
}

export async function postLetter(req: Request, res: Response<ApiResponse<Letter | null>>) {
  const parsed = createLetterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: validationError(parsed.error) });
  }
  const letter = await createLetter(parsed.data);
  res.status(201).json({ data: letter, message: "Carta guardada com sucesso" });
}

export async function putLetter(req: Request<IdParams>, res: Response<ApiResponse<Letter | null>>) {
  const current = await getLetterById(req.params.id);
  if (!current) {
    return res.status(404).json({ data: null, error: "Carta não encontrada" });
  }
  // Depois de fechada, a cápsula só pode ser aberta na data marcada, nunca alterada.
  if (isLetterLocked(current.deliverAt)) {
    return res.status(403).json({ data: null, error: "Cartas guardadas não podem ser editadas" });
  }
  const parsed = updateLetterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ data: null, error: validationError(parsed.error) });
  }
  const letter = await updateLetter(req.params.id, parsed.data);
  if (!letter) {
    return res.status(404).json({ data: null, error: "Carta não encontrada" });
  }
  res.json({ data: letter, message: "Carta atualizada" });
}

export async function removeLetter(req: Request<IdParams>, res: Response<ApiResponse<null>>) {
  const deleted = await deleteLetter(req.params.id);
  if (!deleted) {
    return res.status(404).json({ data: null, error: "Carta não encontrada" });
  }
  res.json({ data: null, message: "Carta excluída" });
}

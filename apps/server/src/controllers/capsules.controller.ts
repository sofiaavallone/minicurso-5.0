import type { Request, Response } from "express";
import type { ApiResponse, Capsule, CapsuleFieldErrors, ValidationErrorResponse } from "@repo/types";
import { capsuleLetterHtml } from "../emails/capsule-letter";
import { todayStr } from "../lib/dates";
import { createCapsuleSchema } from "../schemas/capsule.schema";
import { createCapsule, deleteCapsule, listCapsules } from "../services/capsules.service";
import { sendDueCapsules } from "../jobs/send-due-capsules";

export async function postCapsule(
  req: Request,
  res: Response<ApiResponse<Capsule> | ValidationErrorResponse | { error: string }>,
) {
  const parsed = createCapsuleSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const fieldErrors: CapsuleFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof CapsuleFieldErrors;
      fieldErrors[field] ??= issue.message;
    }
    res.status(400).json({ error: "validation", fieldErrors });
    return;
  }

  try {
    const capsule = await createCapsule(parsed.data);
    res.status(201).json({ data: capsule });
    if (capsule.openDate <= todayStr()) void sendDueCapsules();
  } catch (error) {
    console.error("Falha ao guardar cápsula.", error);
    res.status(500).json({ error: "Não foi possível guardar a cápsula." });
  }
}

export async function getCapsules(_req: Request, res: Response<ApiResponse<Capsule[]>>) {
  const capsules = await listCapsules();
  res.json({ data: capsules });
}

export async function removeCapsule(req: Request<{ id: string }>, res: Response<ApiResponse<null>>) {
  const deleted = await deleteCapsule(req.params.id);
  if (!deleted) {
    res.status(404).json({ data: null, error: "Cápsula não encontrada" });
    return;
  }
  res.status(204).end();
}

export function getEmailPreview(_req: Request, res: Response) {
  res.type("html").send(
    capsuleLetterHtml({
      title: "Uma conquista que merece ser lembrada",
      message: "Hoje fiz algo que eu adiava há muito tempo.\n\nLembre de como você teve medo — e foi mesmo assim.",
      category: "memoria",
      writtenOn: "25 de junho de 2026",
      openDate: "2026-09-25",
      appUrl: process.env.WEB_URL ?? "http://localhost:3000",
    }),
  );
}

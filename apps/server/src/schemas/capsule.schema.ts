import { z } from "zod";
import { CAPSULE_CATEGORIES, CAPSULE_COLORS } from "@repo/types";
import { isValidDateStr, todayStr } from "../lib/dates";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const createCapsuleSchema = z.object({
  title: z
    .string({ required_error: "Dê um título para sua cápsula." })
    .trim()
    .min(1, "Dê um título para sua cápsula.")
    .max(90, "Use no máximo 90 caracteres no título."),
  message: z
    .string({ required_error: "Escreva uma mensagem para o futuro." })
    .transform((value) => value.replace(/\s+$/, ""))
    .refine((value) => value.trim().length > 0, "Escreva uma mensagem para o futuro.")
    .refine((value) => value.length <= 10000, "A mensagem pode ter no máximo 10.000 caracteres."),
  openDate: z
    .string({ required_error: "Escolha quando a carta poderá ser aberta." })
    .min(1, "Escolha quando a carta poderá ser aberta.")
    .refine(isValidDateStr, "Use uma data válida.")
    .refine((value) => value >= todayStr(), "Escolha hoje ou uma data futura."),
  category: z.enum(CAPSULE_CATEGORIES).default("memoria"),
  color: z.enum(CAPSULE_COLORS).default("rosa"),
  email: z
    .string({ required_error: "Informe o e-mail que vai receber a carta." })
    .trim()
    .min(1, "Informe o e-mail que vai receber a carta.")
    .regex(EMAIL_RE, "Confira o e-mail — parece faltar algo."),
});

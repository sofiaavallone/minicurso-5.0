import type { CapsuleCategory } from "@repo/types";
import { capsuleLetterHtml, capsuleLetterSubject, capsuleLetterText } from "../emails/capsule-letter";
import { dbDateToDateStr, formatLongDateTime } from "../lib/dates";
import { isMailerConfigured, sendMail } from "../lib/mailer";
import { claimCapsule, findDueCapsules, releaseCapsule } from "../services/capsules.service";

const INTERVAL_MS = 10 * 60 * 1000;
const appUrl = process.env.WEB_URL ?? "http://localhost:3000";

let running = false;

export async function sendDueCapsules(): Promise<void> {
  if (running || !isMailerConfigured) return;
  running = true;
  try {
    const due = await findDueCapsules();
    for (const capsule of due) {
      if (!(await claimCapsule(capsule.id))) continue;
      const data = {
        title: capsule.title,
        message: capsule.message,
        category: capsule.category as CapsuleCategory,
        writtenOn: formatLongDateTime(capsule.createdAt),
        openDate: dbDateToDateStr(capsule.openDate),
        appUrl,
      };
      try {
        await sendMail({
          to: capsule.email,
          subject: capsuleLetterSubject(capsule.title),
          html: capsuleLetterHtml(data),
          text: capsuleLetterText(data),
        });
        console.log(`✉️  Carta ${capsule.id} enviada para ${capsule.email}`);
      } catch (error) {
        await releaseCapsule(capsule.id);
        console.error(`Falha ao enviar a carta ${capsule.id}; nova tentativa na próxima rodada.`, error);
      }
    }
  } catch (error) {
    console.error("Falha ao buscar cartas para enviar.", error);
  } finally {
    running = false;
  }
}

export function startCapsuleMailer(): void {
  if (!isMailerConfigured) {
    console.warn("⚠️  SMTP não configurado: as cartas ficam guardadas e serão enviadas quando SMTP_HOST for definido.");
    return;
  }
  void sendDueCapsules();
  setInterval(() => void sendDueCapsules(), INTERVAL_MS);
}

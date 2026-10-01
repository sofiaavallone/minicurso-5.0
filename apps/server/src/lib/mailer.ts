import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const mailFrom = process.env.MAIL_FROM ?? "Minha próxima versão <cartas@minhaproximaversao.local>";

export const isMailerConfigured = Boolean(host);

const transporter = isMailerConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    })
  : null;

export async function sendMail(message: { to: string; subject: string; html: string; text: string }) {
  if (!transporter) {
    throw new Error("SMTP não configurado: defina SMTP_HOST no .env do server");
  }
  await transporter.sendMail({ from: mailFrom, ...message });
}

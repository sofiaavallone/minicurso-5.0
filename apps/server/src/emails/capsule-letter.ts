import type { CapsuleCategory } from "@repo/types";
import { formatLongDate } from "../lib/dates";

const CATEGORY_STYLES: Record<CapsuleCategory, { label: string; bg: string; fg: string }> = {
  memoria: { label: "Memória", bg: "#ffd6e7", fg: "#8a0f45" },
  sonho: { label: "Sonho", bg: "#f1dcef", fg: "#5a0142" },
  meta: { label: "Meta", bg: "#dcf8b8", fg: "#2c4a08" },
};

export interface CapsuleLetterData {
  title: string;
  message: string;
  category: CapsuleCategory;
  writtenOn: string;
  openDate: string;
  appUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function capsuleLetterSubject(title: string): string {
  return `✦ Chegou a hora: ${title}`;
}

export function capsuleLetterText(data: CapsuleLetterData): string {
  return [
    "✦ CÁPSULA DO TEMPO ✦",
    "",
    "Chegou a hora de abrir sua carta.",
    `Em ${data.writtenOn}, você escreveu para quem estaria lendo hoje.`,
    "",
    `[${CATEGORY_STYLES[data.category].label}] ${data.title}`,
    "",
    data.message,
    "",
    `escrita em: ${data.writtenOn}`,
    `aberta a partir de: ${formatLongDate(data.openDate)}`,
    "",
    "E agora, o que a próxima versão de você quer guardar?",
    `Escrever uma nova cápsula: ${data.appUrl}`,
  ].join("\n");
}

export function capsuleLetterHtml(data: CapsuleLetterData): string {
  const category = CATEGORY_STYLES[data.category];
  const title = escapeHtml(data.title);
  const message = escapeHtml(data.message).replace(/\r?\n/g, "<br>");
  const writtenOn = escapeHtml(data.writtenOn);
  const opensOn = escapeHtml(formatLongDate(data.openDate));
  const appUrl = escapeHtml(data.appUrl);

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Chegou a hora de abrir sua carta</title>
<style>
@media (max-width:620px){.wrap{width:100% !important}.px{padding-left:22px !important;padding-right:22px !important}.letter{padding:28px 22px !important}.h1{font-size:30px !important;line-height:36px !important}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#fce8f1;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fce8f1;font-size:1px;line-height:1px;">A você do passado deixou uma mensagem guardada. Hoje é o dia de abrir.&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fce8f1;">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="wrap" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

  <tr><td class="px" style="padding:0 8px 18px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:24px;color:#131313;mso-line-height-rule:exactly;">Minha próxima versão</td>
      <td align="right" style="font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;line-height:24px;mso-line-height-rule:exactly;"><span style="color:#ff6419;">&#10022;</span><span style="color:#e12562;">&lt;div&gt;</span><span style="color:#ff6419;">a&#10022;</span></td>
    </tr></table>
  </td></tr>

  <tr><td bgcolor="#ff6ba8" style="background-color:#ff6ba8;border-radius:20px 20px 0 0;padding:36px 40px 0;" class="px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="font-family:'Courier New',Courier,monospace;font-size:13px;line-height:18px;color:#131313;letter-spacing:1px;mso-line-height-rule:exactly;">&#10022; CÁPSULA DO TEMPO &#10022;</td></tr>
      <tr><td align="center" class="h1" style="padding:14px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:44px;color:#131313;mso-line-height-rule:exactly;">Chegou a hora de<br><em style="color:#740255;">abrir sua carta.</em></td></tr>
      <tr><td align="center" style="padding:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#131313;mso-line-height-rule:exactly;">Em ${writtenOn}, você escreveu para quem estaria lendo hoje.</td></tr>
      <tr><td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="56" height="56" align="center" bgcolor="#b4fa64" style="width:56px;height:56px;background-color:#b4fa64;border-radius:28px;font-size:24px;line-height:56px;color:#131313;mso-line-height-rule:exactly;">&#10022;</td>
        </tr></table>
      </td></tr>
      <tr><td height="20" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="#ff6ba8" style="background-color:#ff6ba8;padding:0 24px;" class="px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td class="letter" bgcolor="#fffdfd" style="background-color:#fffdfd;border-radius:6px 6px 0 0;border-left:3px dotted #ff6ba8;padding:40px 44px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding-bottom:18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td bgcolor="${category.bg}" style="background-color:${category.bg};border-radius:999px;padding:5px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:16px;color:${category.fg};mso-line-height-rule:exactly;">${category.label}</td>
            </tr></table>
          </td></tr>
          <tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:38px;color:#740255;padding-bottom:22px;border-bottom:2px dotted #ff6ba8;mso-line-height-rule:exactly;">${title}</td></tr>
          <tr><td style="padding-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:30px;color:#131313;mso-line-height-rule:exactly;">
            ${message}
          </td></tr>
          <tr><td style="padding-top:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px dotted #f2c4d8;"><tr>
              <td width="50%" valign="top" style="padding-top:16px;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:12px;line-height:16px;color:#74025f;">escrita em</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:#131313;">${writtenOn}</div>
              </td>
              <td width="50%" valign="top" style="padding-top:16px;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:12px;line-height:16px;color:#74025f;">aberta a partir de</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:#131313;">${opensOn}</div>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="#fffdfd" style="background-color:#fffdfd;border-radius:0 0 20px 20px;padding:32px 40px 40px;border-top:3px solid #e12562;" class="px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:28px;color:#131313;padding-bottom:22px;mso-line-height-rule:exactly;">E agora, o que a próxima versão de você quer guardar?</td></tr>
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td bgcolor="#131313" style="background-color:#131313;border-radius:999px;">
            <a href="${appUrl}" target="_blank" style="display:block;padding:16px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:20px;color:#fff5fa;text-decoration:none;border-radius:999px;"><span style="color:#ff6419;">&#10022;</span>&nbsp; Escrever uma nova cápsula</a>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:24px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#423a39;text-align:center;">
    Você recebeu este e-mail porque agendou esta carta em <em>Minha próxima versão</em>, uma experiência <span style="font-family:'Courier New',Courier,monospace;font-weight:bold;"><span style="color:#ff6419;">&#10022;</span>&lt;div&gt;<span style="color:#ff6419;">a&#10022;</span></span>.
  </td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

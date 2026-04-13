import nodemailer from "nodemailer";
import type { StoredBooking, VoucherOrder } from "@/lib/store";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Die Umgebungsvariable ${name} fehlt.`);
  }
  return value;
}

function getOptionalEnv(name: string, fallback: string) {
  return process.env[name] || fallback;
}

function formatBookingDate(date: string, startZeit: string, endZeit: string) {
  const label = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));

  return `${label}, ${startZeit} bis ${endZeit} Uhr`;
}

function formatVoucherDate(isoDate: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(isoDate));
}

function createTransport() {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || "587");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    requireTLS: port !== 465
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailLayout(title: string, intro: string, rows: Array<{ label: string; value: string }>, closing: string) {
  const closingHtml = closing.trim()
    ? closing
        .split("\n\n")
        .map(
          (paragraph, index) =>
            `<p style="margin:${index === 0 ? "0 0 14px" : "0 0 12px"};color:#725f5a;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.65;">${escapeHtml(paragraph)}</p>`
        )
        .join("")
    : "";

  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0 4px;color:#8b4a53;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            ${escapeHtml(row.label)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 14px;color:#2b1917;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.45;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html lang="de">
      <body style="margin:0;padding:24px;background:#efe3d7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border-collapse:collapse;background:#fffaf5;border:1px solid #decabf;border-radius:28px;overflow:hidden;">
                <tr>
                  <td style="padding:26px 28px 18px;background:linear-gradient(180deg,#fffdf9,#f8eee4);border-bottom:1px solid #ead8cc;">
                    <div style="color:#c3132a;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Kosmetikstudio in Köln-Ehrenfeld</div>
                    <div style="margin-top:12px;color:#191111;font-family:Georgia,'Times New Roman',serif;font-size:40px;font-style:italic;font-weight:700;line-height:1.02;">
                      <span style="white-space:nowrap;">Schön in Köln</span>
                    </div>
                    <div style="margin-top:10px;color:#2b1917;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;line-height:1.12;">
                      ${escapeHtml(title)}
                    </div>
                    <div style="margin-top:10px;color:#725f5a;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.6;">
                      ${escapeHtml(intro)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      ${rowsHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 24px;">
                    ${closingHtml}
                    <div style="margin-top:18px;color:#c3132a;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
                      Kosmetik Silke Wiertz
                    </div>
                    <div style="margin-top:6px;color:#191111;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-style:italic;font-weight:700;line-height:1.05;">
                      <span style="white-space:nowrap;">Schön in Köln</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 26px;background:#f8eee4;border-top:1px solid #ead8cc;color:#6e5b55;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;">
                    Schön in Köln · Steinkrügerstraße 9 · 50825 Köln<br />
                    Telefon 0172/8903667 · info@schoeninkoeln.de
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getBankDetails() {
  return {
    accountHolder: getOptionalEnv("BANK_ACCOUNT_HOLDER", "Bitte Kontoinhaber ergänzen"),
    bank: getOptionalEnv("BANK_NAME", "Bitte Bankname ergänzen"),
    iban: getOptionalEnv("BANK_IBAN", "Bitte IBAN ergänzen"),
    bic: process.env.BANK_BIC?.trim() || ""
  };
}

export async function verifyEmailConfiguration() {
  const transporter = createTransport();
  await transporter.verify();
}

export async function sendBookingEmails(booking: StoredBooking) {
  const transporter = createTransport();
  const from = getRequiredEnv("MAIL_FROM");
  const studioRecipient = getRequiredEnv("MAIL_TO_STUDIO");
  const when = formatBookingDate(booking.date, booking.startZeit, booking.endZeit);
  const telefon = booking.telefon || "nicht angegeben";
  const notiz = booking.notiz || "kein Hinweis";

  await transporter.sendMail({
    from,
    to: studioRecipient,
    subject: `Neue Buchung: ${booking.kundin}`,
    text: [
      "Es ist eine neue Online-Buchung eingegangen.",
      "",
      `Name: ${booking.kundin}`,
      `Behandlung: ${booking.leistung}`,
      `Termin: ${when}`,
      `E-Mail: ${booking.email}`,
      `Telefon: ${telefon}`,
      `Hinweis: ${notiz}`
    ].join("\n"),
    html: renderEmailLayout(
      "Neue Online-Buchung",
      "Über die Website ist eine neue Buchung eingegangen.",
      [
        { label: "Name", value: booking.kundin },
        { label: "Behandlung", value: booking.leistung },
        { label: "Termin", value: when },
        { label: "E-Mail", value: booking.email },
        { label: "Telefon", value: telefon },
        { label: "Hinweis", value: notiz }
      ],
      "Bitte prüfen Sie den Termin im internen Kalender."
    )
  });

  await transporter.sendMail({
    from,
    to: booking.email,
    subject: "Ihre Buchung bei Kosmetik Schön in Köln",
    text: [
      "Vielen Dank für Ihre Buchung bei Schön in Köln.",
      "",
      `Behandlung: ${booking.leistung}`,
      `Termin: ${when}`,
      "Bei Rückfragen kontaktieren Sie mich gerne unter 0172/8903667.",
      "",
      "Ich freue mich auf Sie.",
      "",
      "Herzliche Grüße,",
      "Silke Wiertz",
      "",
      "Schön in Köln"
    ].join("\n"),
    html: renderEmailLayout(
      "Ihre Buchung",
      "Vielen Dank für Ihre Buchung bei Schön in Köln.",
      [
        { label: "Behandlung", value: booking.leistung },
        { label: "Termin", value: when },
        { label: "Kontakt", value: "Bei Rückfragen kontaktieren Sie mich gerne unter 0172/8903667." }
      ],
      "Ich freue mich auf Sie.\n\nHerzliche Grüße,\nSilke Wiertz"
    )
  });
}

export async function sendVoucherEmails(order: VoucherOrder, pdfBytes: Uint8Array) {
  const transporter = createTransport();
  const from = getRequiredEnv("MAIL_FROM");
  const studioRecipient = getRequiredEnv("MAIL_TO_STUDIO");
  const bank = getBankDetails();
  const voucherLabel =
    order.typ === "wert" && order.wertEuro
      ? `Wertgutschein über ${order.wertEuro.toFixed(2).replace(".", ",")} €`
      : `Gutschein für ${order.leistungName || "eine Behandlung"}`;

  const attachment = {
    filename: `gutschein-${order.nummer}.pdf`,
    content: Buffer.from(pdfBytes),
    contentType: "application/pdf"
  };

  await transporter.sendMail({
    from,
    to: studioRecipient,
    subject: `Neue Gutscheinbestellung: ${order.beschenktePerson}`,
    text: [
      "Es ist eine neue Gutscheinbestellung eingegangen.",
      "",
      `Gutschein-Nr.: ${order.nummer}`,
      `Besteller: ${order.bestellerName}`,
      `E-Mail: ${order.bestellerEmail}`,
      `Für: ${order.beschenktePerson}`,
      `Art: ${voucherLabel}`,
      `Widmung: ${order.widmung || "keine Widmung"}`,
      "",
      "Der Gutschein wurde der bestellenden Person bereits als PDF zugesendet."
    ].join("\n"),
    html: renderEmailLayout(
      "Neue Gutscheinbestellung",
      "Über die Website wurde ein neuer Gutschein bestellt.",
      [
        { label: "Gutschein-Nr.", value: order.nummer },
        { label: "Besteller", value: order.bestellerName },
        { label: "E-Mail", value: order.bestellerEmail },
        { label: "Für", value: order.beschenktePerson },
        { label: "Art", value: voucherLabel },
        { label: "Widmung", value: order.widmung || "keine Widmung" }
      ],
      ""
    ),
    attachments: [attachment]
  });

  await transporter.sendMail({
    from,
    to: order.bestellerEmail,
    subject: "Ihr Gutschein von Kosmetik Schön in Köln",
    text: [
      "Vielen Dank für Ihre Bestellung.",
      "",
      `Gutschein-Nr.: ${order.nummer}`,
      `Für: ${order.beschenktePerson}`,
      `Art: ${voucherLabel}`,
      `Datum: ${formatVoucherDate(order.createdAt)}`,
      "",
      "Der Gutschein ist sofort als PDF beigefügt, wird jedoch erst nach Zahlungseingang gültig.",
      "",
      `Kontoinhaber: ${bank.accountHolder}`,
      `Bank: ${bank.bank}`,
      `IBAN: ${bank.iban}`,
      ...(bank.bic ? [`BIC: ${bank.bic}`] : []),
      "",
      "Bitte geben Sie bei der Überweisung die Gutschein-Nummer an.",
      "",
      "Herzliche Grüße,",
      "Silke Wiertz",
      "",
      "Schön in Köln"
    ].join("\n"),
    html: renderEmailLayout(
      "",
      "Vielen Dank für Ihre Bestellung",
      [
        { label: "Gutschein-Nr.", value: order.nummer },
        { label: "Für", value: order.beschenktePerson },
        { label: "Art", value: voucherLabel },
        { label: "Datum", value: formatVoucherDate(order.createdAt) },
        { label: "Kontoinhaber", value: bank.accountHolder },
        { label: "Bank", value: bank.bank },
        { label: "IBAN", value: bank.iban },
        ...(bank.bic ? [{ label: "BIC", value: bank.bic }] : [])
      ],
      "Der Gutschein ist als PDF beigefügt und wird nach Zahlungseingang gültig.\n\nBitte geben Sie bei der Überweisung die Gutschein-Nummer an.\n\nHerzliche Grüße,\nSilke Wiertz"
    ),
    attachments: [attachment]
  });
}

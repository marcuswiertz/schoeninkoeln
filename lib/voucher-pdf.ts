import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { VoucherOrder } from "@/lib/store";

function formatVoucherDate(isoDate: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(isoDate));
}

function wrapText(text: string, maxLength: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function createVoucherPdf(order: VoucherOrder) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const cardWidth = width;
  const cardHeight = height / 2;
  const cardX = 0;
  const cardY = height / 2;
  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const red = rgb(0.78, 0.07, 0.14);
  const black = rgb(0.12, 0.08, 0.08);
  const muted = rgb(0.44, 0.35, 0.33);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1)
  });

  page.drawRectangle({
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1, 1, 1)
  });

  page.drawLine({
    start: { x: 24, y: height / 2 },
    end: { x: width - 24, y: height / 2 },
    thickness: 0.2,
    color: muted
  });

  const logoBytes = await readFile(path.join(process.cwd(), "public", "logo-neu-tight.png"));
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoScale = Math.min(210 / logoImage.width, 74 / logoImage.height);
  const logoWidth = logoImage.width * logoScale;
  const logoHeight = logoImage.height * logoScale;
  page.drawImage(logoImage, {
    x: cardX + cardWidth - 28 - logoWidth,
    y: cardY + cardHeight - 118,
    width: logoWidth,
    height: logoHeight
  });

  page.drawText("Gutschein", {
    x: cardX + 28,
    y: cardY + cardHeight - 108,
    size: 32,
    font: serifBold,
    color: black
  });

  const giftText =
    order.typ === "wert" && order.wertEuro
      ? `${order.wertEuro.toFixed(2).replace(".", ",")} €`
      : order.leistungName || "";

  page.drawText("über", {
    x: cardX + 28,
    y: cardY + cardHeight - 164,
    size: 16,
    font: sans,
    color: red
  });

  page.drawText(giftText, {
    x: cardX + 28,
    y: cardY + cardHeight - 198,
    size: 24,
    font: serif,
    color: black
  });

  page.drawText("für", {
    x: cardX + 28,
    y: cardY + cardHeight - 254,
    size: 16,
    font: sans,
    color: red
  });

  page.drawText(order.beschenktePerson, {
    x: cardX + 28,
    y: cardY + cardHeight - 290,
    size: 24,
    font: serifBold,
    color: black
  });

  const messageParagraphs = [order.widmung, order.schenkerName].filter(Boolean);
  if (messageParagraphs.length) {
    messageParagraphs.slice(0, 2).forEach((paragraph, index) => {
      const [line] = wrapText(paragraph, index === 0 ? 52 : 34);
      if (!line) return;
      page.drawText(line, {
        x: cardX + 28,
        y: cardY + cardHeight - 344 - index * 24,
        size: 14,
        font: serifItalic,
        color: muted
      });
    });
  }

  page.drawLine({
    start: { x: cardX + 28, y: cardY + 24 },
    end: { x: cardX + 118, y: cardY + 24 },
    thickness: 0.5,
    color: rgb(0.84, 0.78, 0.73)
  });

  const signatureBytes = await readFile(path.join(process.cwd(), "public", "unterschrift-silke.jpg"));
  const signatureImage = await pdfDoc.embedJpg(signatureBytes);
  const signatureScale = Math.min(150 / signatureImage.width, 46 / signatureImage.height);
  const signatureWidth = signatureImage.width * signatureScale;
  const signatureHeight = signatureImage.height * signatureScale;
  const metaBlockWidth = 72;
  const signatureRightX = cardX + cardWidth - 28;

  page.drawImage(signatureImage, {
    x: signatureRightX - signatureWidth,
    y: cardY + 100,
    width: signatureWidth,
    height: signatureHeight
  });

  const scriptBytes = await readFile(path.join(process.cwd(), "public", "1000b.png"));
  const scriptImage = await pdfDoc.embedPng(scriptBytes);
  const scriptScale = Math.min(120 / scriptImage.width, 24 / scriptImage.height);
  const scriptWidth = scriptImage.width * scriptScale;
  const scriptHeight = scriptImage.height * scriptScale;
  page.drawImage(scriptImage, {
    x: signatureRightX - scriptWidth,
    y: cardY + 72,
    width: scriptWidth,
    height: scriptHeight
  });

  page.drawText(order.nummer, {
    x: signatureRightX - metaBlockWidth,
    y: cardY + 24,
    size: 12,
    font: sans,
    color: red
  });

  page.drawText(formatVoucherDate(order.createdAt), {
    x: signatureRightX - metaBlockWidth,
    y: cardY + 10,
    size: 12,
    font: sans,
    color: muted
  });

  page.drawText("Terminabsprache: 0172/8903667 * info@schoeninkoeln.de.", {
    x: cardX + 28,
    y: cardY + 20,
    size: 9,
    font: sans,
    color: muted
  });

  page.drawText("Bitte geben Sie bei der Terminvereinbarung Ihre Gutscheinnummer an.", {
    x: cardX + 28,
    y: cardY + 8,
    size: 9,
    font: sans,
    color: muted
  });

  return pdfDoc.save();
}

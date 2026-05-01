const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const priceGroups = [
  {
    title: "",
    items: [
      {
        name: "Neukundenbehandlung",
        price: "69,- EUR",
        description: "Anamnese, Reinigung, Peeling, Ausreinigung, Maske, Kurzmassage."
      },
      {
        name: "Pflegeberatung VON LUPIN",
        price: "69,- EUR",
        description:
          "Anamnese und Hautanalyse, Hautreinigung mit Cleanser und biologisches Peeling, Tiefenpflege, Maske-Intensivpflege und Abschlusspflege mit pers\u00f6nlicher Pflegeberatung.",
        note: "Ohne Ausreinigung, ohne Massage."
      }
    ]
  },
  {
    title: "Basis-Behandlungen",
    items: [
      {
        name: "Pur",
        price: "59,- EUR",
        description:
          "Reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        name: "Pur Clean",
        price: "68,- EUR",
        description:
          "Intensive reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Tiefenreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        name: "Entspannung",
        price: "79,- EUR",
        description:
          "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske, Abschlusspflege und Tages-Make-up."
      },
      {
        name: "Anti-Stress f\u00fcr den Mann",
        price: "68,- EUR",
        description:
          "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Gesichtsmassage, Wirkstoffmaske und Abschlusspflege."
      }
    ]
  },
  {
    title: "Cosmeceutical-Behandlungen",
    items: [
      {
        name: "Professional Oxygen Peel",
        price: "ab 95,- EUR",
        description:
          "Reinigende 3-Phasen Oxygen Care Peel inklusive Massage, Ausreinigung, Maske, Ampulle und Abschlusspflege."
      },
      {
        name: "Pumpkin Enzyme Peel",
        price: "ab 95,- EUR",
        description:
          "Reinigung, Pumpkin Enzym Peeling, Tiefenreinigung, typgerechte Maske, Massage, Ampulle und Abschlusspflege."
      }
    ]
  },
  {
    title: "Kur-Behandlungen",
    items: [
      {
        name: "Fruchts\u00e4ure Peel",
        price: "79,- EUR",
        description:
          "Reinigung, Peeling-Maske unter Dampf, Glycolic Polymer Solution, Tiefenreinigung, typgerechte Maske und Abschlusspflege."
      },
      {
        name: "5-er Kur Fruchts\u00e4ure Peel",
        price: "355,- EUR",
        description: "Kurangebot auf Basis der Fruchts\u00e4ure Peel Behandlung."
      },
      {
        name: "Fruchts\u00e4ure Peel Special",
        price: "86,- EUR",
        description: "Fruchts\u00e4ure Peel + Enzyme Peel Mask."
      },
      {
        name: "5-er Kur Fruchts\u00e4ure Peel Special",
        price: "385,- EUR",
        description: "Kurangebot auf Basis der Fruchts\u00e4ure Peel Special Behandlung."
      }
    ]
  },
  {
    title: "Zusatz- und Einzelbehandlungen",
    items: [
      {
        name: "Hals- und Dekollet\u00e9 Behandlung",
        price: "28,- EUR",
        description: "Peeling, Wirkstoffampulle und -maske, Abschlusspflege.",
        note: "Nur in Verbindung mit einer Gesichtsbehandlung."
      },
      {
        name: "R\u00fcckenbehandlung",
        price: "55,- EUR",
        description:
          "Hautdiagnose, Peeling, Ausreinigung, Kurzmassage oder Wirkstoffpackung, K\u00f6rperpflege."
      },
      {
        name: "Manik\u00fcre",
        price: "35,- EUR",
        description: "Klassische Manik\u00fcre f\u00fcr gepflegte H\u00e4nde.",
        note: "Inklusive Nagellack 42,- EUR."
      }
    ]
  },
  {
    title: "Depilation",
    items: [
      {
        name: "K\u00f6rper",
        price: "ab 28,- EUR",
        description: "Haarentfernung mit Warmwachs."
      },
      {
        name: "Oberlippe",
        price: "10,- EUR",
        description: "Sanfte Haarentfernung im Gesicht."
      }
    ]
  },
  {
    title: "F\u00e4rben",
    items: [
      {
        name: "Wimpern & Augenbrauen f\u00e4rben",
        price: "22,- EUR / 30,- EUR",
        description: "22,- EUR im Rahmen einer Behandlung, 30,- EUR ohne Behandlung."
      },
      {
        name: "Wimpern f\u00e4rben",
        price: "15,- EUR / 20,- EUR",
        description: "15,- EUR im Rahmen einer Behandlung, 20,- EUR ohne Behandlung."
      },
      {
        name: "Augenbrauen zupfen und f\u00e4rben",
        price: "10,- EUR / 15,- EUR",
        description: "10,- EUR im Rahmen einer Behandlung, 15,- EUR ohne Behandlung."
      }
    ]
  }
];

const PAGE = { width: 595.28, height: 841.89, margin: 48 };
const COLORS = {
  ink: rgb(0.18, 0.12, 0.12),
  muted: rgb(0.38, 0.34, 0.34),
  accent: rgb(0.74, 0.22, 0.24),
  line: rgb(0.9, 0.85, 0.82)
};

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

async function generate() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.margin;

  const addPage = () => {
    page = pdf.addPage([PAGE.width, PAGE.height]);
    y = PAGE.height - PAGE.margin;
  };

  const ensureSpace = (needed) => {
    if (y - needed < PAGE.margin) addPage();
  };

  const drawLine = () => {
    page.drawLine({
      start: { x: PAGE.margin, y },
      end: { x: PAGE.width - PAGE.margin, y },
      thickness: 1,
      color: COLORS.line
    });
    y -= 14;
  };

  page.drawText("Sch\u00f6n in K\u00f6ln", {
    x: PAGE.margin,
    y,
    size: 24,
    font: bold,
    color: COLORS.ink
  });
  y -= 26;

  page.drawText("Kosmetik Silke Wiertz", {
    x: PAGE.margin,
    y,
    size: 11,
    font: regular,
    color: COLORS.accent
  });
  y -= 26;

  page.drawText("Preis\u00fcbersicht", {
    x: PAGE.margin,
    y,
    size: 20,
    font: bold,
    color: COLORS.ink
  });
  y -= 22;

  page.drawText("Stand: 01.05.2026", {
    x: PAGE.margin,
    y,
    size: 10,
    font: regular,
    color: COLORS.muted
  });
  y -= 18;

  const intro =
    "Aktuelle Behandlungen und Preise von Sch\u00f6n in K\u00f6ln. Bei R\u00fcckfragen zu einer Behandlung oder zur passenden Pflege berate ich Sie gerne pers\u00f6nlich.";
  for (const line of wrapText(intro, regular, 10.5, PAGE.width - PAGE.margin * 2)) {
    page.drawText(line, {
      x: PAGE.margin,
      y,
      size: 10.5,
      font: regular,
      color: COLORS.muted
    });
    y -= 14;
  }

  y -= 8;
  drawLine();

  for (const group of priceGroups) {
    ensureSpace(44);

    if (group.title) {
      page.drawText(group.title, {
        x: PAGE.margin,
        y,
        size: 13,
        font: bold,
        color: COLORS.accent
      });
      y -= 18;
    }

    for (const item of group.items) {
      const descLines = wrapText(item.description, regular, 9.5, 330);
      const noteLines = item.note ? wrapText(item.note, regular, 9.5, 330) : [];
      const blockHeight = 18 + descLines.length * 12 + noteLines.length * 12 + 10;
      ensureSpace(blockHeight);

      if (item.name === "Neukundenbehandlung") {
        page.drawText(item.name, {
          x: PAGE.margin,
          y,
          size: 10.5,
          font: bold,
          color: COLORS.accent
        });
      } else if (item.name === "Pflegeberatung VON LUPIN") {
        const firstPart = "Pflegeberatung";
        const secondPart = " VON LUPIN";
        page.drawText(firstPart, {
          x: PAGE.margin,
          y,
          size: 10.5,
          font: bold,
          color: COLORS.accent
        });
        page.drawText(secondPart, {
          x: PAGE.margin + bold.widthOfTextAtSize(firstPart, 10.5),
          y,
          size: 10.5,
          font: bold,
          color: COLORS.ink
        });
      } else {
        page.drawText(item.name, {
          x: PAGE.margin,
          y,
          size: 10.5,
          font: bold,
          color: COLORS.ink
        });
      }

      page.drawText(item.price, {
        x: PAGE.width - PAGE.margin - bold.widthOfTextAtSize(item.price, 10.5),
        y,
        size: 10.5,
        font: bold,
        color: COLORS.ink
      });
      y -= 14;

      for (const line of descLines) {
        page.drawText(line, {
          x: PAGE.margin,
          y,
          size: 9.5,
          font: regular,
          color: COLORS.muted
        });
        y -= 12;
      }

      for (const line of noteLines) {
        page.drawText(line, {
          x: PAGE.margin,
          y,
          size: 9.5,
          font: regular,
          color: COLORS.muted
        });
        y -= 12;
      }

      y -= 8;
    }

    y -= 2;
  }

  ensureSpace(56);
  drawLine();

  const footerLines = [
    "Zahlung per Paypal, \u00dcberweisung oder Bar.",
    "Terminvereinbarung und R\u00fcckfragen: info@schoeninkoeln.de | 0172 / 8903667"
  ];

  for (const line of footerLines) {
    page.drawText(line, {
      x: PAGE.margin,
      y,
      size: 9.5,
      font: regular,
      color: COLORS.muted
    });
    y -= 12;
  }

  const outputDir = path.join(__dirname, "..", "exports");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "schoeninkoeln-preisuebersicht.pdf");
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  console.log(outputPath);
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});

export type Service = {
  slug: string;
  name: string;
  dauerMinuten: number;
  preisEuro: number;
  beschreibung: string;
};

export type Slot = {
  id: string;
  datumLabel: string;
  startZeit: string;
  endZeit: string;
  status: "frei" | "reserviert";
};

export type Booking = {
  id: string;
  kundin: string;
  leistung: string;
  zeit: string;
  status: "Neu" | "Bestätigt" | "Storniert";
};

export const services: Service[] = [
  {
    slug: "neukundenbehandlung",
    name: "Neukundenbehandlung",
    dauerMinuten: 55,
    preisEuro: 69,
    beschreibung: "Anamnese, Reinigung, Peeling, Ausreinigung, Maske und Kurzmassage."
  },
  {
    slug: "pflegeberatung-von-lupin",
    name: "Pflegeberatung von Lupin",
    dauerMinuten: 55,
    preisEuro: 69,
    beschreibung:
      "Anamnese und Hautanalyse, Hautreinigung mit Cleanser und biologisches Peeling, Tiefenpflege, Maske-Intensivpflege und Abschlusspflege mit persönlicher Pflegeberatung."
  },
  {
    slug: "pur",
    name: "Pur",
    dauerMinuten: 55,
    preisEuro: 59,
    beschreibung:
      "Reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Wirkstoffmaske und Abschlusspflege."
  },
  {
    slug: "pur-clean",
    name: "Pur Clean",
    dauerMinuten: 60,
    preisEuro: 68,
    beschreibung:
      "Intensive reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Tiefenreinigung, Wirkstoffmaske und Abschlusspflege."
  },
  {
    slug: "entspannung",
    name: "Entspannung",
    dauerMinuten: 75,
    preisEuro: 79,
    beschreibung:
      "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske und Tages-Make-up."
  },
  {
    slug: "anti-stress-fuer-den-mann",
    name: "Anti-Stress für den Mann",
    dauerMinuten: 60,
    preisEuro: 68,
    beschreibung:
      "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Gesichtsmassage, Wirkstoffmaske und Abschlusspflege."
  },
  {
    slug: "rueckenbehandlung",
    name: "Rückenbehandlung",
    dauerMinuten: 45,
    preisEuro: 55,
    beschreibung:
      "Rückenbehandlung mit Hautdiagnose, Peeling, Ausreinigung, Kurzmassage oder Wirkstoffpackung und anschließender Körperpflege."
  },
  {
    slug: "manikuere",
    name: "Maniküre",
    dauerMinuten: 35,
    preisEuro: 35,
    beschreibung:
      "Klassische Maniküre für gepflegte Hände. Inklusive Nagellack beträgt der Preis 42 Euro."
  },
  {
    slug: "professional-oxygen-peel",
    name: "Professional Oxygen Peel",
    dauerMinuten: 85,
    preisEuro: 95,
    beschreibung:
      "Reinigende 3-Phasen Oxygen Care Peel inklusive Massage, Ausreinigung, Maske, Ampulle und Abschlusspflege."
  },
  {
    slug: "pumpkin-enzyme-peel",
    name: "Pumpkin Enzyme Peel",
    dauerMinuten: 85,
    preisEuro: 95,
    beschreibung:
      "Reinigung, Pumpkin Enzym Peeling, Tiefenreinigung, typgerechte Maske, Massage, Ampulle und Abschlusspflege."
  },
  {
    slug: "fruchtsaeure-peel",
    name: "Fruchtsäure Peel",
    dauerMinuten: 85,
    preisEuro: 79,
    beschreibung:
      "Reinigung, Peeling-Maske unter Dampf, Glycolic Polymer Solution, Tiefenreinigung, typgerechte Maske und Abschlusspflege."
  },
  {
    slug: "fruchtsaeure-peel-special",
    name: "Fruchtsäure Peel Special",
    dauerMinuten: 85,
    preisEuro: 86,
    beschreibung: "Fruchtsäure Peel + Enzyme Peel Mask."
  }
];

export const demoSlotsByService: Record<string, Slot[]> = {
  pur: [
    {
      id: "pur-2026-03-25-0930",
      datumLabel: "Mittwoch, 25. März 2026",
      startZeit: "09:30",
      endZeit: "10:25",
      status: "frei"
    },
    {
      id: "pur-2026-03-25-1400",
      datumLabel: "Mittwoch, 25. März 2026",
      startZeit: "14:00",
      endZeit: "14:55",
      status: "frei"
    }
  ],
  "pur-clean": [
    {
      id: "pur-clean-2026-03-26-1000",
      datumLabel: "Donnerstag, 26. März 2026",
      startZeit: "10:00",
      endZeit: "11:00",
      status: "frei"
    },
    {
      id: "pur-clean-2026-03-27-1330",
      datumLabel: "Freitag, 27. März 2026",
      startZeit: "13:30",
      endZeit: "14:30",
      status: "frei"
    }
  ],
  entspannung: [
    {
      id: "entspannung-2026-03-26-1100",
      datumLabel: "Donnerstag, 26. März 2026",
      startZeit: "11:00",
      endZeit: "12:15",
      status: "frei"
    },
    {
      id: "entspannung-2026-03-27-1530",
      datumLabel: "Freitag, 27. März 2026",
      startZeit: "15:30",
      endZeit: "16:45",
      status: "frei"
    }
  ],
  "anti-stress-fuer-den-mann": [
    {
      id: "anti-stress-2026-03-24-1700",
      datumLabel: "Dienstag, 24. März 2026",
      startZeit: "17:00",
      endZeit: "18:00",
      status: "frei"
    },
    {
      id: "anti-stress-2026-03-28-1030",
      datumLabel: "Samstag, 28. März 2026",
      startZeit: "10:30",
      endZeit: "11:30",
      status: "frei"
    }
  ],
  rueckenbehandlung: [
    {
      id: "ruecken-2026-03-24-1500",
      datumLabel: "Dienstag, 24. März 2026",
      startZeit: "15:00",
      endZeit: "15:45",
      status: "frei"
    },
    {
      id: "ruecken-2026-03-29-1200",
      datumLabel: "Sonntag, 29. März 2026",
      startZeit: "12:00",
      endZeit: "12:45",
      status: "frei"
    }
  ],
  manikuere: [
    {
      id: "manikuere-2026-03-24-1030",
      datumLabel: "Dienstag, 24. März 2026",
      startZeit: "10:30",
      endZeit: "11:05",
      status: "frei"
    },
    {
      id: "manikuere-2026-03-28-1230",
      datumLabel: "Samstag, 28. März 2026",
      startZeit: "12:30",
      endZeit: "13:05",
      status: "frei"
    }
  ]
};

export const demoBookings: Booking[] = [
  {
    id: "b-101",
    kundin: "Sabine Krüger",
    leistung: "Pur",
    zeit: "25.03.2026, 09:30 Uhr",
    status: "Bestätigt"
  },
  {
    id: "b-102",
    kundin: "Miriam Neumann",
    leistung: "Entspannung",
    zeit: "27.03.2026, 15:30 Uhr",
    status: "Neu"
  }
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

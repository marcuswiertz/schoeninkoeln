import Link from "next/link";

type PriceItem = {
  name: string;
  price: string;
  description: string;
  note?: string;
  slug?: string;
};

const priceGroups: { title: string; items: PriceItem[] }[] = [
  {
    title: "",
    items: [
      {
        slug: "neukundenbehandlung",
        name: "Neukundenbehandlung",
        price: "69,- EUR",
        description: "Anamnese, Reinigung, Peeling, Ausreinigung, Maske, Kurzmassage."
      },
      {
        slug: "pflegeberatung-von-lupin",
        name: "Pflegeberatung VON LUPIN",
        price: "69,- EUR",
        description:
          "Anamnese und Hautanalyse, Hautreinigung mit Cleanser und biologisches Peeling, Tiefenpflege, Maske-Intensivpflege und Abschlusspflege mit persönlicher Pflegeberatung.",
        note: "Ohne Ausreinigung, ohne Massage."
      }
    ]
  },
  {
    title: "Basis-Behandlungen",
    items: [
      {
        slug: "pur",
        name: "Pur",
        price: "59,- EUR",
        description:
          "Reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        slug: "pur-clean",
        name: "Pur Clean",
        price: "68,- EUR",
        description:
          "Intensive reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Tiefenreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        slug: "entspannung",
        name: "Entspannung",
        price: "79,- EUR",
        description:
          "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske, Abschlusspflege und Tages-Make-up."
      },
      {
        slug: "anti-stress-fuer-den-mann",
        name: "Anti-Stress für den Mann",
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
        slug: "professional-oxygen-peel",
        name: "Professional Oxygen Peel",
        price: "ab 95,- EUR",
        description:
          "Reinigende 3-Phasen Oxygen Care Peel inklusive Massage, Ausreinigung, Maske, Ampulle und Abschlusspflege."
      },
      {
        slug: "pumpkin-enzyme-peel",
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
        slug: "fruchtsaeure-peel",
        name: "Fruchtsäure Peel",
        price: "79,- EUR",
        description:
          "Reinigung, Peeling-Maske unter Dampf, Glycolic Polymer Solution, Tiefenreinigung, typgerechte Maske und Abschlusspflege."
      },
      {
        name: "5-er Kur Fruchtsäure Peel",
        price: "355,- EUR",
        description: "Kurangebot auf Basis der Fruchtsäure Peel Behandlung."
      },
      {
        slug: "fruchtsaeure-peel-special",
        name: "Fruchtsäure Peel Special",
        price: "86,- EUR",
        description: "Fruchtsäure Peel + Enzyme Peel Mask."
      },
      {
        name: "5-er Kur Fruchtsäure Peel Special",
        price: "385,- EUR",
        description: "Kurangebot auf Basis der Fruchtsäure Peel Special Behandlung."
      }
    ]
  },
  {
    title: "Zusatz- und Einzelbehandlungen",
    items: [
      {
        name: "Hals- und Dekolleté Behandlung",
        price: "28,- EUR",
        description: "Peeling, Wirkstoffampulle und -maske, Abschlusspflege.",
        note: "Nur in Verbindung mit einer Gesichtsbehandlung."
      },
      {
        slug: "rueckenbehandlung",
        name: "Rückenbehandlung",
        price: "55,- EUR",
        description:
          "Hautdiagnose, Peeling, Ausreinigung, Kurzmassage oder Wirkstoffpackung, Körperpflege."
      },
      {
        name: "Maniküre",
        price: "35,- EUR",
        description: "Klassische Maniküre für gepflegte Hände.",
        note: "Inklusive Nagellack 42,- EUR."
      }
    ]
  },
  {
    title: "Depilation",
    items: [
      {
        name: "Körper",
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
    title: "Färben",
    items: [
      {
        name: "Wimpern & Augenbrauen färben",
        price: "22,- EUR / 30,- EUR",
        description: "22,- EUR im Rahmen einer Behandlung, 30,- EUR ohne Behandlung."
      },
      {
        name: "Wimpern färben",
        price: "15,- EUR / 20,- EUR",
        description: "15,- EUR im Rahmen einer Behandlung, 20,- EUR ohne Behandlung."
      },
      {
        name: "Augenbrauen zupfen und färben",
        price: "10,- EUR / 15,- EUR",
        description: "10,- EUR im Rahmen einer Behandlung, 15,- EUR ohne Behandlung."
      }
    ]
  }
];

export default function PreisePage() {
  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Preise</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Preisübersicht
        </h1>
        <p className="section-copy">
          Bei Rückfragen zu einer Behandlung oder zur passenden Pflege berate ich Sie gerne persönlich.
        </p>
      </section>

      {priceGroups.map((group) => (
        <section className="section-stack" key={`${group.title}-${group.items[0]?.name ?? "group"}`}>
          {group.title ? <h2 className="section-subtitle">{group.title}</h2> : null}
          <section className="price-list">
            {group.items.map((item) => (
              <article className="price-row" id={item.slug} key={`${group.title}-${item.name}`}>
                <div>
                  <h3>{item.name}</h3>
                  <p className="muted">{item.description}</p>
                  {item.note ? <p className="muted">{item.note}</p> : null}
                </div>
                <div className="price-value">{item.price}</div>
              </article>
            ))}
          </section>
        </section>
      ))}

      <p className="section-copy payment-note">Zahlung per Paypal, Überweisung oder Bar.</p>

      <Link className="floating-book-button" href="/buchen">
        Hier buchen
      </Link>
    </main>
  );
}

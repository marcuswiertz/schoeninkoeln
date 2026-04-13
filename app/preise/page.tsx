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
    title: "Von Lupin",
    items: [
      {
        slug: "pflegeberatung-von-lupin",
        name: "Pflegeberatung von Lupin",
        price: "69,- €",
        description:
          "Anamnese und Hautanalyse, Hautreinigung mit Cleanser und biologisches Peeling, Tiefenpflege, Maske-Intensivpflege und Abschlusspflege mit persönlicher Pflegeberatung.",
        note: "Ohne Ausreinigung, ohne Massage."
      },
      {
        slug: "neukundenbehandlung",
        name: "Neukundenbehandlung",
        price: "69,- €",
        description: "Anamnese, Reinigung, Peeling, Ausreinigung, Maske, Kurzmassage."
      }
    ]
  },
  {
    title: "Basis-Behandlungen",
    items: [
      {
        slug: "pur",
        name: "Pur",
        price: "59,- €",
        description:
          "Reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        slug: "pur-clean",
        name: "Pur Clean",
        price: "68,- €",
        description:
          "Intensive reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Tiefenreinigung, Wirkstoffmaske und Abschlusspflege."
      },
      {
        slug: "entspannung",
        name: "Entspannung",
        price: "79,- €",
        description:
          "Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske, Abschlusspflege und Tages-Make-up."
      },
      {
        slug: "anti-stress-fuer-den-mann",
        name: "Anti-Stress für den Mann",
        price: "68,- €",
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
        price: "ab 95,- €",
        description:
          "Reinigende 3-Phasen Oxygen Care Peel inklusive Massage, Ausreinigung, Maske, Ampulle und Abschlusspflege."
      },
      {
        slug: "pumpkin-enzyme-peel",
        name: "Pumpkin Enzyme Peel",
        price: "ab 95,- €",
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
        price: "79,- €",
        description:
          "Reinigung, Peeling-Maske unter Dampf, Glycolic Polymer Solution, Tiefenreinigung, typgerechte Maske und Abschlusspflege."
      },
      {
        slug: "fruchtsaeure-peel-special",
        name: "Fruchtsäure Peel Special",
        price: "86,- €",
        description: "Fruchtsäure Peel + Enzyme Peel Mask."
      },
      {
        name: "5-er Kur Fruchtsäure Peel Special",
        price: "379,- €",
        description: "Kurangebot auf Basis der Fruchtsäure Peel Special Behandlung."
      }
    ]
  },
  {
    title: "Zusatz- und Einzelbehandlungen",
    items: [
      {
        name: "Hals- und Dekolleté Behandlung",
        price: "28,- bis 30,- €",
        description: "Peeling, Wirkstoffampulle und -maske, Abschlusspflege.",
        note: "Nur in Verbindung mit einer Gesichtsbehandlung."
      },
      {
        slug: "rueckenbehandlung",
        name: "Rückenbehandlung",
        price: "55,- €",
        description:
          "Hautdiagnose, Peeling, Ausreinigung, Kurzmassage oder Wirkstoffpackung, Körperpflege."
      },
      {
        name: "Maniküre",
        price: "35,- €",
        description: "Klassische Maniküre für gepflegte Hände.",
        note: "Inklusive Nagellack 42,- €."
      }
    ]
  },
  {
    title: "Depilation",
    items: [
      {
        name: "Körper",
        price: "ab 28,- €",
        description: "Haarentfernung mit Warmwachs."
      },
      {
        name: "Oberlippe",
        price: "10,- €",
        description: "Sanfte Haarentfernung im Gesicht."
      }
    ]
  },
  {
    title: "Färben",
    items: [
      {
        name: "Wimpern & Augenbrauen färben",
        price: "22,- € / 30,- €",
        description: "22,- € im Rahmen einer Basis- oder Cosmeceutical-Behandlung, 30,- € ohne Behandlung."
      },
      {
        name: "Wimpern färben",
        price: "14,- € / 18,- €",
        description: "14,- € im Rahmen einer Basis- oder Cosmeceutical-Behandlung, 18,- € ohne Behandlung."
      },
      {
        name: "Augenbrauen färben",
        price: "10,- € / 14,- €",
        description: "10,- € im Rahmen einer Basis- oder Cosmeceutical-Behandlung, 14,- € ohne Behandlung."
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
        <section className="section-stack" key={group.title}>
          <h2 className="section-subtitle">{group.title}</h2>
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

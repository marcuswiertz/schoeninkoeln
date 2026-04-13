import Link from "next/link";

const featuredTreatments = [
  {
    title: "Neukundenbehandlung",
    text: [
      "Die Neukundenbehandlung ist der ideale Einstieg, um Ihre Haut und ihre aktuellen Bedürfnisse in Ruhe kennenzulernen. Im Mittelpunkt stehen eine sorgfältige Anamnese, eine fundierte Hautbeobachtung und eine erste intensive Pflege.",
      "Die Behandlung umfasst Anamnese, Reinigung, Peeling, Ausreinigung, Maske und eine entspannende Kurzmassage. So entsteht eine gute Grundlage, um die passende Behandlung und Heimpflege individuell auf Sie abzustimmen."
    ]
  },
  {
    title: "Entspannungsbehandlung",
    text: [
      "Wenn Sie sich eine umfassende Gesichtspflege mit wohltuender Ruhe gönnen möchten, ist die Entspannungsbehandlung eine besonders schöne Wahl. Sie verbindet gründliche kosmetische Pflege mit Momenten zum Durchatmen.",
      "Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske, Abschlusspflege und Tages-Make-up greifen harmonisch ineinander und schenken Ihrer Haut neue Frische und Ausstrahlung."
    ]
  },
  {
    title: "Kur-Behandlungen",
    text: [
      "Für Hautbilder, die eine intensivere und regelmäßigere Begleitung benötigen, biete ich gezielte Kur-Behandlungen an. Dazu gehören das Fruchtsäure Peel und das Fruchtsäure Peel Special.",
      "Diese Behandlungen unterstützen die Hauterneuerung, verfeinern das Hautbild und können je nach Bedarf als einzelne Behandlung oder als aufeinander abgestimmte Kur eingesetzt werden."
    ]
  }
];

export default function BehandlungenPage() {
  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Behandlungen</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Kosmetikbehandlungen in Köln-Ehrenfeld
        </h1>
        <p className="section-copy">
          Jede Behandlung wird individuell auf Ihre Haut und Ihre aktuellen Bedürfnisse abgestimmt.
        </p>
      </section>

      <section className="services-grid featured-treatments-grid">
        {featuredTreatments.map((treatment) => (
          <article className="service-card" key={treatment.title}>
            <span className="pill">Ausgewählt</span>
            <h2>{treatment.title}</h2>
            {treatment.text.map((paragraph) => (
              <p className="section-copy" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </section>

      <div className="inline-actions">
        <Link className="button" href="/preise">
          Alle Behandlungen & Preise
        </Link>
        <Link className="button-secondary" href="/preise">
          Zur Preisübersicht
        </Link>
      </div>

      <p className="section-copy" style={{ marginTop: "10px" }}>
        Alle weiteren Behandlungen finden Sie auf der Preiseseite.
      </p>

      <div className="inline-actions">
        <Link className="button-secondary" href="/buchen">
          Hier buchen
        </Link>
      </div>
    </main>
  );
}

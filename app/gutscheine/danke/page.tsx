import Link from "next/link";

type Props = {
  searchParams?: Promise<{
    mail?: string;
  }>;
};

export default async function GutscheinDankePage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const mailFehler = params.mail === "fehler";

  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Vielen Dank</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Ihre Gutscheinbestellung wurde gespeichert.
        </h1>
        <p className={`status-hinweis${mailFehler ? " status-hinweis-warnung" : ""}`}>
          {mailFehler
            ? "Die Bestellung wurde gespeichert, aber der Gutschein konnte nicht per E-Mail versendet werden."
            : "Der Gutschein wurde per E-Mail verschickt und ist nach Zahlungseingang gültig."}
        </p>
        <div className="inline-actions">
          <Link className="button" href="/">
            Zur Startseite
          </Link>
          <Link className="button-secondary" href="/gutscheine">
            Weiteren Gutschein bestellen
          </Link>
        </div>
      </section>
    </main>
  );
}

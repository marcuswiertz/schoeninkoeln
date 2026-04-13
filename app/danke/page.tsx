import Link from "next/link";

type Props = {
  searchParams?: Promise<{
    mail?: string;
  }>;
};

export default async function DankePage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const mailFehler = params.mail === "fehler";

  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Vielen Dank</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Ihre Terminanfrage wurde gespeichert.
        </h1>
        {mailFehler ? (
          <p className="status-hinweis status-hinweis-warnung">
            Die Buchung wurde gespeichert, aber die E-Mail-Benachrichtigung konnte nicht versendet werden.
          </p>
        ) : (
          <p className="status-hinweis">
            Eine Bestätigung wurde an die angegebene E-Mail-Adresse versendet.
          </p>
        )}
        <div className="inline-actions">
          <Link className="button" href="/">
            Zur Startseite
          </Link>
          <Link className="button-secondary" href="/buchen">
            Weitere Behandlung wählen
          </Link>
        </div>
      </section>
    </main>
  );
}

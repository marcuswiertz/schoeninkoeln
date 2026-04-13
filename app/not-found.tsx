import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <div className="eyebrow">Nicht gefunden</div>
      <h1 className="section-title" style={{ fontSize: "2.4rem" }}>
        Diese Seite gibt es noch nicht.
      </h1>
      <p className="section-copy">
        Bitte gehe zurück zur Buchungsübersicht oder starte wieder auf der Hauptseite.
      </p>
      <div className="inline-actions">
        <Link className="button" href="/buchen">
          Zur Buchung
        </Link>
        <Link className="button-secondary" href="/">
          Startseite
        </Link>
      </div>
    </main>
  );
}

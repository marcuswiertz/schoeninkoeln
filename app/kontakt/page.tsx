import Link from "next/link";

export default function KontaktPage() {
  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Kontakt</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Öffnungszeiten / Kontakt
        </h1>
        <p className="section-copy">
          Ich öffne mein Kosmetikstudio von Montag bis Freitag zu flexiblen Zeiten nach vorheriger Absprache.
          <br />
          Sie erreichen mich telefonisch, per E-Mail oder über die integrierte Terminbuchung.
        </p>
      </section>

      <section className="contact-grid">
        <article className="admin-card">
          <h2>Anschrift</h2>
          <p className="section-copy">
            Schön in Köln
            <br />
            Steinkrügerstraße 9
            <br />
            50825 Köln
          </p>
        </article>
        <article className="admin-card">
          <h2>Kontakt</h2>
          <p className="section-copy">
            Telefon: <a href="tel:01728903667">0172/8903667</a>
            <br />
            E-Mail: <a href="mailto:info@schoeninkoeln.de">info@schoeninkoeln.de</a>
          </p>
          <div className="inline-actions">
            <Link className="button" href="/buchen">
              Termin buchen
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

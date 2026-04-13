import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="card hero-copy">
          <div className="hero-media">
            <div className="portrait-frame">
              <img src="/silke-portrait.jpg" alt="Silke Wiertz" />
            </div>
            <div>
              <p className="lead-copy">
                Ich öffne mein Kosmetikstudio von Montag bis Freitag zu flexiblen Zeiten nach vorheriger
                Absprache.
              </p>
              <p className="lead-copy">
                Für Fragen zu Pflege, Hautbild und den passenden Anwendungen nehme ich mir gerne Zeit.
                Produkte und kosmetische Anwendungen werden passend zu Hautbild und Bedürfnis ausgewählt.
              </p>
              <div className="hero-actions">
                <Link className="button" href="/buchen">
                  Termin buchen
                </Link>
                <Link className="button-secondary" href="/kontakt">
                  Kontakt aufnehmen
                </Link>
              </div>
            </div>
            <div className="address-card">
              <p>Termine nach Vereinbarung</p>
              <p>Zahlung per Paypal, Überweisung oder Bar</p>
            </div>
            <div className="affiliate-card">
              <img className="affiliate-card-logo" src="/api/product-logos/von-lupin?v=1" alt="VON LUPIN Logo" />
              <p>
                VON LUPIN steht für einen verantwortungsvollen Umgang mit Mensch und Umwelt, ist
                PETA-zertifiziert und garantiert sichtbare Pflegeergebnisse.
              </p>
              <p>
                <a href="https://von-lupin.com/?affiliateparlorlink=9aada4e3202a04e3f6cdf3b05a755e2e" target="_blank" rel="noreferrer">
                  Hier geht es direkt zum VON LUPIN Shop
                </a>
              </p>
            </div>
          </div>
        </div>
        <aside className="card hero-panel">
          <div className="panel-list">
            <div className="panel-item">
              <div className="home-brand-list">
                <div className="home-brand-item">
                  <Link className="home-brand-logo-link" href="/produkte">
                    <img src="/api/product-logos/a-natural-difference?v=2" alt="A Natural Difference Logo" />
                  </Link>
                  <div className="home-brand-copy">
                    <span>A Natural Difference</span>
                    <p>
                      Pflege mit Phyto-Wirkstoffen für individuelle Hautbedürfnisse und gezielte Konzepte.
                      Gerade bei anspruchsvoller Haut schätze ich die ausgewogenen Formulierungen und den
                      professionellen Pflegeansatz dieser Linie.
                    </p>
                  </div>
                </div>
                <div className="home-brand-item">
                  <Link className="home-brand-logo-link" href="/produkte">
                    <img src="/api/product-logos/von-lupin?v=1" alt="VON LUPIN Logo" />
                  </Link>
                  <div className="home-brand-copy">
                    <span>VON LUPIN</span>
                    <p>
                      Vegane Produkte mit Haltung zu Nachhaltigkeit und moderner Hautpflege.
                      Sie verbindet sichtbare Ergebnisse mit einem verantwortungsvollen Blick auf Mensch und Umwelt.
                      Erhältlich auch im{" "}
                      <a
                        href="https://von-lupin.com/?affiliateparlorlink=9aada4e3202a04e3f6cdf3b05a755e2e"
                        target="_blank"
                        rel="noreferrer"
                      >
                        VON LUPIN Shop
                      </a>
                      .
                    </p>
                  </div>
                </div>
                <div className="home-brand-item">
                  <Link className="home-brand-logo-link" href="/produkte">
                    <img src="/api/product-logos/i-m-naturkosmetik?v=1" alt="i+m Naturkosmetik Logo" />
                  </Link>
                  <div className="home-brand-copy">
                    <span>i+m Naturkosmetik</span>
                    <p>
                      Faire und ökologische Pflegeprodukte mit langjähriger Erfahrung und natürlichen Rezepturen.
                      i+m steht für eine konsequent nachhaltige Haltung und eine alltagstaugliche, hautfreundliche
                      Pflege.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

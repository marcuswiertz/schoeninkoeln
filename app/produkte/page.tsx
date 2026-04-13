const products = [
  {
    name: "VON LUPIN",
    slug: "von-lupin",
    logoVersion: "1",
    text: [
      "VON LUPIN versteht Hautpflege als individuelle Wirkstoffkosmetik statt als starre Standardroutine. Die Marke arbeitet mit maßgeschneiderten Pflegekombinationen und setzt auf Formulierungen, die Hautzustand, Verträglichkeit und sichtbare Ergebnisse zusammen denken.",
      "Die Produkte sind vegan, allergenfrei und frei von Silikonen, Erdölen, Parabenen und PEG. Entwickelt wird die Linie in Deutschland, produziert wird mit einem klaren Anspruch an moderne Pflege, gute Verträglichkeit und verantwortungsvollen Umgang mit Mensch und Umwelt.",
      "VON LUPIN richtet sich nicht einfach nach Hauttypen auf dem Papier, sondern nach dem tatsächlichen Hautbild und den aktuellen Bedürfnissen. So entsteht eine Pflegeroutine, die individueller und zielgerichteter aufgebaut werden kann als viele klassische Standardsysteme."
    ]
  },
  {
    name: "A Natural Difference",
    slug: "a-natural-difference",
    logoVersion: "2",
    text: [
      "A Natural Difference verbindet natürliche Essenzen und Pflanzenextrakte mit moderner professioneller Hautpflege. Die Linie arbeitet unter anderem mit Phyto-Wirkstoffen, Vitaminen, Peptiden, Enzymen und weiteren Aktivstoffen, die gezielt auf unterschiedliche Hautbilder abgestimmt werden können.",
      "Viele Produkte sind darauf ausgelegt, im Zusammenspiel zu arbeiten und die Haut wieder in ein stabileres Gleichgewicht zu bringen, statt nur kurzfristig einzelne Erscheinungen zu überdecken.",
      "Gerade deshalb eignet sich A Natural Difference für mich besonders bei anspruchsvolleren Pflegekonzepten: wenn die Haut intensive Unterstützung braucht, wenn klassische Pflege an ihre Grenzen stößt oder wenn Aktivpflege gezielt, aber dennoch gut abgestimmt eingesetzt werden soll."
    ]
  },
  {
    name: "i+m Naturkosmetik",
    slug: "i-m-naturkosmetik",
    logoVersion: "1",
    text: [
      "i+m Naturkosmetik Berlin gehört seit 1978 zu den Pionieren der Naturkosmetik und steht für FAIR, ORGANIC und VEGAN. Die Marke verbindet pflanzliche Rohstoffe, moderne Naturkosmetik und eine konsequent nachhaltige Haltung in Entwicklung, Herstellung und Verpackung.",
      "Die Produkte sind COSMOS-zertifiziert, vegan, tierversuchsfrei und frei von Parabenen, Silikonen, Paraffinen, Phthalaten und Mikroplastik. Viele Formulierungen arbeiten mit hochwertigen Bio-Ölen und Pflanzenextrakten, die auf eine sanfte, alltagstaugliche Pflege ausgerichtet sind.",
      "Für mich ist i+m besonders überzeugend, weil hier gute Hautpflege mit sozialer und ökologischer Verantwortung zusammenkommt. Die Entwicklung und Herstellung in Deutschland, der faire Ansatz und die klar verständliche Produktphilosophie machen die Marke zu einer sehr stimmigen Begleitung für die tägliche Pflege zuhause."
    ]
  }
];

export default function ProduktePage() {
  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Produkte</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Die Produkte meines Vertrauens
        </h1>
        <p className="section-copy">
          Ich setze auf sorgfältig ausgewählte Produktlinien, die sowohl in meinen Behandlungen als auch in
          der täglichen Pflege zuhause überzeugen.
        </p>
      </section>

      <section className="services-grid featured-treatments-grid">
        {products.map((product) => (
          <article className="service-card product-card" key={product.name}>
            <div className="product-logo-frame">
              <img
                className="product-logo-image"
                src={`/api/product-logos/${product.slug}?v=${product.logoVersion}`}
                alt={`${product.name} Logo`}
              />
            </div>
            <span className="pill">Produktlinie</span>
            <h2>{product.name}</h2>
            {product.text.map((paragraph) => (
              <p className="section-copy" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}

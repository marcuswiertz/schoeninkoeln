import { VoucherOrderForm } from "@/components/voucher-order-form";

export default function GutscheinePage() {
  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Gutscheine</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Gutscheine für besondere Anlässe
        </h1>
        <p className="section-copy">Gutscheine sind für Behandlungen oder als Wertgutschein erhältlich.</p>
      </section>

      <section className="grid-2">
        <article className="admin-card">
          <h2>Als Geschenkidee</h2>
          <p className="section-copy">
            Ob Geburtstag, Muttertag, Weihnachten oder einfach als liebe Aufmerksamkeit zwischendurch: Ein
            Gutschein für Schön in Köln verbindet Pflege, Entspannung und Zeit für sich selbst.
          </p>
        </article>
        <article className="admin-card">
          <h2>So läuft die Bestellung</h2>
          <p className="section-copy">
            Nach Ihrer Bestellung erhalten Sie den Gutschein sofort als PDF per E-Mail. Der Gutschein ist nach
            Zahlungseingang gültig. Die Kontoverbindung steht in der Bestätigungsmail.
          </p>
        </article>
      </section>

      <section className="section">
        <VoucherOrderForm />
      </section>
    </main>
  );
}

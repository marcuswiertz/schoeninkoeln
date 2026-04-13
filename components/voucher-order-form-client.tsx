"use client";

import { useState } from "react";
import type { Service } from "@/lib/data";
import { createVoucherAction } from "@/app/gutscheine/actions";

type Props = {
  services: Service[];
};

export function VoucherOrderFormClient({ services }: Props) {
  const [typ, setTyp] = useState<"wert" | "behandlung">("wert");
  const [widmung, setWidmung] = useState("");

  return (
    <section className="card form-card">
      <div className="eyebrow">Gutschein bestellen</div>
      <h2 className="section-title" style={{ fontSize: "2rem" }}>
        Gutschein direkt anfordern
      </h2>
      <p className="section-copy">Wählen Sie bitte aus: Wertgutschein oder Behandlungsgutschein.</p>
      <form action={createVoucherAction} className="form-grid">
        <div className="field">
          <label htmlFor="typ">Art des Gutscheins</label>
          <select
            id="typ"
            name="typ"
            value={typ}
            onChange={(event) => setTyp(event.target.value as "wert" | "behandlung")}
          >
            <option value="wert">Wertgutschein</option>
            <option value="behandlung">Behandlungsgutschein</option>
          </select>
        </div>

        {typ === "wert" ? (
          <div className="field">
            <label htmlFor="wertEuro">Wert in Euro</label>
            <input id="wertEuro" name="wertEuro" type="number" min="1" step="1" placeholder="z. B. 50" required />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="leistungSlug">Behandlung</label>
            <select id="leistungSlug" name="leistungSlug" defaultValue="" required>
              <option value="">Bitte auswählen</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="beschenktePerson">Für wen ist der Gutschein?</label>
          <input id="beschenktePerson" name="beschenktePerson" placeholder="Vor- und Nachname" required />
        </div>
        <div className="field">
          <label htmlFor="bestellerName">Ihr Name</label>
          <input id="bestellerName" name="bestellerName" placeholder="Vor- und Nachname" required />
        </div>
        <div className="field">
          <label htmlFor="bestellerEmail">Ihre E-Mail-Adresse</label>
          <input id="bestellerEmail" name="bestellerEmail" type="email" placeholder="name@example.de" required />
        </div>
        <div className="field">
          <label htmlFor="widmung">Persönliche Widmung</label>
          <textarea
            id="widmung"
            name="widmung"
            maxLength={50}
            rows={1}
            value={widmung}
            onChange={(event) => setWidmung(event.target.value)}
            placeholder="Optional: z. B. Alles Liebe zum Geburtstag · Von Max"
          />
          <small className="field-hint">Falls gewünscht, bitte auch den Namen der schenkenden Person hier eintragen.</small>
          <small className="field-counter">{widmung.length}/50 Zeichen</small>
        </div>
        <p className="section-copy" style={{ margin: 0 }}>
          Der Gutschein wird sofort als PDF per E-Mail verschickt und ist nach Zahlungseingang gültig.
        </p>
        <div className="inline-actions">
          <button className="button" type="submit">
            Gutschein bestellen
          </button>
          <button className="button-secondary" type="reset">
            Zurücksetzen
          </button>
        </div>
      </form>
    </section>
  );
}

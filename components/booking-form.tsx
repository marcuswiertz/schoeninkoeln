import { createBookingAction } from "@/app/buchen/actions";
import type { StoredSlot } from "@/lib/store";

type Props = {
  serviceSlug: string;
  serviceName: string;
  servicePrice: number;
  slots: StoredSlot[];
  selectedSlotId?: string;
};

export function BookingForm({ serviceSlug, serviceName, servicePrice, slots, selectedSlotId }: Props) {
  const initialSlotId = slots.some((slot) => slot.id === selectedSlotId) ? selectedSlotId : slots[0]?.id;

  return (
    <section className="card form-card">
      <div className="eyebrow">Kontaktdaten</div>
      <h2 className="section-title" style={{ fontSize: "2rem" }}>
        Ihre Buchung
      </h2>
      <p className="section-copy">Bitte tragen Sie Ihre Daten vollständig ein.</p>
      <form action={createBookingAction} className="form-grid">
        <input type="hidden" name="serviceSlug" value={serviceSlug} />
        <div className="booking-selection-summary">
          <span>
            <strong>Gewählte Behandlung:</strong> {serviceName}
          </span>
          <span>
            <strong>Preis:</strong> {servicePrice} Euro
          </span>
        </div>
        <div className="field">
          <label htmlFor="slotId">Gewünschte Zeit</label>
          <select id="slotId" name="slotId" defaultValue={initialSlotId}>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.datumLabel} · {slot.startZeit} bis {slot.endZeit} Uhr
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="name">Vor- und Nachname</label>
          <input id="name" name="name" placeholder="z. B. Anna Mustermann" required />
        </div>
        <div className="field">
          <label htmlFor="email">E-Mail-Adresse</label>
          <input id="email" name="email" type="email" placeholder="kundin@example.de" required />
        </div>
        <div className="field">
          <label htmlFor="telefon">Telefonnummer</label>
          <input id="telefon" name="telefon" type="tel" placeholder="0176 12345678" />
        </div>
        <div className="field">
          <label htmlFor="notiz">Nachricht oder Hinweis</label>
          <textarea
            id="notiz"
            name="notiz"
            placeholder="Optional: z. B. empfindliche Haut oder eine Rückfrage zur Behandlung"
          />
        </div>
        <div className="inline-actions">
          <button className="button" type="submit">
            Buchung abschicken
          </button>
          <button className="button-secondary" type="reset">
            Zurücksetzen
          </button>
        </div>
      </form>
    </section>
  );
}

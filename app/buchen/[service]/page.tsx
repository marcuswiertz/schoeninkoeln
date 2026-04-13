import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { getServiceBySlugSafe } from "@/lib/service-repository";
import { getAvailableSlotsForService } from "@/lib/store";

type Props = {
  params: Promise<{
    service: string;
  }>;
};

export default async function ServiceBookingPage({ params }: Props) {
  const { service: slug } = await params;
  const service = await getServiceBySlugSafe(slug);

  if (!service) {
    notFound();
  }

  const slots = await getAvailableSlotsForService(slug);

  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Behandlung: {service.name}</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          {service.name}
        </h1>
        <p className="section-copy">
          Wählen Sie eine passende Zeit aus und tragen Sie darunter Ihre Kontaktdaten ein.
        </p>
      </section>

      <section className="slots-grid">
        {slots.length ? (
          slots.map((slot) => (
            <article className="slot-card" key={slot.id}>
              <span className="pill">Verfügbar</span>
              <h2>{slot.datumLabel}</h2>
              <p className="section-copy">
                {slot.startZeit} bis {slot.endZeit} Uhr
              </p>
              <div className="inline-actions">
                <Link className="button" href="#formular">
                  Diese Zeit wählen
                </Link>
              </div>
            </article>
          ))
        ) : (
          <article className="slot-card">
            <span className="pill">Momentan keine freien Zeiten</span>
            <h2>Zurzeit ist kein freier Slot hinterlegt</h2>
            <p className="section-copy">
              Bitte schauen Sie später noch einmal vorbei oder nehmen Sie direkt Kontakt zum Studio auf.
            </p>
          </article>
        )}
      </section>

      {slots.length ? (
        <div id="formular" style={{ paddingTop: 28 }}>
          <BookingForm serviceSlug={slug} serviceName={service.name} servicePrice={service.preisEuro} slots={slots} />
        </div>
      ) : null}
    </main>
  );
}

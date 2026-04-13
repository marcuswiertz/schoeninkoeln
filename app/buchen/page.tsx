import Link from "next/link";
import { getServicesSafe } from "@/lib/service-repository";

export default async function BuchenPage() {
  const services = await getServicesSafe();
  const bookableServices = services.filter((service) => !["rueckenbehandlung", "manikuere"].includes(service.slug));

  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Termin buchen</div>
        <p className="booking-intro-line">
          <strong>Bitte wählen Sie</strong> zuerst die gewünschte Behandlung. Nähere Informationen finden Sie im
          jeweiligen Buchungsfeld unter &quot;Infos&quot;. Über &quot;Termine&quot; sehen Sie die freien
          Buchungszeiten und können direkt Ihre Buchung vornehmen.
        </p>
      </section>

      <section className="services-grid">
        {bookableServices.map((service) => (
          <article className="service-card" key={service.slug}>
            <span className="pill">Behandlung</span>
            <h2>{service.name}</h2>
            <details className="booking-info-box">
              <summary>Infos</summary>
              <div className="booking-info-meta">
                <span>{service.dauerMinuten} Minuten</span>
                <span>{service.preisEuro} Euro</span>
              </div>
              <p className="section-copy">{service.beschreibung}</p>
            </details>
            <div className="inline-actions">
              <Link className="button" href={`/buchen/${service.slug}`}>
                Termine
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

import { requireAdmin } from "@/lib/auth";
import { getServicesSafe } from "@/lib/service-repository";
import { getWeekCalendar } from "@/lib/store";
import { AdminCalendar } from "@/components/admin-calendar";
import { AdminNav } from "@/components/admin-nav";
import { testEmailAction } from "@/app/admin/actions";

type Props = {
  searchParams?: Promise<{
    w?: string;
    mailtest?: string;
    mailmsg?: string;
  }>;
};

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const services = await getServicesSafe();

  const params = (await searchParams) || {};
  const calendar = await getWeekCalendar(params.w);
  const mailTestOk = params.mailtest === "ok";
  const mailTestFehler = params.mailtest === "fehler";
  const mailTestMessage = params.mailmsg ? decodeURIComponent(params.mailmsg) : "";

  return (
    <main className="section">
      <h1 className="admin-title">Buchungskalender</h1>
      <AdminNav current="kalender" />
      <section className="admin-mail-test">
        <div className="inline-actions" style={{ marginTop: 0 }}>
          <form action={testEmailAction} className="admin-mail-test-form">
            <button className="button-secondary" type="submit">
              Mailversand testen
            </button>
          </form>
        </div>
        {mailTestOk ? (
          <p className="status-hinweis">
            {mailTestMessage || "Die Anmeldung am Mailserver hat funktioniert."}
          </p>
        ) : null}
        {mailTestFehler ? (
          <p className="status-hinweis status-hinweis-warnung">
            Der Mailserver hat die Anmeldung abgelehnt: {mailTestMessage || "Bitte SMTP-Daten erneut prüfen."}
          </p>
        ) : null}
      </section>
      <AdminCalendar initialCalendar={calendar} services={services} />
    </main>
  );
}

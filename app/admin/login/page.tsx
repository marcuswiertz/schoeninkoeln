import { loginAction } from "@/app/admin/actions";
import { getAdminPassword } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const showError = params?.error === "1";
  const usesFallbackPassword = !process.env.ADMIN_PASSWORD;

  return (
    <main className="section">
      <section className="section-banner">
        <div className="eyebrow">Interner Bereich</div>
        <h1 className="section-title" style={{ fontSize: "2.8rem" }}>
          Anmeldung für die Terminverwaltung
        </h1>
        <p className="section-copy">
          Hier meldet sich nur das Studio an, um freie Zeiten einzutragen, zu sperren und eingehende Buchungen
          zu verwalten.
        </p>
      </section>

      <section className="card form-card" style={{ maxWidth: 640 }}>
        {showError ? (
          <p className="muted" style={{ color: "#960818", marginTop: 0 }}>
            Die Anmeldung war nicht erfolgreich. Bitte E-Mail-Adresse und Passwort prüfen.
          </p>
        ) : null}
        {usesFallbackPassword ? (
          <p className="muted" style={{ marginTop: 0 }}>
            Solange noch kein eigenes `ADMIN_PASSWORD` in `.env.local` gesetzt ist, gilt vorübergehend das
            Standardpasswort: <strong>{getAdminPassword()}</strong>
          </p>
        ) : null}
        <form action={loginAction} className="form-grid">
          <div className="field">
            <label htmlFor="admin-password">Passwort</label>
            <input id="admin-password" name="password" type="password" placeholder="Passwort eingeben" autoFocus />
          </div>
          <div className="inline-actions">
            <button className="button" type="submit">
              Anmelden
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

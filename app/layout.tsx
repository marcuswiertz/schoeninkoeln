import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schön in Köln | Kosmetikstudio",
  description: "Kosmetikstudio Schön in Köln mit integrierter Online-Terminbuchung."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <div className="page-shell">
          <header className="masthead">
            <div className="brand-stage brand-card-shell">
              <Link className="brand-lockup brand-lockup-image" href="/">
                <img src="/logo-neu-tight.png" alt="Schön in Köln Kosmetik Silke Wiertz" />
              </Link>
              <div className="topbar">
                <span className="brand-kicker">
                  <span>Ihr Kosmetikstudio</span>
                  <span>in Köln-Ehrenfeld</span>
                </span>
                <nav className="nav-links">
                  <Link href="/">Start</Link>
                  <Link href="/behandlungen">Behandlungen</Link>
                  <Link href="/produkte">Produkte</Link>
                  <Link href="/preise">Preise</Link>
                  <Link href="/gutscheine">Gutscheine</Link>
                  <Link href="/kontakt">Kontakt</Link>
                  <Link href="/buchen">Termin buchen</Link>
                </nav>
              </div>
            </div>
          </header>
          {children}
          <footer className="footer">
            <p className="footer-intern">
              <Link href="/admin/login">Intern</Link>
            </p>
            <p>Schön in Köln · Steinkrügerstraße 9 · 50825 Köln · Telefon 0172/8903667</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

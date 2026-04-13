# Schön in Köln Buchungs-App

Dieses Projekt ist die eigene Website mit Terminbuchung, Gutscheinbestellung und interner Verwaltung für `Schön in Köln`.

## Aktueller Stand

- Website mit Startseite, Preise, Behandlungen, Produkte, Kontakt
- Terminbuchung für Kundinnen
- interner Kalender für freie und gebuchte Zeiten
- Gutscheinbestellung mit PDF und Mailversand
- lokale Datenspeicherung aktuell noch über `data/store.json`

## Ziel für den Livegang

Die App soll nicht mehr lokal in `store.json` speichern, sondern auf eine echte PostgreSQL-Datenbank umgestellt werden, damit sie später sauber auf Railway laufen kann.

## Wichtige Projektbereiche

- `app` – Seiten, Route Handler und Server Actions
- `components` – UI-Komponenten
- `lib/store.ts` – aktuelle lokale JSON-Speicherung
- `lib/db.ts` – neuer PostgreSQL-Zugang für Railway
- `lib/service-repository.ts` – erste DB-Zugriffsschicht für Leistungen
- `supabase/schema.sql` – Datenbankschema
- `supabase/seed.sql` – Startdaten für Leistungen

## Geplante Zielarchitektur

- Frontend und Server: Next.js App Router
- Hosting: Railway
- Datenbank: PostgreSQL
- Mailversand: SMTP
- Domain: später z. B. `schoeninkoeln.de`

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Danach ist die App lokal unter `http://localhost:3000` erreichbar.

## Später für Railway

Diese Umgebungsvariablen werden gebraucht:

```env
DATABASE_URL=
DATABASE_SSL=true
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_TO_STUDIO=
BANK_ACCOUNT_HOLDER=
BANK_NAME=
BANK_IBAN=
BANK_BIC=
ADMIN_PASSWORD=
```

## Empfohlene Reihenfolge für die Umstellung

1. PostgreSQL-Datenbank anlegen
2. `supabase/schema.sql` ausführen
3. `supabase/seed.sql` ausführen
4. zuerst die Leistungen aus der DB lesen
5. danach Kalender und Verfügbarkeiten umstellen
6. dann Buchungen umstellen
7. zuletzt Gutscheine umstellen
8. erst danach Railway-Deployment live schalten

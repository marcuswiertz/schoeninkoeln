create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_eur numeric(10, 2) not null check (price_eur >= 0),
  is_bookable boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  status text not null check (status in ('frei', 'geblockt')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, start_time)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_slug text not null references public.services(slug) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  customer_note text not null default '',
  service_name text not null,
  display_time text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null check (status in ('Neu', 'Bestätigt', 'Storniert')) default 'Neu',
  source text not null check (source in ('online', 'telefon')) default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_date_start_time_idx on public.bookings(date, start_time);
create index if not exists bookings_status_idx on public.bookings(status);

create table if not exists public.voucher_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  type text not null check (type in ('wert', 'behandlung')),
  amount_eur numeric(10, 2),
  service_slug text references public.services(slug) on delete set null,
  service_name text,
  recipient_name text not null,
  buyer_name text not null,
  buyer_email text not null,
  message text not null default '',
  status text not null check (status in ('bestellt', 'bezahlt', 'eingelöst', 'storniert')) default 'bestellt',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists voucher_orders_status_idx on public.voucher_orders(status);
create index if not exists voucher_orders_created_at_idx on public.voucher_orders(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

drop trigger if exists availability_entries_set_updated_at on public.availability_entries;
create trigger availability_entries_set_updated_at
before update on public.availability_entries
for each row
execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

drop trigger if exists voucher_orders_set_updated_at on public.voucher_orders;
create trigger voucher_orders_set_updated_at
before update on public.voucher_orders
for each row
execute function public.set_updated_at();

insert into public.services (slug, name, description, duration_minutes, price_eur, is_bookable, is_active, sort_order)
values
  ('neukundenbehandlung', 'Neukundenbehandlung', 'Anamnese, Reinigung, Peeling, Ausreinigung, Maske und Kurzmassage.', 55, 69, true, true, 10),
  ('pflegeberatung-von-lupin', 'Pflegeberatung von Lupin', 'Anamnese und Hautanalyse, Hautreinigung mit Cleanser und biologisches Peeling, Tiefenpflege, Maske-Intensivpflege und Abschlusspflege mit persönlicher Pflegeberatung.', 55, 69, true, true, 20),
  ('pur', 'Pur', 'Reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Wirkstoffmaske und Abschlusspflege.', 55, 59, true, true, 30),
  ('pur-clean', 'Pur Clean', 'Intensive reinigende Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Tiefenreinigung, Wirkstoffmaske und Abschlusspflege.', 60, 68, true, true, 40),
  ('entspannung', 'Entspannung', 'Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Massage, Augenbrauenkorrektur, Wirkstoffmaske und Tages-Make-up.', 75, 79, true, true, 50),
  ('anti-stress-fuer-den-mann', 'Anti-Stress für den Mann', 'Komplette Gesichtsbehandlung mit Hautdiagnose, Reinigung, Peeling, Vapozon, Ausreinigung, Gesichtsmassage, Wirkstoffmaske und Abschlusspflege.', 60, 68, true, true, 60),
  ('rueckenbehandlung', 'Rückenbehandlung', 'Rückenbehandlung mit Hautdiagnose, Peeling, Ausreinigung, Kurzmassage oder Wirkstoffpackung und anschließender Körperpflege.', 45, 55, false, true, 70),
  ('manikuere', 'Maniküre', 'Klassische Maniküre für gepflegte Hände. Inklusive Nagellack beträgt der Preis 42 Euro.', 35, 35, false, true, 80),
  ('professional-oxygen-peel', 'Professional Oxygen Peel', 'Reinigende 3-Phasen Oxygen Care Peel inklusive Massage, Ausreinigung, Maske, Ampulle und Abschlusspflege.', 85, 95, true, true, 90),
  ('pumpkin-enzyme-peel', 'Pumpkin Enzyme Peel', 'Reinigung, Pumpkin Enzym Peeling, Tiefenreinigung, typgerechte Maske, Massage, Ampulle und Abschlusspflege.', 85, 95, true, true, 100),
  ('fruchtsaeure-peel', 'Fruchtsäure Peel', 'Reinigung, Peeling-Maske unter Dampf, Glycolic Polymer Solution, Tiefenreinigung, typgerechte Maske und Abschlusspflege.', 85, 79, true, true, 110),
  ('fruchtsaeure-peel-special', 'Fruchtsäure Peel Special', 'Fruchtsäure Peel + Enzyme Peel Mask.', 85, 86, true, true, 120)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_eur = excluded.price_eur,
  is_bookable = excluded.is_bookable,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

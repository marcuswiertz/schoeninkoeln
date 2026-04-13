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

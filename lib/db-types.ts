export type DbService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_eur: string;
  is_bookable: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbAvailabilityEntry = {
  id: string;
  date: string;
  start_time: string;
  status: "frei" | "geblockt";
  note: string;
  created_at: string;
  updated_at: string;
};

export type DbBooking = {
  id: string;
  service_slug: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_note: string;
  service_name: string;
  display_time: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "Neu" | "Bestätigt" | "Storniert";
  source: "online" | "telefon";
  created_at: string;
  updated_at: string;
};

export type DbVoucherOrder = {
  id: string;
  number: string;
  type: "wert" | "behandlung";
  amount_eur: string | null;
  service_slug: string | null;
  service_name: string | null;
  recipient_name: string;
  buyer_name: string;
  buyer_email: string;
  message: string;
  status: "bestellt" | "bezahlt" | "eingelöst" | "storniert";
  created_at: string;
  updated_at: string;
};

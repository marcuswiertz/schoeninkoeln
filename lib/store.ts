import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { type Service, services } from "@/lib/data";
import { query, withTransaction } from "@/lib/db";
import type { DbAvailabilityEntry, DbBooking } from "@/lib/db-types";
import { getServiceBySlugSafe } from "@/lib/service-repository";

export type AvailabilityStatus = "frei" | "geblockt";

export type AvailabilityEntry = {
  id: string;
  date: string;
  startZeit: string;
  status: AvailabilityStatus;
  note: string;
  createdAt: string;
};

export type StoredSlot = {
  id: string;
  date: string;
  datumLabel: string;
  startZeit: string;
  endZeit: string;
};

export type StoredBooking = {
  id: string;
  serviceSlug: string;
  kundin: string;
  email: string;
  telefon: string;
  notiz: string;
  leistung: string;
  zeit: string;
  date: string;
  startZeit: string;
  endZeit: string;
  status: "Neu" | "Bestätigt" | "Storniert";
  quelle: "online" | "telefon";
  createdAt: string;
};

export type VoucherStatus = "bestellt" | "bezahlt" | "eingelöst" | "storniert";

export type VoucherOrder = {
  id: string;
  nummer: string;
  typ: "wert" | "behandlung";
  wertEuro: number | null;
  leistungSlug: string | null;
  leistungName: string | null;
  beschenktePerson: string;
  schenkerName: string;
  bestellerName: string;
  bestellerEmail: string;
  widmung: string;
  status: VoucherStatus;
  createdAt: string;
};

type StoreData = {
  availability: AvailabilityEntry[];
  bookings: StoredBooking[];
  voucherOrders: VoucherOrder[];
};

export type WeekDay = {
  date: string;
  labelKurz: string;
  labelLang: string;
};

export type CalendarCell = {
  key: string;
  date: string;
  startZeit: string;
  endZeit: string;
  status: "gesperrt" | "frei" | "geblockt" | "gebucht";
  note?: string;
  booking?: {
    id: string;
    kundin: string;
    kontakt: string;
    leistung: string;
    serviceSlug: string;
    email: string;
    telefon: string;
    notiz: string;
  };
};

export type WeekBlock = {
  startZeit: string;
  cells: CalendarCell[];
};

export type WeekCalendar = {
  days: WeekDay[];
  blocks: WeekBlock[];
  weekStart: string;
  previousWeek: string;
  nextWeek: string;
  recentBookings: StoredBooking[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const CALENDAR_START_HOUR = 9;
const CALENDAR_END_HOUR = 22;
const CALENDAR_STEP_MINUTES = 15;
const BOOKING_BUFFER_MINUTES = 15;
const ONLINE_BOOKING_STEP_MINUTES = 60;
const VIEW_WEEKS_AHEAD = 8;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDbTime(value: string) {
  return value.slice(0, 5);
}

function mapDbAvailabilityEntry(entry: DbAvailabilityEntry): AvailabilityEntry {
  return {
    id: entry.id,
    date: entry.date,
    startZeit: normalizeDbTime(entry.start_time),
    status: entry.status,
    note: entry.note || "",
    createdAt: entry.created_at
  };
}

function mapDbBooking(booking: DbBooking): StoredBooking {
  return {
    id: booking.id,
    serviceSlug: booking.service_slug,
    kundin: booking.customer_name,
    email: booking.customer_email,
    telefon: booking.customer_phone,
    notiz: booking.customer_note,
    leistung: booking.service_name,
    zeit: booking.display_time,
    date: booking.date,
    startZeit: normalizeDbTime(booking.start_time),
    endZeit: normalizeDbTime(booking.end_time),
    status: booking.status,
    quelle: booking.source,
    createdAt: booking.created_at
  };
}

async function getAvailabilityEntriesForRange(dateFrom: string, dateTo: string) {
  const result = await query<DbAvailabilityEntry>(
    `
      select id, date, start_time, status, note, created_at, updated_at
      from public.availability_entries
      where date between $1 and $2
      order by date asc, start_time asc
    `,
    [dateFrom, dateTo]
  );

  return result.rows.map(mapDbAvailabilityEntry);
}

async function getBookingsForRange(dateFrom: string, dateTo: string) {
  const result = await query<DbBooking>(
    `
      select
        id,
        service_slug,
        customer_name,
        customer_email,
        customer_phone,
        customer_note,
        service_name,
        display_time,
        date,
        start_time,
        end_time,
        status,
        source,
        created_at,
        updated_at
      from public.bookings
      where date between $1 and $2
      order by date asc, start_time asc
    `,
    [dateFrom, dateTo]
  );

  return result.rows.map(mapDbBooking);
}

function getViewRangeDates() {
  const monday = getWeekStart();
  const startDate = toIsoDate(monday);
  const end = new Date(monday);
  end.setDate(monday.getDate() + (VIEW_WEEKS_AHEAD - 1) * 7 + 4);

  return {
    startDate,
    endDate: toIsoDate(end)
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function addMinutes(time: string, minutesToAdd: number) {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  const nextHours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const nextMinutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${nextHours}:${nextMinutes}`;
}

function isPastDateTime(date: string, startZeit: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = startZeit.split(":").map(Number);
  const slotDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);

  return slotDate.getTime() < Date.now();
}

function createTimeBlocks() {
  const blocks: string[] = [];

  for (let hour = CALENDAR_START_HOUR; hour < CALENDAR_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += CALENDAR_STEP_MINUTES) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      if (timeToMinutes(time) < CALENDAR_END_HOUR * 60) {
        blocks.push(time);
      }
    }
  }

  return blocks;
}

function formatGermanDate(dateString: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

function toIsoDate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getWeekStart(dateString?: string) {
  const source = dateString ? new Date(`${dateString}T12:00:00`) : new Date();
  const weekday = source.getDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  source.setDate(source.getDate() + diffToMonday);
  return source;
}

function createWeekDays(weekStartIso?: string): WeekDay[] {
  const monday = getWeekStart(weekStartIso);

  return Array.from({ length: 5 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);

    return {
      date: toIsoDate(current),
      labelKurz: new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(current),
      labelLang: new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit"
      }).format(current)
    };
  });
}

function parseLegacyDate(slot: { date?: string; id?: string }) {
  if (slot.date) {
    return slot.date;
  }

  const match = slot.id?.match(/(\d{4}-\d{2}-\d{2})/);
  return match?.[1] || new Date().toISOString().slice(0, 10);
}

function normalizeAvailability(entry: Partial<AvailabilityEntry> & { date: string; startZeit: string }) {
  return {
    id: entry.id || crypto.randomUUID(),
    date: entry.date,
    startZeit: entry.startZeit,
    status: entry.status === "geblockt" ? "geblockt" : "frei",
    note: entry.note || "",
    createdAt: entry.createdAt || new Date().toISOString()
  } satisfies AvailabilityEntry;
}

async function ensureStore(): Promise<StoreData> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData> & {
      slots?: Array<{ id?: string; date?: string; startZeit: string; status?: string }>;
    };

    if (Array.isArray(parsed.availability) && Array.isArray(parsed.bookings)) {
      return {
        availability: parsed.availability.map((entry) => normalizeAvailability(entry as AvailabilityEntry)),
        bookings: (parsed.bookings as StoredBooking[]).map((booking) => ({
          ...booking,
          quelle: booking.quelle || "online"
        })),
        voucherOrders: Array.isArray(parsed.voucherOrders) ? (parsed.voucherOrders as VoucherOrder[]) : []
      };
    }

    if (Array.isArray(parsed.slots) && Array.isArray(parsed.bookings)) {
      const migrated: StoreData = {
        availability: parsed.slots
          .filter((slot) => slot.status === "frei")
          .map((slot) =>
            normalizeAvailability({
              date: parseLegacyDate(slot),
              startZeit: slot.startZeit,
              status: "frei"
            })
          ),
        bookings: (parsed.bookings as StoredBooking[]).map((booking) => ({
          ...booking,
          date: booking.date || parseLegacyDate({ id: booking.id }),
          startZeit: booking.startZeit || "09:00",
          endZeit: booking.endZeit || "09:30",
          quelle: booking.quelle || "online"
        })),
        voucherOrders: []
      };

      await writeFile(STORE_PATH, JSON.stringify(migrated, null, 2), "utf8");
      return migrated;
    }
  } catch {}

  const initialData: StoreData = {
    availability: [],
    bookings: [],
    voucherOrders: []
  };

  await writeFile(STORE_PATH, JSON.stringify(initialData, null, 2), "utf8");
  return initialData;
}

async function saveStore(data: StoreData) {
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function getStore() {
  return ensureStore();
}

function createVoucherNumber(existingOrders: VoucherOrder[], createdAt = new Date()) {
  const year = createdAt.getFullYear().toString();
  const usedNumbers = existingOrders
    .map((entry) => entry.nummer)
    .filter((nummer) => nummer.startsWith(year))
    .map((nummer) => Number(nummer.slice(4)))
    .filter((nummer) => Number.isFinite(nummer));
  const nextNumber = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;

  return `${year}${nextNumber.toString().padStart(3, "0")}`;
}

async function createVoucherNumberFromDatabase(createdAt = new Date()) {
  const year = createdAt.getFullYear().toString();
  const result = await query<{ number: string }>(
    `
      select number
      from public.voucher_orders
      where number like $1
      order by number desc
      limit 1
    `,
    [`${year}%`]
  );

  const latest = result.rows[0]?.number;
  const nextNumber = latest ? Number(latest.slice(4)) + 1 : 1;
  return `${year}${nextNumber.toString().padStart(3, "0")}`;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

function getAvailabilityMap(availability: AvailabilityEntry[]) {
  return new Map(availability.map((entry) => [`${entry.date}-${entry.startZeit}`, entry] as const));
}

function getActiveBookings(bookings: StoredBooking[]) {
  return bookings.filter((booking) => booking.status !== "Storniert");
}

function bookingOverlapsBlock(booking: StoredBooking, date: string, startZeit: string) {
  if (booking.date !== date) {
    return false;
  }

  const blockStart = timeToMinutes(startZeit);
  const blockEnd = blockStart + CALENDAR_STEP_MINUTES;
  const bookingStart = timeToMinutes(booking.startZeit);
  const bookingEnd = timeToMinutes(booking.endZeit);

  return blockStart < bookingEnd && blockEnd > bookingStart;
}

function getBookingForBlock(bookings: StoredBooking[], date: string, startZeit: string) {
  return bookings.find((booking) => bookingOverlapsBlock(booking, date, startZeit));
}

function bookingTouchesBuffer(booking: StoredBooking, date: string, startZeit: string) {
  if (booking.quelle !== "online") {
    return false;
  }

  if (booking.date !== date) {
    return false;
  }

  const blockStart = timeToMinutes(startZeit);
  const blockEnd = blockStart + CALENDAR_STEP_MINUTES;
  const bufferedStart = timeToMinutes(booking.startZeit) - BOOKING_BUFFER_MINUTES;
  const bufferedEnd = timeToMinutes(booking.endZeit) + BOOKING_BUFFER_MINUTES;
  const bookingStart = timeToMinutes(booking.startZeit);
  const bookingEnd = timeToMinutes(booking.endZeit);

  const overlapsBufferedRange = blockStart < bufferedEnd && blockEnd > bufferedStart;
  const overlapsActualBooking = blockStart < bookingEnd && blockEnd > bookingStart;

  return overlapsBufferedRange && !overlapsActualBooking;
}

function getBufferBookingForBlock(bookings: StoredBooking[], date: string, startZeit: string) {
  return bookings.find((booking) => bookingTouchesBuffer(booking, date, startZeit));
}

function getWeekBounds(weekStartIso?: string) {
  const days = createWeekDays(weekStartIso);
  const currentWeekStart = days[0]?.date;
  const previousWeek = new Date(`${currentWeekStart}T12:00:00`);
  previousWeek.setDate(previousWeek.getDate() - 7);
  const nextWeek = new Date(`${currentWeekStart}T12:00:00`);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    days,
    weekStart: currentWeekStart,
    previousWeek: toIsoDate(previousWeek),
    nextWeek: toIsoDate(nextWeek)
  };
}

export async function getWeekCalendar(weekStartIso?: string): Promise<WeekCalendar> {
  const { days, weekStart, previousWeek, nextWeek } = getWeekBounds(weekStartIso);
  const dateFrom = days[0]?.date || weekStart;
  const dateTo = days[days.length - 1]?.date || weekStart;
  const availability = isDatabaseConfigured()
    ? await getAvailabilityEntriesForRange(dateFrom, dateTo)
    : (await getStore()).availability;
  const bookings = isDatabaseConfigured() ? await getBookingsForRange(dateFrom, dateTo) : (await getStore()).bookings;
  const availabilityMap = getAvailabilityMap(availability);
  const activeBookings = getActiveBookings(bookings);

  const blocks: WeekBlock[] = createTimeBlocks().map((startZeit) => {
    const endZeit = addMinutes(startZeit, CALENDAR_STEP_MINUTES);

    return {
      startZeit,
      cells: days.map((day) => {
        const booking = getBookingForBlock(activeBookings, day.date, startZeit);

        if (booking) {
          return {
            key: `${day.date}-${startZeit}`,
            date: day.date,
            startZeit,
            endZeit,
            status: "gebucht",
            booking: {
              id: booking.id,
              kundin: booking.kundin,
              kontakt: booking.telefon || booking.email,
              leistung: booking.leistung,
              serviceSlug: booking.serviceSlug,
              email: booking.email,
              telefon: booking.telefon,
              notiz: booking.notiz
            }
          } satisfies CalendarCell;
        }

        const bufferBooking = getBufferBookingForBlock(activeBookings, day.date, startZeit);

        if (bufferBooking) {
          return {
            key: `${day.date}-${startZeit}`,
            date: day.date,
            startZeit,
            endZeit,
            status: "gesperrt",
            note: "Pufferzeit"
          } satisfies CalendarCell;
        }

        const availability = availabilityMap.get(`${day.date}-${startZeit}`);

        if (availability?.status === "frei") {
          return {
            key: `${day.date}-${startZeit}`,
            date: day.date,
            startZeit,
            endZeit,
            status: "frei"
          } satisfies CalendarCell;
        }

        if (availability?.status === "geblockt") {
          return {
            key: `${day.date}-${startZeit}`,
            date: day.date,
            startZeit,
            endZeit,
            status: "geblockt",
            note: availability.note
          } satisfies CalendarCell;
        }

        return {
          key: `${day.date}-${startZeit}`,
          date: day.date,
          startZeit,
          endZeit,
          status: "gesperrt"
        } satisfies CalendarCell;
      })
    };
  });

  return {
    days,
    blocks,
    weekStart,
    previousWeek,
    nextWeek,
    recentBookings: [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20)
  };
}

function hasContiguousFreeBlocks(
  availabilityMap: Map<string, AvailabilityEntry>,
  bookings: StoredBooking[],
  date: string,
  startZeit: string,
  durationMinutes: number
) {
  if (isPastDateTime(date, startZeit)) {
    return false;
  }

  const requiredBlocks = Math.ceil(durationMinutes / CALENDAR_STEP_MINUTES);
  const startMinutes = timeToMinutes(startZeit);
  const endMinutes = startMinutes + requiredBlocks * CALENDAR_STEP_MINUTES;

  if (endMinutes > CALENDAR_END_HOUR * 60) {
    return false;
  }

  for (let index = 0; index < requiredBlocks; index += 1) {
    const blockStart = addMinutes(startZeit, index * CALENDAR_STEP_MINUTES);

    if (isPastDateTime(date, blockStart)) {
      return false;
    }

    const availability = availabilityMap.get(`${date}-${blockStart}`);

    if (availability?.status !== "frei") {
      return false;
    }

    if (getBookingForBlock(bookings, date, blockStart)) {
      return false;
    }

    if (getBufferBookingForBlock(bookings, date, blockStart)) {
      return false;
    }
  }

  return true;
}

export async function getAvailableSlotsForService(serviceSlug: string) {
  const service = await getServiceBySlugSafe(serviceSlug);

  if (!service) {
    return [];
  }

  const sourceData = isDatabaseConfigured()
    ? await (async () => {
        const range = getViewRangeDates();
        return {
          availability: await getAvailabilityEntriesForRange(range.startDate, range.endDate),
          bookings: await getBookingsForRange(range.startDate, range.endDate)
        };
      })()
    : await getStore();
  const availabilityMap = getAvailabilityMap(sourceData.availability);
  const activeBookings = getActiveBookings(sourceData.bookings);
  const slots: StoredSlot[] = [];
  const seen = new Set<string>();
  const times = createTimeBlocks();
  const serviceStepBlocks = Math.ceil(service.dauerMinuten / CALENDAR_STEP_MINUTES);
  const onlineStepBlocks = Math.ceil(ONLINE_BOOKING_STEP_MINUTES / CALENDAR_STEP_MINUTES);

  for (let weekOffset = 0; weekOffset < VIEW_WEEKS_AHEAD; weekOffset += 1) {
    const monday = getWeekStart();
    monday.setDate(monday.getDate() + weekOffset * 7);

    for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + dayOffset);
      const date = toIsoDate(current);
      let index = 0;

      while (index < times.length) {
        const runStart = index;

        while (index < times.length && hasContiguousFreeBlocks(availabilityMap, activeBookings, date, times[index], service.dauerMinuten)) {
          index += 1;
        }

        const runLength = index - runStart;
        if (runLength >= serviceStepBlocks) {
          for (let slotIndex = runStart; slotIndex < index; slotIndex += onlineStepBlocks) {
            const startZeit = times[slotIndex];

            if (!hasContiguousFreeBlocks(availabilityMap, activeBookings, date, startZeit, service.dauerMinuten)) {
              continue;
            }

            const id = `${serviceSlug}|${date}|${startZeit}`;

            if (seen.has(id)) {
              continue;
            }

            seen.add(id);
            slots.push({
              id,
              date,
              datumLabel: formatGermanDate(date),
              startZeit,
              endZeit: addMinutes(startZeit, Math.ceil(service.dauerMinuten / CALENDAR_STEP_MINUTES) * CALENDAR_STEP_MINUTES)
            });
          }
        }

        index += 1;
      }
    }
  }

  return slots.sort((a, b) => `${a.date}-${a.startZeit}`.localeCompare(`${b.date}-${b.startZeit}`, "de"));
}

export async function updateAvailability(input: {
  cells: Array<{ date: string; startZeit: string }>;
  action: "freigeben" | "blockieren" | "sperren";
  note?: string;
}) {
  if (isDatabaseConfigured()) {
    const dates = [...new Set(input.cells.map((cell) => cell.date))].sort();
    const bookings = dates.length
      ? await getBookingsForRange(dates[0], dates[dates.length - 1])
      : [];
    const activeBookings = getActiveBookings(bookings);

    for (const cell of input.cells) {
      if (getBookingForBlock(activeBookings, cell.date, cell.startZeit)) {
        throw new Error("Gebuchte Zeiten können nicht direkt geändert werden.");
      }
    }

    await withTransaction(async (client) => {
      for (const cell of input.cells) {
        await client.query("delete from public.availability_entries where date = $1 and start_time = $2::time", [
          cell.date,
          cell.startZeit
        ]);

        if (input.action !== "sperren") {
          const status = input.action === "freigeben" ? "frei" : "geblockt";
          await client.query(
            `
              insert into public.availability_entries (date, start_time, status, note)
              values ($1, $2::time, $3, $4)
              on conflict (date, start_time) do update
              set status = excluded.status,
                  note = excluded.note,
                  updated_at = now()
            `,
            [cell.date, cell.startZeit, status, status === "geblockt" ? input.note || "" : ""]
          );
        }
      }
    });

    return;
  }

  const store = await getStore();
  const selectedKeys = new Set(input.cells.map((cell) => `${cell.date}-${cell.startZeit}`));
  const activeBookings = getActiveBookings(store.bookings);

  for (const cell of input.cells) {
    if (getBookingForBlock(activeBookings, cell.date, cell.startZeit)) {
      throw new Error("Gebuchte Zeiten können nicht direkt geändert werden.");
    }
  }

  store.availability = store.availability.filter((entry) => !selectedKeys.has(`${entry.date}-${entry.startZeit}`));

  if (input.action !== "sperren") {
    const status = input.action === "freigeben" ? "frei" : "geblockt";

    for (const cell of input.cells) {
      store.availability.push(
        normalizeAvailability({
          date: cell.date,
          startZeit: cell.startZeit,
          status,
          note: status === "geblockt" ? input.note || "" : ""
        })
      );
    }
  }

  await saveStore(store);
}

function ensureContiguousSelection(cells: Array<{ date: string; startZeit: string }>) {
  if (!cells.length) {
    throw new Error("Bitte zuerst mindestens einen Block auswählen.");
  }

  const dates = new Set(cells.map((cell) => cell.date));
  if (dates.size !== 1) {
    throw new Error("Für einen gebuchten Termin müssen die ausgewählten Blöcke am selben Tag liegen.");
  }

  const sortedTimes = [...cells].sort((a, b) => timeToMinutes(a.startZeit) - timeToMinutes(b.startZeit));
  for (let index = 1; index < sortedTimes.length; index += 1) {
    const previous = timeToMinutes(sortedTimes[index - 1].startZeit);
    const current = timeToMinutes(sortedTimes[index].startZeit);
    if (current - previous !== CALENDAR_STEP_MINUTES) {
      throw new Error("Für einen gebuchten Termin müssen die ausgewählten Blöcke direkt zusammenhängen.");
    }
  }

  return sortedTimes;
}

export async function createManualBooking(input: {
  serviceSlug: string;
  cells: Array<{ date: string; startZeit: string }>;
  kundin: string;
  email: string;
  telefon: string;
  notiz: string;
}) {
  const service = await getServiceBySlugSafe(input.serviceSlug);
  const sortedCells = ensureContiguousSelection(input.cells);

  if (!service) {
    throw new Error("Bitte eine Behandlung auswählen.");
  }

  if (isDatabaseConfigured()) {
    const dates = [...new Set(input.cells.map((cell) => cell.date))].sort();
    const bookings = dates.length
      ? await getBookingsForRange(dates[0], dates[dates.length - 1])
      : [];

    for (const cell of sortedCells) {
      if (getBookingForBlock(getActiveBookings(bookings), cell.date, cell.startZeit)) {
        throw new Error("Mindestens einer der ausgewählten Blöcke ist bereits gebucht.");
      }
    }

    await withTransaction(async (client) => {
      for (const cell of sortedCells) {
        await client.query("delete from public.availability_entries where date = $1 and start_time = $2::time", [
          cell.date,
          cell.startZeit
        ]);
      }

      await client.query(
        `
          insert into public.bookings (
            service_slug,
            customer_name,
            customer_email,
            customer_phone,
            customer_note,
            service_name,
            display_time,
            date,
            start_time,
            end_time,
            status,
            source
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9::time, $10::time, $11, $12)
        `,
        [
          input.serviceSlug,
          input.kundin,
          input.email,
          input.telefon,
          input.notiz,
          service.name,
          `${formatGermanDate(date)}, ${startZeit} Uhr`,
          date,
          startZeit,
          endZeit,
          "Bestätigt",
          "telefon"
        ]
      );
    });

    return;
  }

  const store = await getStore();
  const date = sortedCells[0].date;
  const startZeit = sortedCells[0].startZeit;
  const endZeit = addMinutes(sortedCells[sortedCells.length - 1].startZeit, CALENDAR_STEP_MINUTES);

  for (const cell of sortedCells) {
    if (getBookingForBlock(getActiveBookings(store.bookings), cell.date, cell.startZeit)) {
      throw new Error("Mindestens einer der ausgewählten Blöcke ist bereits gebucht.");
    }
  }

  store.availability = store.availability.filter(
    (entry) => !sortedCells.some((cell) => entry.date === cell.date && entry.startZeit === cell.startZeit)
  );

  store.bookings.unshift({
    id: crypto.randomUUID(),
    serviceSlug: input.serviceSlug,
    kundin: input.kundin,
    email: input.email,
    telefon: input.telefon,
    notiz: input.notiz,
    leistung: service.name,
    zeit: `${formatGermanDate(date)}, ${startZeit} Uhr`,
    date,
    startZeit,
    endZeit,
    status: "Bestätigt",
    quelle: "telefon",
    createdAt: new Date().toISOString()
  });

  await saveStore(store);
}

export async function updateBooking(input: {
  bookingId: string;
  serviceSlug: string;
  kundin: string;
  email: string;
  telefon: string;
  notiz: string;
}) {
  if (isDatabaseConfigured()) {
    const service = await getServiceBySlugSafe(input.serviceSlug);

    if (!service) {
      throw new Error("Die Buchung konnte nicht gefunden werden.");
    }

    await query(
      `
        update public.bookings
        set
          service_slug = $2,
          customer_name = $3,
          customer_email = $4,
          customer_phone = $5,
          customer_note = $6,
          service_name = $7,
          updated_at = now()
        where id = $1
      `,
      [input.bookingId, input.serviceSlug, input.kundin, input.email, input.telefon, input.notiz, service.name]
    );

    return;
  }

  const store = await getStore();
  const booking = store.bookings.find((entry) => entry.id === input.bookingId);
  const service = await getServiceBySlugSafe(input.serviceSlug);

  if (!booking || !service) {
    throw new Error("Die Buchung konnte nicht gefunden werden.");
  }

  booking.serviceSlug = input.serviceSlug;
  booking.kundin = input.kundin;
  booking.email = input.email;
  booking.telefon = input.telefon;
  booking.notiz = input.notiz;
  booking.leistung = service.name;

  await saveStore(store);
}

export async function deleteBooking(bookingId: string) {
  if (isDatabaseConfigured()) {
    await query("delete from public.bookings where id = $1", [bookingId]);
    return;
  }

  const store = await getStore();
  store.bookings = store.bookings.filter((booking) => booking.id !== bookingId);
  await saveStore(store);
}

export async function createBooking(input: {
  serviceSlug: string;
  slotId: string;
  kundin: string;
  email: string;
  telefon: string;
  notiz: string;
}) {
  const service = await getServiceBySlugSafe(input.serviceSlug);

  if (!service) {
    throw new Error("Die Behandlung wurde nicht gefunden.");
  }

  const [serviceFromSlot, date, startZeit] = input.slotId.split("|");
  if (serviceFromSlot !== input.serviceSlug || !date || !startZeit) {
    throw new Error("Der gewählte Termin ist nicht verfügbar.");
  }

  const sourceData = isDatabaseConfigured()
    ? await (async () => {
        const range = getViewRangeDates();
        return {
          availability: await getAvailabilityEntriesForRange(range.startDate, range.endDate),
          bookings: await getBookingsForRange(range.startDate, range.endDate)
        };
      })()
    : await getStore();
  const availabilityMap = getAvailabilityMap(sourceData.availability);
  const activeBookings = getActiveBookings(sourceData.bookings);

  if (isPastDateTime(date, startZeit)) {
    throw new Error("Dieser Termin liegt in der Vergangenheit und kann nicht mehr gebucht werden.");
  }

  if (!hasContiguousFreeBlocks(availabilityMap, activeBookings, date, startZeit, service.dauerMinuten)) {
    throw new Error("Dieser Termin wurde gerade bereits vergeben.");
  }

  const requiredBlocks = Math.ceil(service.dauerMinuten / CALENDAR_STEP_MINUTES);
  const selectedCells = Array.from({ length: requiredBlocks }, (_, index) => ({
    date,
    startZeit: addMinutes(startZeit, index * CALENDAR_STEP_MINUTES)
  }));

  const endZeit = addMinutes(startZeit, requiredBlocks * CALENDAR_STEP_MINUTES);

  if (isDatabaseConfigured()) {
    const booking = await withTransaction(async (client) => {
      for (const cell of selectedCells) {
        await client.query("delete from public.availability_entries where date = $1 and start_time = $2::time", [
          cell.date,
          cell.startZeit
        ]);
      }

      const inserted = await client.query<DbBooking>(
        `
          insert into public.bookings (
            service_slug,
            customer_name,
            customer_email,
            customer_phone,
            customer_note,
            service_name,
            display_time,
            date,
            start_time,
            end_time,
            status,
            source
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9::time, $10::time, $11, $12)
          returning
            id,
            service_slug,
            customer_name,
            customer_email,
            customer_phone,
            customer_note,
            service_name,
            display_time,
            date,
            start_time,
            end_time,
            status,
            source,
            created_at,
            updated_at
        `,
        [
          input.serviceSlug,
          input.kundin,
          input.email,
          input.telefon,
          input.notiz,
          service.name,
          `${formatGermanDate(date)}, ${startZeit} Uhr`,
          date,
          startZeit,
          endZeit,
          "Neu",
          "online"
        ]
      );

      return mapDbBooking(inserted.rows[0]);
    });

    return booking;
  }

  const store = sourceData as StoreData;
  store.availability = store.availability.filter(
    (entry) => !selectedCells.some((cell) => entry.date === cell.date && entry.startZeit === cell.startZeit)
  );

  store.bookings.unshift({
    id: crypto.randomUUID(),
    serviceSlug: input.serviceSlug,
    kundin: input.kundin,
    email: input.email,
    telefon: input.telefon,
    notiz: input.notiz,
    leistung: service.name,
    zeit: `${formatGermanDate(date)}, ${startZeit} Uhr`,
    date,
    startZeit,
    endZeit,
    status: "Neu",
    quelle: "online",
    createdAt: new Date().toISOString()
  });

  await saveStore(store);
  return store.bookings[0];
}

export async function createVoucherOrder(input: {
  typ: "wert" | "behandlung";
  wertEuro?: number | null;
  leistungSlug?: string | null;
  beschenktePerson: string;
  schenkerName: string;
  bestellerName: string;
  bestellerEmail: string;
  widmung: string;
}) {
  const createdAt = new Date();
  const service = input.leistungSlug ? await getServiceBySlugSafe(input.leistungSlug) : undefined;

  if (input.typ === "wert" && (!input.wertEuro || input.wertEuro <= 0)) {
    throw new Error("Bitte einen gültigen Gutscheinwert eintragen.");
  }

  if (input.typ === "behandlung" && !service) {
    throw new Error("Bitte eine Behandlung auswählen.");
  }

  if (isDatabaseConfigured()) {
    const nummer = await createVoucherNumberFromDatabase(createdAt);
    const inserted = await query<{
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
      status: VoucherStatus;
      created_at: string;
    }>(
      `
        insert into public.voucher_orders (
          number,
          type,
          amount_eur,
          service_slug,
          service_name,
          recipient_name,
          buyer_name,
          buyer_email,
          message,
          status
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'bestellt')
        returning id, number, type, amount_eur, service_slug, service_name, recipient_name, buyer_name, buyer_email, message, status, created_at
      `,
      [
        nummer,
        input.typ,
        input.typ === "wert" ? Number(input.wertEuro) : null,
        input.typ === "behandlung" ? service?.slug || null : null,
        input.typ === "behandlung" ? service?.name || null : null,
        input.beschenktePerson.trim(),
        input.bestellerName.trim(),
        input.bestellerEmail.trim(),
        input.widmung.trim()
      ]
    );

    const row = inserted.rows[0];
    return {
      id: row.id,
      nummer: row.number,
      typ: row.type,
      wertEuro: row.amount_eur ? Number(row.amount_eur) : null,
      leistungSlug: row.service_slug,
      leistungName: row.service_name,
      beschenktePerson: row.recipient_name,
      schenkerName: "",
      bestellerName: row.buyer_name,
      bestellerEmail: row.buyer_email,
      widmung: row.message,
      status: row.status,
      createdAt: row.created_at
    };
  }

  const store = await getStore();
  const voucherOrder: VoucherOrder = {
    id: crypto.randomUUID(),
    nummer: createVoucherNumber(store.voucherOrders, createdAt),
    typ: input.typ,
    wertEuro: input.typ === "wert" ? Number(input.wertEuro) : null,
    leistungSlug: input.typ === "behandlung" ? service?.slug || null : null,
    leistungName: input.typ === "behandlung" ? service?.name || null : null,
    beschenktePerson: input.beschenktePerson.trim(),
    schenkerName: input.schenkerName.trim(),
    bestellerName: input.bestellerName.trim(),
    bestellerEmail: input.bestellerEmail.trim(),
    widmung: input.widmung.trim(),
    status: "bestellt",
    createdAt: createdAt.toISOString()
  };

  store.voucherOrders.unshift(voucherOrder);
  await saveStore(store);

  return voucherOrder;
}

export async function getVoucherOrders() {
  if (isDatabaseConfigured()) {
    const result = await query<{
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
      status: VoucherStatus;
      created_at: string;
    }>(
      `
        select id, number, type, amount_eur, service_slug, service_name, recipient_name, buyer_name, buyer_email, message, status, created_at
        from public.voucher_orders
        order by created_at desc
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      nummer: row.number,
      typ: row.type,
      wertEuro: row.amount_eur ? Number(row.amount_eur) : null,
      leistungSlug: row.service_slug,
      leistungName: row.service_name,
      beschenktePerson: row.recipient_name,
      schenkerName: "",
      bestellerName: row.buyer_name,
      bestellerEmail: row.buyer_email,
      widmung: row.message,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  const store = await getStore();
  return [...store.voucherOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateVoucherStatus(voucherId: string, status: VoucherStatus) {
  if (isDatabaseConfigured()) {
    await query("update public.voucher_orders set status = $2, updated_at = now() where id = $1", [voucherId, status]);
    return;
  }

  const store = await getStore();
  const voucher = store.voucherOrders.find((entry) => entry.id === voucherId);

  if (!voucher) {
    throw new Error("Der Gutschein konnte nicht gefunden werden.");
  }

  voucher.status = status;
  await saveStore(store);
}

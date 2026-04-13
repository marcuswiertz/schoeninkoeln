import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { createManualBooking, deleteBooking, getWeekCalendar, updateAvailability, updateBooking } from "@/lib/store";

type CalendarCellInput = {
  date?: unknown;
  startZeit?: unknown;
};

type CalendarCell = {
  date: string;
  startZeit: string;
};

async function ensureAdminRequest() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "ok";
}

export async function GET(request: Request) {
  if (!(await ensureAdminRequest())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week") || undefined;
  const calendar = await getWeekCalendar(week);
  return NextResponse.json({ calendar });
}

export async function POST(request: Request) {
  if (!(await ensureAdminRequest())) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const week = typeof body.week === "string" ? body.week : undefined;
    const cells: CalendarCell[] = Array.isArray(body.cells)
      ? (body.cells as CalendarCellInput[])
          .filter((cell) => typeof cell?.date === "string" && typeof cell?.startZeit === "string")
          .map((cell) => ({
            date: cell.date as string,
            startZeit: cell.startZeit as string
          }))
      : [];

    if (body.action === "buchen") {
      await createManualBooking({
        serviceSlug: String(body.booking?.serviceSlug || ""),
        cells,
        kundin: String(body.booking?.kundin || ""),
        email: String(body.booking?.email || ""),
        telefon: String(body.booking?.telefon || ""),
        notiz: String(body.booking?.notiz || "")
      });
    } else if (body.action === "booking-update") {
      await updateBooking({
        bookingId: String(body.booking?.bookingId || ""),
        serviceSlug: String(body.booking?.serviceSlug || ""),
        kundin: String(body.booking?.kundin || ""),
        email: String(body.booking?.email || ""),
        telefon: String(body.booking?.telefon || ""),
        notiz: String(body.booking?.notiz || "")
      });
    } else if (body.action === "booking-delete") {
      await deleteBooking(String(body.bookingId || ""));
    } else {
      await updateAvailability({
        action: body.action,
        cells,
        note: String(body.note || "")
      });
    }

    const calendar = await getWeekCalendar(week);
    return NextResponse.json({ calendar });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Die Änderung konnte nicht gespeichert werden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

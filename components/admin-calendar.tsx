"use client";

import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/data";
import type { CalendarCell, WeekCalendar } from "@/lib/store";

type Props = {
  initialCalendar: WeekCalendar;
  services: Service[];
};

type ManualBookingForm = {
  bookingId?: string;
  serviceSlug: string;
  kundin: string;
  email: string;
  telefon: string;
  notiz: string;
};

function getSelectedCells(calendar: WeekCalendar, selection: Set<string>) {
  const cells: CalendarCell[] = [];

  for (const block of calendar.blocks) {
    for (const cell of block.cells) {
      if (selection.has(cell.key)) {
        cells.push(cell);
      }
    }
  }

  return cells.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date, "de");
    return dateCompare || a.startZeit.localeCompare(b.startZeit, "de");
  });
}

function getSelectionLabel(selectedCells: CalendarCell[]) {
  if (!selectedCells.length) {
    return "";
  }

  const first = selectedCells[0];
  const last = selectedCells[selectedCells.length - 1];
  return `${first.date} · ${first.startZeit} bis ${last.endZeit}`;
}

function getBookingShape(calendar: WeekCalendar, rowIndex: number, dayIndex: number, cell: CalendarCell) {
  if (cell.status !== "gebucht" || !cell.booking?.id) {
    return { isStart: false, isMiddle: false, isEnd: false, isSingle: false, partIndex: 0 };
  }

  const previous = rowIndex > 0 ? calendar.blocks[rowIndex - 1]?.cells[dayIndex] : undefined;
  const next = rowIndex < calendar.blocks.length - 1 ? calendar.blocks[rowIndex + 1]?.cells[dayIndex] : undefined;
  const sameAsPrevious = previous?.status === "gebucht" && previous.booking?.id === cell.booking.id;
  const sameAsNext = next?.status === "gebucht" && next.booking?.id === cell.booking.id;

  let partIndex = 0;
  for (let index = rowIndex - 1; index >= 0; index -= 1) {
    const candidate = calendar.blocks[index]?.cells[dayIndex];
    if (candidate?.status === "gebucht" && candidate.booking?.id === cell.booking.id) {
      partIndex += 1;
    } else {
      break;
    }
  }

  return {
    isStart: !sameAsPrevious && sameAsNext,
    isMiddle: sameAsPrevious && sameAsNext,
    isEnd: sameAsPrevious && !sameAsNext,
    isSingle: !sameAsPrevious && !sameAsNext,
    partIndex
  };
}

function getBookingLines(cell: CalendarCell) {
  if (!cell.booking) {
    return [];
  }

  return [
    cell.booking.kundin,
    cell.booking.leistung,
    cell.booking.telefon,
    cell.booking.email,
    cell.booking.notiz
  ].filter(Boolean);
}

function getBookingToneMap(calendar: WeekCalendar) {
  const toneMap = new Map<string, "a" | "b">();

  for (let dayIndex = 0; dayIndex < calendar.days.length; dayIndex += 1) {
    let nextTone: "a" | "b" = "a";

    for (let rowIndex = 0; rowIndex < calendar.blocks.length; rowIndex += 1) {
      const cell = calendar.blocks[rowIndex]?.cells[dayIndex];
      const previous = rowIndex > 0 ? calendar.blocks[rowIndex - 1]?.cells[dayIndex] : undefined;

      if (
        cell?.status === "gebucht" &&
        cell.booking?.id &&
        !(previous?.status === "gebucht" && previous.booking?.id === cell.booking.id)
      ) {
        toneMap.set(cell.booking.id, nextTone);
        nextTone = nextTone === "a" ? "b" : "a";
      }
    }
  }

  return toneMap;
}

export function AdminCalendar({ initialCalendar, services }: Props) {
  const [calendar, setCalendar] = useState(initialCalendar);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState<ManualBookingForm>({
    serviceSlug: services[0]?.slug || "",
    kundin: "",
    email: "",
    telefon: "",
    notiz: ""
  });

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDragging);
    return () => window.removeEventListener("mouseup", stopDragging);
  }, []);

  const selectedCells = useMemo(() => getSelectedCells(calendar, selection), [calendar, selection]);
  const bookingToneMap = useMemo(() => getBookingToneMap(calendar), [calendar]);

  async function loadWeek(week: string) {
    setError("");
    const response = await fetch(`/api/admin/calendar?week=${encodeURIComponent(week)}`, {
      cache: "no-store"
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Die Kalenderwoche konnte nicht geladen werden.");
      return;
    }

    setCalendar(payload.calendar);
    setSelection(new Set());
    setShowBookingForm(false);
    setIsEditingBooking(false);
  }

  function setCellSelected(cell: CalendarCell, shouldSelect: boolean) {
    if (cell.status === "gebucht") {
      return;
    }

    setSelection((previous) => {
      const next = new Set(previous);
      if (shouldSelect) {
        next.add(cell.key);
      } else {
        next.delete(cell.key);
      }
      return next;
    });
  }

  function openBookingEditor(cell: CalendarCell) {
    if (!cell.booking) {
      return;
    }

    setSelection(new Set());
    setIsEditingBooking(true);
    setShowBookingForm(true);
    setBookingForm({
      bookingId: cell.booking.id,
      serviceSlug: cell.booking.serviceSlug,
      kundin: cell.booking.kundin,
      email: cell.booking.email,
      telefon: cell.booking.telefon,
      notiz: cell.booking.notiz
    });
  }

  function handleMouseDown(cell: CalendarCell) {
    if (cell.status === "gebucht") {
      openBookingEditor(cell);
      return;
    }

    const shouldSelect = !selection.has(cell.key);
    setDragMode(shouldSelect ? "add" : "remove");
    setCellSelected(cell, shouldSelect);
    setIsDragging(true);
    setShowBookingForm(false);
    setIsEditingBooking(false);
  }

  function handleMouseEnter(cell: CalendarCell) {
    if (!isDragging || cell.status === "gebucht") {
      return;
    }

    setCellSelected(cell, dragMode === "add");
  }

  async function saveCalendarChange(body: Record<string, unknown>) {
    setIsSaving(true);
    setError("");

    const response = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        week: calendar.weekStart,
        ...body
      })
    });

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setError(payload.error || "Die Änderung konnte nicht gespeichert werden.");
      return false;
    }

    setCalendar(payload.calendar);
    return true;
  }

  async function applyAvailabilityAction(action: "freigeben" | "blockieren" | "sperren") {
    if (!selectedCells.length) {
      return;
    }

    const note = action === "blockieren" ? window.prompt("Optionaler Hinweis für die Markierung:", "") || "" : "";
    const ok = await saveCalendarChange({
      action,
      cells: selectedCells.map((cell) => ({
        date: cell.date,
        startZeit: cell.startZeit
      })),
      note
    });

    if (!ok) {
      return;
    }

    setSelection(new Set());
    setShowBookingForm(false);
    setIsEditingBooking(false);
  }

  function openCreateBookingForm() {
    setIsEditingBooking(false);
    setShowBookingForm(true);
    setBookingForm({
      serviceSlug: services[0]?.slug || "",
      kundin: "",
      email: "",
      telefon: "",
      notiz: ""
    });
  }

  async function submitBookingForm() {
    if (isEditingBooking && bookingForm.bookingId) {
      const ok = await saveCalendarChange({
        action: "booking-update",
        booking: bookingForm
      });

      if (!ok) {
        return;
      }

      setShowBookingForm(false);
      setIsEditingBooking(false);
      return;
    }

    if (!selectedCells.length) {
      return;
    }

    const ok = await saveCalendarChange({
      action: "buchen",
      cells: selectedCells.map((cell) => ({
        date: cell.date,
        startZeit: cell.startZeit
      })),
      booking: bookingForm
    });

    if (!ok) {
      return;
    }

    setSelection(new Set());
    setShowBookingForm(false);
    setBookingForm({
      serviceSlug: services[0]?.slug || "",
      kundin: "",
      email: "",
      telefon: "",
      notiz: ""
    });
  }

  async function handleDeleteBooking() {
    if (!bookingForm.bookingId) {
      return;
    }

    const ok = await saveCalendarChange({
      action: "booking-delete",
      bookingId: bookingForm.bookingId
    });

    if (!ok) {
      return;
    }

    setShowBookingForm(false);
    setIsEditingBooking(false);
  }

  return (
    <>
      <section className="admin-card" style={{ marginBottom: 24 }}>
        <div className="calendar-toolbar">
          <div className="week-nav">
            <button className="button-secondary" onClick={() => loadWeek(calendar.previousWeek)} type="button">
              Vorherige Woche
            </button>
            <strong>
              {calendar.days[0]?.labelLang} bis {calendar.days[calendar.days.length - 1]?.labelLang}
            </strong>
            <button className="button-secondary" onClick={() => loadWeek(calendar.nextWeek)} type="button">
              Nächste Woche
            </button>
          </div>

          {error ? <p className="calendar-error">{error}</p> : null}
        </div>

        <div className="calendar-shell">
          <div className="week-calendar">
            <div className="calendar-corner" />
            {calendar.days.map((day) => (
              <div className="calendar-day-head" key={day.date}>
                <strong>{day.labelKurz}</strong>
                <span>{day.labelLang}</span>
              </div>
            ))}

            {calendar.blocks.map((block, rowIndex) => (
              <div className="calendar-row" key={block.startZeit}>
                <div className="calendar-time">{block.startZeit}</div>
                {block.cells.map((cell, dayIndex) => {
                  const isSelected = selection.has(cell.key);
                  const bookingShape = getBookingShape(calendar, rowIndex, dayIndex, cell);
                  const title =
                    cell.status === "gebucht"
                      ? [
                          cell.booking?.kundin || "",
                          cell.booking?.leistung || "",
                          cell.booking?.telefon || cell.booking?.email || "",
                          cell.booking?.email || "",
                          cell.booking?.notiz || ""
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : cell.status === "geblockt"
                        ? cell.note || "Gebucht"
                        : cell.status;

                  const bookingClass =
                    bookingShape.isSingle
                      ? " is-booking-single"
                      : bookingShape.isStart
                        ? " is-booking-start"
                        : bookingShape.isMiddle
                          ? " is-booking-middle"
                          : bookingShape.isEnd
                            ? " is-booking-end"
                            : "";

                  const bookingLines = getBookingLines(cell);
                  const bookingText =
                    cell.status === "gebucht" && bookingShape.partIndex < bookingLines.length
                      ? bookingLines[bookingShape.partIndex] || ""
                      : "";
                  const bookingTone = cell.booking?.id ? bookingToneMap.get(cell.booking.id) || "a" : "a";

                  return (
                    <button
                      className={`calendar-cell is-${cell.status}${isSelected ? " is-selected" : ""}${bookingClass}${cell.status === "gebucht" ? ` is-tone-${bookingTone}` : ""}`}
                      key={cell.key}
                      onMouseDown={() => handleMouseDown(cell)}
                      onMouseEnter={() => handleMouseEnter(cell)}
                      type="button"
                      title={title}
                    >
                      {cell.status === "gebucht" ? (
                        <strong>{bookingText}</strong>
                      ) : (
                        <strong>{cell.status === "frei" ? "Buchbar" : cell.status === "gesperrt" ? "Gesperrt" : ""}</strong>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedCells.length ? (
        <aside className="floating-actions">
          <strong>{selectedCells.length} Block{selectedCells.length > 1 ? "e" : ""} markiert</strong>
          <span>{getSelectionLabel(selectedCells)}</span>
          <div className="selection-actions">
            <button className="button-secondary" disabled={isSaving} onClick={() => applyAvailabilityAction("freigeben")} type="button">
              Freigeben
            </button>
            <button className="button-secondary" disabled={isSaving} onClick={() => applyAvailabilityAction("sperren")} type="button">
              Sperren
            </button>
            <button className="button" disabled={isSaving} onClick={openCreateBookingForm} type="button">
              Gebucht eintragen
            </button>
          </div>
          <button
            className="floating-close"
            onClick={() => {
              setSelection(new Set());
              setShowBookingForm(false);
              setIsEditingBooking(false);
            }}
            type="button"
          >
            Auswahl aufheben
          </button>
        </aside>
      ) : null}

      {showBookingForm ? (
        <section className="booking-drawer">
          <div className="admin-card booking-drawer-card">
            <h2>{isEditingBooking ? "Buchung bearbeiten" : "Gebuchten Termin eintragen"}</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="serviceSlugManual">Behandlung</label>
                <select
                  id="serviceSlugManual"
                  value={bookingForm.serviceSlug}
                  onChange={(event) => setBookingForm((previous) => ({ ...previous, serviceSlug: event.target.value }))}
                >
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="kundinManual">Name</label>
                <input
                  id="kundinManual"
                  value={bookingForm.kundin}
                  onChange={(event) => setBookingForm((previous) => ({ ...previous, kundin: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="telefonManual">Telefon</label>
                <input
                  id="telefonManual"
                  value={bookingForm.telefon}
                  onChange={(event) => setBookingForm((previous) => ({ ...previous, telefon: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="emailManual">E-Mail</label>
                <input
                  id="emailManual"
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => setBookingForm((previous) => ({ ...previous, email: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="notizManual">Hinweis</label>
                <textarea
                  id="notizManual"
                  value={bookingForm.notiz}
                  onChange={(event) => setBookingForm((previous) => ({ ...previous, notiz: event.target.value }))}
                />
              </div>
              <div className="inline-actions">
                <button className="button" disabled={isSaving || !bookingForm.kundin.trim()} onClick={submitBookingForm} type="button">
                  Speichern
                </button>
                {isEditingBooking ? (
                  <button className="button-secondary" disabled={isSaving} onClick={handleDeleteBooking} type="button">
                    Löschen
                  </button>
                ) : null}
                <button className="button-secondary" disabled={isSaving} onClick={() => setShowBookingForm(false)} type="button">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

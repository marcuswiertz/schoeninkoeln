"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBooking } from "@/lib/store";
import { sendBookingEmails } from "@/lib/email";

export async function createBookingAction(formData: FormData) {
  const booking = await createBooking({
    serviceSlug: String(formData.get("serviceSlug") || ""),
    slotId: String(formData.get("slotId") || ""),
    kundin: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    telefon: String(formData.get("telefon") || ""),
    notiz: String(formData.get("notiz") || "")
  });

  revalidatePath("/admin");
  revalidatePath("/buchen");

  try {
    await sendBookingEmails(booking);
  } catch (error) {
    console.error("Mailversand fehlgeschlagen:", error);
    redirect("/danke?mail=fehler");
  }

  redirect("/danke");
}

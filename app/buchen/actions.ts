"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBooking } from "@/lib/store";
import { sendBookingEmails } from "@/lib/email";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Der Mailversand hat zu lange gedauert.")), timeoutMs)
    )
  ]);
}

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
    await withTimeout(sendBookingEmails(booking), 8000);
  } catch (error) {
    console.error("Mailversand fehlgeschlagen:", error);
    redirect("/danke?mail=fehler");
  }

  redirect("/danke");
}

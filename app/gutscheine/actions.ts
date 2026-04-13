"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVoucherOrder } from "@/lib/store";
import { createVoucherPdf } from "@/lib/voucher-pdf";
import { sendVoucherEmails } from "@/lib/email";

export async function createVoucherAction(formData: FormData) {
  const voucher = await createVoucherOrder({
    typ: String(formData.get("typ") || "wert") as "wert" | "behandlung",
    wertEuro: formData.get("wertEuro") ? Number(formData.get("wertEuro")) : null,
    leistungSlug: String(formData.get("leistungSlug") || "") || null,
    beschenktePerson: String(formData.get("beschenktePerson") || ""),
    schenkerName: "",
    bestellerName: String(formData.get("bestellerName") || ""),
    bestellerEmail: String(formData.get("bestellerEmail") || ""),
    widmung: String(formData.get("widmung") || "")
  });

  const pdfBytes = await createVoucherPdf(voucher);

  revalidatePath("/admin");
  revalidatePath("/gutscheine");

  try {
    await sendVoucherEmails(voucher, pdfBytes);
  } catch (error) {
    console.error("Gutschein-Mailversand fehlgeschlagen:", error);
    redirect("/gutscheine/danke?mail=fehler");
  }

  redirect("/gutscheine/danke");
}

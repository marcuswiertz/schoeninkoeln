import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createVoucherOrder } from "@/lib/store";
import { createVoucherPdf } from "@/lib/voucher-pdf";
import { sendVoucherEmails } from "@/lib/email";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
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
      return NextResponse.redirect(new URL("/gutscheine/danke?mail=fehler", request.url), 303);
    }

    return NextResponse.redirect(new URL("/gutscheine/danke", request.url), 303);
  } catch (error) {
    const params = new URLSearchParams();
    params.set("fehler", error instanceof Error ? error.message : "Die Gutscheinbestellung konnte nicht gespeichert werden.");
    return NextResponse.redirect(new URL(`/gutscheine?${params.toString()}`, request.url), 303);
  }
}

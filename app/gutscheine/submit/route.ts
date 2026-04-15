import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createVoucherOrder } from "@/lib/store";
import { createVoucherPdf } from "@/lib/voucher-pdf";
import { sendVoucherEmails } from "@/lib/email";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Der Mailversand hat zu lange gedauert.")), timeoutMs)
    )
  ]);
}

function createPublicUrl(request: Request, path: string) {
  const configuredUrl = process.env.PUBLIC_APP_URL?.trim();
  const originHeader = request.headers.get("origin");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");

  if (configuredUrl) {
    return new URL(path, configuredUrl);
  }

  if (originHeader) {
    return new URL(path, originHeader);
  }

  if (forwardedProto && forwardedHost) {
    return new URL(path, `${forwardedProto}://${forwardedHost}`);
  }

  if (hostHeader) {
    const protocol = hostHeader.includes("localhost") ? "http" : "https";
    return new URL(path, `${protocol}://${hostHeader}`);
  }

  return new URL(path, request.url);
}

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
      await withTimeout(sendVoucherEmails(voucher, pdfBytes), 8000);
    } catch (error) {
      console.error("Gutschein-Mailversand fehlgeschlagen:", error);
      return NextResponse.redirect(createPublicUrl(request, "/gutscheine/danke?mail=fehler"), 303);
    }

    return NextResponse.redirect(createPublicUrl(request, "/gutscheine/danke"), 303);
  } catch (error) {
    const params = new URLSearchParams();
    params.set("fehler", error instanceof Error ? error.message : "Die Gutscheinbestellung konnte nicht gespeichert werden.");
    return NextResponse.redirect(createPublicUrl(request, `/gutscheine?${params.toString()}`), 303);
  }
}

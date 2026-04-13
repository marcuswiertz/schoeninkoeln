"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, getAdminPassword } from "@/lib/auth";
import { verifyEmailConfiguration } from "@/lib/email";
import { updateVoucherStatus, type VoucherStatus } from "@/lib/store";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (password !== getAdminPassword()) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/");
}

function formatMailTestError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Die Verbindung zum Mailserver konnte nicht aufgebaut werden.";
}

export async function testEmailAction() {
  try {
    await verifyEmailConfiguration();
  } catch (error) {
    console.error("SMTP-Test fehlgeschlagen:", error);
    redirect(`/admin?mailtest=fehler&mailmsg=${encodeURIComponent(formatMailTestError(error))}`);
  }

  redirect("/admin?mailtest=ok");
}

export async function updateVoucherStatusAction(formData: FormData) {
  const voucherId = String(formData.get("voucherId") || "");
  const status = String(formData.get("status") || "") as VoucherStatus;

  await updateVoucherStatus(voucherId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/gutscheine");
  redirect("/admin/gutscheine");
}

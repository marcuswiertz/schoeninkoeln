import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "schoeninkoeln_admin";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin";
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "ok";
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

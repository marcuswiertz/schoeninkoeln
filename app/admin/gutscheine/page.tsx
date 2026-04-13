import { requireAdmin } from "@/lib/auth";
import { getVoucherOrders, type VoucherOrder } from "@/lib/store";
import { AdminVouchers } from "@/components/admin-vouchers";
import { AdminNav } from "@/components/admin-nav";

type Props = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function AdminGutscheinePage({ searchParams }: Props) {
  await requireAdmin();

  const params = (await searchParams) || {};
  const status = (params.status || "alle") as VoucherOrder["status"] | "alle";
  const allVouchers = await getVoucherOrders();
  const vouchers = status === "alle" ? allVouchers : allVouchers.filter((voucher) => voucher.status === status);

  return (
    <main className="section">
      <h1 className="admin-title">Gutscheinverwaltung</h1>
      <AdminNav current="gutscheine" />
      <AdminVouchers vouchers={vouchers} activeStatus={status} />
    </main>
  );
}

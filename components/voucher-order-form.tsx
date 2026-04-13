import { VoucherOrderFormClient } from "@/components/voucher-order-form-client";
import { getServicesSafe } from "@/lib/service-repository";

export async function VoucherOrderForm() {
  const services = await getServicesSafe();
  return <VoucherOrderFormClient services={services} />;
}

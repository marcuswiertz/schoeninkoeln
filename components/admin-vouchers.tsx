import Link from "next/link";
import type { VoucherOrder } from "@/lib/store";
import { updateVoucherStatusAction } from "@/app/admin/actions";

type Props = {
  vouchers: VoucherOrder[];
  activeStatus: VoucherOrder["status"] | "alle";
};

const labelByStatus: Record<VoucherOrder["status"], string> = {
  bestellt: "Bestellt",
  bezahlt: "Bezahlt",
  eingelöst: "Eingelöst",
  storniert: "Storniert"
};

const filterOptions: Array<{ value: VoucherOrder["status"] | "alle"; label: string }> = [
  { value: "alle", label: "Alle" },
  { value: "bestellt", label: "Bestellt" },
  { value: "bezahlt", label: "Bezahlt" },
  { value: "eingelöst", label: "Eingelöst" },
  { value: "storniert", label: "Storniert" }
];

export function AdminVouchers({ vouchers, activeStatus }: Props) {
  return (
    <section className="voucher-admin">
      <div className="section-banner">
        <div className="eyebrow">Gutscheine</div>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>
          Gutscheinbestellungen
        </h2>
      </div>

      <div className="admin-filter-list">
        {filterOptions.map((option) => (
          <Link
            key={option.value}
            className={activeStatus === option.value ? "service-chip is-active" : "service-chip"}
            href={option.value === "alle" ? "/admin/gutscheine" : `/admin/gutscheine?status=${option.value}`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="voucher-admin-list">
        {vouchers.length ? (
          vouchers.map((voucher) => (
            <article className="voucher-admin-card" key={voucher.id}>
              <div className="voucher-admin-head">
                <div>
                  <strong>{voucher.nummer}</strong>
                  <p className="muted">
                    Für {voucher.beschenktePerson}
                    {voucher.typ === "wert" && voucher.wertEuro ? ` · ${voucher.wertEuro} €` : ""}
                    {voucher.typ === "behandlung" && voucher.leistungName ? ` · ${voucher.leistungName}` : ""}
                  </p>
                </div>
                <span className={`voucher-status voucher-status-${voucher.status}`}>{labelByStatus[voucher.status]}</span>
              </div>
              <p className="muted">
                Besteller: {voucher.bestellerName} · {voucher.bestellerEmail}
              </p>
              {voucher.widmung ? <p className="muted">Widmung: {voucher.widmung}</p> : null}
              <div className="voucher-status-actions">
                {(["bestellt", "bezahlt", "eingelöst", "storniert"] as const).map((status) => (
                  <form action={updateVoucherStatusAction} key={status}>
                    <input type="hidden" name="voucherId" value={voucher.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className="button-secondary" type="submit">
                      {labelByStatus[status]}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))
        ) : (
          <article className="voucher-admin-card">
            <p className="muted">Für diesen Status sind aktuell keine Gutscheine vorhanden.</p>
          </article>
        )}
      </div>
    </section>
  );
}

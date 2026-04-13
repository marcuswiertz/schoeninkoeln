import type { VoucherOrder } from "@/lib/store";

type Props = {
  order: VoucherOrder;
};

export function VoucherPreview({ order }: Props) {
  const giftText =
    order.typ === "wert" && order.wertEuro
      ? `${order.wertEuro.toFixed(2).replace(".", ",")} €`
      : order.leistungName || "";
  const hasMessage = Boolean(order.widmung || order.schenkerName);

  return (
    <section className="voucher-preview-shell">
      <div className="voucher-preview">
        <div className="voucher-preview-topband" />
        <img className="voucher-preview-logo-corner" src="/logo-neu-tight.png" alt="Schön in Köln" />

        <div className="voucher-preview-head">
          <h2>Gutschein</h2>
        </div>

        <div className="voucher-preview-label">über</div>
        <div className="voucher-preview-gift">{giftText}</div>

        <div className="voucher-preview-label">für</div>
        <div className="voucher-preview-name">{order.beschenktePerson}</div>

        {hasMessage ? (
          <div className="voucher-preview-message">
            {order.widmung ? <p>{order.widmung}</p> : null}
            {order.schenkerName ? <p>{order.schenkerName}</p> : null}
          </div>
        ) : null}

        <div className="voucher-preview-footer">
          <div className="voucher-preview-signature">
            <img className="voucher-preview-sign-image" src="/unterschrift-silke.jpg" alt="Silke Wiertz" />
            <img className="voucher-preview-script" src="/1000b.png" alt="Schön in Köln Schriftzug" />
          </div>

          <div className="voucher-preview-sideinfo">
            <div className="voucher-preview-meta voucher-preview-meta-bottom">
              <div>{order.nummer}</div>
              <div>
                {new Intl.DateTimeFormat("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                }).format(new Date(order.createdAt))}
              </div>
            </div>
            <div className="voucher-preview-contact">
              <div className="voucher-preview-contact-line" />
              <p>Terminabsprache: 0172/8903667 * info@schoeninkoeln.de.</p>
              <p>Bitte geben Sie bei der Terminvereinbarung Ihre Gutscheinnummer an.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

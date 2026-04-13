import Link from "next/link";

type Props = {
  current: "kalender" | "gutscheine";
};

export function AdminNav({ current }: Props) {
  return (
    <nav className="admin-nav">
      <Link className={current === "kalender" ? "service-chip is-active" : "service-chip"} href="/admin">
        Kalender
      </Link>
      <Link className={current === "gutscheine" ? "service-chip is-active" : "service-chip"} href="/admin/gutscheine">
        Gutscheine
      </Link>
    </nav>
  );
}

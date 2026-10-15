"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountNav({ intros, unread, voter }: { intros: number; unread: number; voter?: boolean }) {
  const p = usePathname();
  const items = [
    { href: "/account", label: "Overview", exact: true },
    { href: "/account/bookings", label: "Bookings & payments" },
    { href: "/account/profile", label: "My profile" },
    { href: "/account/members", label: "Members" },
    { href: "/account/intros", label: "Introductions", badge: intros },
    { href: "/account/messages", label: "Messages", badge: unread },
    ...(voter ? [{ href: "/casting/vote", label: "Casting · vote" }] : []),
    { href: "/account/settings", label: "Settings & privacy" },
  ];
  return (
    <nav className="acct__side" aria-label="Account">
      {items.map((i) => {
        const on = i.exact ? p === i.href : p.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {i.label}{i.badge ? <span className="badge">{i.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

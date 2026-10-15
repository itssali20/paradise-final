"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const I = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  cal: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  ticket: "M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4z M10 5v14",
  gift: "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0",
  inbox: "M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h5l1 3h6l1-3h5",
  users: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6",
  log: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  heart: "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z",
};

const GROUPS = [
  { g: null, items: [{ href: "/admin", label: "Dashboard", icon: I.home, exact: true }] },
  { g: "Reservations", items: [
    { href: "/admin/events", label: "Events & rooms", icon: I.cal },
    { href: "/admin/bookings", label: "Bookings & payments", icon: I.ticket },
    { href: "/admin/bookings/new", label: "Complimentary / manual", icon: I.gift, exact: true },
  ] },
  { g: "People", items: [
    { href: "/admin/applications", label: "Applications", icon: I.inbox, key: "applications" },
    { href: "/admin/casting", label: "Casting & votes", icon: I.heart, key: "casting" },
    { href: "/admin/members", label: "Members", icon: I.users, key: "members" },
    { href: "/admin/subscribers", label: "Subscribers", icon: I.mail },
  ] },
  { g: "System", items: [{ href: "/admin/audit", label: "Activity log", icon: I.log }] },
];

export default function AdminNav({ counts }: { counts: Record<string, number> }) {
  const p = usePathname();
  const isOn = (href: string, exact?: boolean) => {
    if (exact) return p === href;
    if (href === "/admin/bookings" && p.startsWith("/admin/bookings/new")) return false;
    return p === href || p.startsWith(href + "/");
  };
  return (
    <nav aria-label="Admin">
      {GROUPS.map((g, gi) => (
        <div key={gi}>
          {g.g && <div className="grp">{g.g}</div>}
          {g.items.map((i) => {
            const n = "key" in i && i.key ? counts[i.key] : 0;
            return (
              <Link key={i.href} href={i.href} className={`lnk${isOn(i.href, "exact" in i && i.exact) ? " on" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={i.icon} /></svg>
                {i.label}
                {n > 0 && <span className="count">{n}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

import { NextResponse } from "next/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, s } from "@/db";
import { getSession } from "@/lib/auth";
import { getDestination } from "@/content/destinations";

export const dynamic = "force-dynamic";

const csv = (rows: (string | number | null | undefined)[][]) =>
  rows.map((r) => r.map((v) => { const t = v == null ? "" : String(v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; }).join(",")).join("\n");

/** CSV exports for the admin: guests, bookings, applications, members, subscribers. */
export async function GET(req: Request) {
  const sess = await getSession();
  if (!sess || sess.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const [me] = await db.select().from(s.users).where(eq(s.users.id, sess.uid));
  if (!me || me.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const u = new URL(req.url);
  const type = u.searchParams.get("type");
  const event = u.searchParams.get("event");
  let rows: (string | number | null | undefined)[][] = [];

  if (type === "guests" || type === "bookings") {
    const list = await db.query.bookings.findMany({
      where: and(event ? eq(s.bookings.eventId, event) : undefined, type === "guests" ? inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID"]) : undefined),
      with: { event: true, roomType: true, room: true, guests: true }, orderBy: [asc(s.bookings.createdAt)],
    });
    if (type === "guests") {
      rows = [["Guest", "Gender", "Email", "Country", "Booking", "Event", "Room type", "Room", "Status", "Phone"]];
      for (const b of list) for (const g of b.guests) rows.push([g.name, g.gender, g.email, g.country, b.ref, getDestination(b.event.destinationSlug)?.name, b.roomType.name, b.room?.label, b.status, b.contactPhone]);
    } else {
      rows = [["Ref", "Status", "Package", "Plan", "Lead", "Email", "Phone", "Country", "Event", "Start", "Room type", "Room", "Total", "Paid", "Refunded", "Currency", "Created"]];
      for (const b of list) rows.push([b.ref, b.status, b.packageType, b.plan, b.contactName, b.contactEmail, b.contactPhone, b.contactCountry, getDestination(b.event.destinationSlug)?.name, b.event.startDate.toISOString().slice(0, 10), b.roomType.name, b.room?.label, b.totalCents / 100, b.paidCents / 100, b.refundedCents / 100, b.currency, b.createdAt.toISOString()]);
    }
  } else if (type === "applications") {
    const t = u.searchParams.get("appType");
    const list = await db.select().from(s.applications).where(t ? eq(s.applications.type, t as "LADY") : undefined).orderBy(desc(s.applications.createdAt));
    rows = [["Type", "Status", "Name", "Email", "Phone", "Country", "Details", "Files", "Received"]];
    for (const a of list) rows.push([a.type, a.status, a.name, a.email, a.phone, a.country, JSON.stringify(a.data), a.files.join(" "), a.createdAt.toISOString()]);
  } else if (type === "members") {
    const list = await db.select().from(s.users).orderBy(desc(s.users.createdAt));
    rows = [["Name", "Email", "Gender", "Country", "Phone", "Role", "Suspended", "Joined"]];
    for (const m of list) rows.push([m.name, m.email, m.gender, m.country, m.phone, m.role, m.suspended ? "yes" : "", m.createdAt.toISOString()]);
  } else if (type === "subscribers") {
    const list = await db.select().from(s.subscribers).orderBy(desc(s.subscribers.createdAt));
    rows = [["Email", "Source", "Date"], ...list.map((x) => [x.email, x.source, x.createdAt.toISOString()])];
  } else {
    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  }
  return new NextResponse("﻿" + csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="paradise-${type}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}

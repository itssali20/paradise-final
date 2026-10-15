import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/events";
import { hasDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDestination } from "@/content/destinations";
import { dateRange } from "@/lib/format";
import { buildSchedule, depositAvailable } from "@/lib/pricing";
import { paymentsMode } from "@/lib/stripe";
import { SITE } from "@/content/site";
import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = { title: "Reserve your room", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BookPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ room?: string; cancelled?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  const d = getDestination(e.destinationSlug);

  if (!hasDb || e.showcase) {
    return (
      <div className="page-pad bg-glow">
        <div className="container center stack" style={{ maxWidth: 760 }}>
          <span className="caps caps--aqua">Reservations</span>
          <h1 className="h2">{d?.name} · {dateRange(e.startDate, e.endDate)}</h1>
          <p className="lead">Online reservations open as soon as this event is confirmed. Call us or register your interest and we&apos;ll hold a room for you.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn--chrome" href={SITE.phoneHref}>{SITE.phone}</a>
            <Link className="btn" href={`/contact?type=general&destination=${e.destinationSlug}`}>Register interest</Link>
          </div>
        </div>
      </div>
    );
  }

  const user = await requireUser();
  const sample = Object.fromEntries(
    e.roomTypes.map((r) => [r.id, {
      FULL: buildSchedule({ totalCents: r.priceCents, event: e, plan: "FULL" }).map((p) => ({ ...p, dueDate: p.dueDate.toISOString() })),
      DEPOSIT: buildSchedule({ totalCents: r.priceCents, event: e, plan: "DEPOSIT" }).map((p) => ({ ...p, dueDate: p.dueDate.toISOString() })),
      DEPOSIT_LADY: buildSchedule({ totalCents: r.priceCents + r.companionCents, event: e, plan: "DEPOSIT" }).map((p) => ({ ...p, dueDate: p.dueDate.toISOString() })),
    }]),
  );

  return (
    <BookingWizard
      event={{
        id: e.id, slug: e.slug, name: d?.name ?? e.title, dates: dateRange(e.startDate, e.endDate), image: e.heroImage || d?.image || null,
        currency: e.currency, depositAvailable: depositAvailable(e), depositLabel: e.depositType === "PERCENT" ? `${e.depositValue}%` : "deposit",
        installments: e.installments, balanceDueDays: e.balanceDueDays, closed: e.status !== "PUBLISHED", menLeft: e.menLeft, womenLeft: e.womenLeft,
      }}
      rooms={e.roomTypes}
      schedules={sample}
      initialRoom={sp.room}
      cancelled={sp.cancelled === "1"}
      mode={paymentsMode()}
      user={{ name: user.name, phone: user.phone ?? "", country: user.country ?? "" }}
    />
  );
}

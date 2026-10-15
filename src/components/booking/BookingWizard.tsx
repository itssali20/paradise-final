"use client";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { startBooking, type BookState } from "@/actions/booking";
import { gsap, useGSAP } from "@/lib/gsap";
import { img } from "@/content/media";
import type { RoomTypeView } from "@/lib/events";

type Sched = { kind: string; amountCents: number; dueDate: string }[];
type Props = {
  event: { id: string; slug: string; name: string; dates: string; image: string | null; currency: string; depositAvailable: boolean; depositLabel: string; installments: number; balanceDueDays: number; closed: boolean; menLeft: number; womenLeft: number };
  rooms: RoomTypeView[];
  schedules: Record<string, { FULL: Sched; DEPOSIT: Sched; DEPOSIT_LADY: Sched }>;
  initialRoom?: string;
  cancelled: boolean;
  mode: "stripe" | "demo" | "manual";
  user: { name: string; phone: string; country: string };
};

const fmt = (c: number, cur: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase(), maximumFractionDigits: 0 }).format(c / 100);

/** Four-step reservation: room → guests → payment plan → review & pay. */
export default function BookingWizard({ event, rooms, schedules, initialRoom, cancelled, mode, user }: Props) {
  const firstAvail = rooms.find((r) => r.available > 0)?.id ?? rooms[0]?.id;
  const [step, setStep] = useState(0);
  const [roomId, setRoomId] = useState(initialRoom && rooms.some((r) => r.id === initialRoom && r.available > 0) ? initialRoom : firstAvail);
  const [withLady, setWithLady] = useState(false);
  const [plan, setPlan] = useState<"FULL" | "DEPOSIT">(event.depositAvailable ? "DEPOSIT" : "FULL");
  const [state, action, pending] = useActionState<BookState, FormData>(startBooking, { ok: false, message: "" });
  const root = useRef<HTMLDivElement>(null);

  const room = rooms.find((r) => r.id === roomId);
  const total = room ? room.priceCents + (withLady ? room.companionCents : 0) : 0;
  const schedule = useMemo(() => {
    if (!room) return [];
    if (plan === "FULL") return [{ kind: "FULL", amountCents: total, dueDate: new Date().toISOString() }];
    const base = withLady ? schedules[room.id].DEPOSIT_LADY : schedules[room.id].DEPOSIT;
    return base;
  }, [room, plan, total, withLady, schedules]);

  useGSAP(() => {
    gsap.fromTo(".wz-step", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
  }, { scope: root, dependencies: [step] });

  const [err, setErr] = useState("");
  const next = () => {
    setErr("");
    if (step === 1) {
      const f = root.current!.querySelector("form")!;
      const val = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? "";
      if (val("name").length < 2 || val("phone").length < 5 || val("country").length < 2) return setErr("Please add your name, phone and country.");
      if (withLady && val("ladyName").length < 2) return setErr("Please add the lady's name.");
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (event.closed) {
    return (
      <div className="page-pad center stack">
        <h1 className="h2">{event.name} is fully booked</h1>
        <p className="lead">Join the waitlist and we&apos;ll call you if a room opens up.</p>
        <Link className="btn btn--chrome" href="/contact?type=general">Join the waitlist</Link>
      </div>
    );
  }

  return (
    <div className="book" ref={root}>
      <form action={action}>
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="roomTypeId" value={roomId ?? ""} />
        <input type="hidden" name="withLady" value={withLady ? "1" : "0"} />
        <input type="hidden" name="plan" value={plan} />

        <span className="caps caps--aqua">Reservation · step {step + 1} of 4</span>
        <h1 className="h2" style={{ margin: "14px 0 26px" }}>{["Choose your room", "Who's travelling", "How would you like to pay?", "Review & pay"][step]}</h1>
        <div className="steps-bar" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} className={i <= step ? "on" : ""} />)}</div>
        {cancelled && step === 0 && <p className="notice" style={{ marginBottom: 20 }}>Checkout was cancelled — your room was not charged. You can try again below.</p>}

        <div className="wz-step" style={{ display: step === 0 ? "block" : "none" }}>
          <div className="rpick" role="radiogroup" aria-label="Room type">
            {rooms.map((r) => (
              <label key={r.id} className={r.available <= 0 ? "is-off" : ""}>
                <input type="radio" name="_room" value={r.id} checked={roomId === r.id} disabled={r.available <= 0} onChange={() => setRoomId(r.id)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(r.image, 400)} alt="" />
                <div>
                  <b>{r.name}</b>
                  <span className="muted" style={{ fontSize: ".88rem" }}>{r.features.slice(0, 3).join(" · ")}</span>
                  <div style={{ marginTop: 6 }}><span className={r.available <= 5 ? "chip chip--hot" : "chip"}>{r.available <= 0 ? "Sold out" : `${r.available} left`}</span></div>
                </div>
                <div className="price"><b className="chrome-static">{fmt(r.priceCents, event.currency)}</b><span className="fine" style={{ display: "block" }}>7 days · 6 nights</span></div>
              </label>
            ))}
          </div>
        </div>

        <div className="wz-step" style={{ display: step === 1 ? "block" : "none" }}>
          <div className="seg" style={{ marginBottom: 24 }}>
            <label><input type="radio" name="_pkg" checked={!withLady} onChange={() => setWithLady(false)} /><b>Gentleman</b><span>Just me — meet 100 fascinating women.</span></label>
            <label style={room && room.maxGuests < 2 ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
              <input type="radio" name="_pkg" checked={withLady} onChange={() => setWithLady(true)} disabled={!room || room.maxGuests < 2 || event.womenLeft <= 0} />
              <b>Gentleman & Lady</b><span>Invite the lady you&apos;ve been talking to · +{room ? fmt(room.companionCents, event.currency) : ""}</span>
            </label>
          </div>
          <div className="form">
            <div className="f"><label htmlFor="b-name">Your full name *</label><input id="b-name" name="name" defaultValue={user.name} /></div>
            <div className="f"><label htmlFor="b-phone">Phone / WhatsApp *</label><input id="b-phone" name="phone" type="tel" defaultValue={user.phone} /></div>
            <div className="f"><label htmlFor="b-country">Country *</label><input id="b-country" name="country" defaultValue={user.country} /></div>
            {withLady && (
              <>
                <div className="f"><label htmlFor="b-lname">Her full name *</label><input id="b-lname" name="ladyName" /></div>
                <div className="f"><label htmlFor="b-lemail">Her email</label><input id="b-lemail" name="ladyEmail" type="email" /></div>
                <div className="f"><label htmlFor="b-lcountry">Her country</label><input id="b-lcountry" name="ladyCountry" /></div>
                <p className="fine f--full">We coordinate her stay and contact her to confirm travel details. Airfare is arranged separately unless stated in your confirmation.</p>
              </>
            )}
            <div className="f f--full"><label htmlFor="b-notes">Anything we should know?</label><textarea id="b-notes" name="notes" placeholder="Arrival plans, room preferences, celebrations…" /></div>
          </div>
        </div>

        <div className="wz-step" style={{ display: step === 2 ? "block" : "none" }}>
          <div className="seg">
            <label style={!event.depositAvailable ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
              <input type="radio" name="_plan" checked={plan === "DEPOSIT"} onChange={() => setPlan("DEPOSIT")} disabled={!event.depositAvailable} />
              <b>Deposit + instalments</b>
              <span>{event.depositLabel} today, then {event.installments} automatic payment{event.installments > 1 ? "s" : ""}. Final payment {event.balanceDueDays} days before arrival.</span>
            </label>
            <label>
              <input type="radio" name="_plan" checked={plan === "FULL"} onChange={() => setPlan("FULL")} />
              <b>Pay in full</b><span>One payment today. Done.</span>
            </label>
          </div>
          {!event.depositAvailable && <p className="fine" style={{ marginTop: 12 }}>This event is too close for instalments — full payment only.</p>}
          <div className="panel" style={{ marginTop: 24 }}>
            <span className="caps caps--dim">Your payment schedule</span>
            <div className="ptl">
              {schedule.map((p, i) => (
                <div key={i} className={i === 0 ? "is-paid" : ""}>
                  <b>{fmt(p.amountCents, event.currency)}</b>
                  <span>{i === 0 ? "Today" : new Date(p.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              ))}
            </div>
            {plan === "DEPOSIT" && <p className="fine" style={{ marginTop: 18 }}>Your card is saved securely by Stripe and charged automatically on each date. You&apos;ll get a reminder 7 days before every payment and can pay early from your account.</p>}
          </div>
        </div>

        <div className="wz-step" style={{ display: step === 3 ? "block" : "none" }}>
          <div className="panel stack-s">
            <div className="sumrow"><span>Event</span><b>{event.name} · {event.dates}</b></div>
            <div className="sumrow"><span>Room</span><b>{room?.name}</b></div>
            <div className="sumrow"><span>Package</span><b>{withLady ? "Gentleman & Lady" : "Gentleman"}</b></div>
            <div className="sumrow"><span>Plan</span><b>{plan === "FULL" ? "Pay in full" : `Deposit + ${event.installments} instalment${event.installments > 1 ? "s" : ""}`}</b></div>
            <div className="sumrow"><span>Due today</span><b className="aqua-text">{fmt(schedule[0]?.amountCents ?? 0, event.currency)}</b></div>
          </div>
          <label className="check" style={{ marginTop: 22 }}>
            <input type="checkbox" name="terms" required /> I accept the <Link href="/legal/terms" target="_blank">terms</Link> and the <Link href="/legal/cancellation" target="_blank">cancellation & refund policy</Link>, and confirm I am 18 or older.
          </label>
          {mode === "manual" && <p className="notice" style={{ marginTop: 18 }}>Online card payments are being activated. Submitting will hold your room for 48 hours and our reservations team will contact you to complete payment.</p>}
          {mode === "demo" && <p className="notice" style={{ marginTop: 18 }}>Demo mode: payment will be simulated.</p>}
        </div>

        {(err || state.message) && <p className="notice notice--warn" role="alert" style={{ marginTop: 20 }}>{err || state.message}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
          {step > 0 && <button type="button" className="btn" onClick={back}>Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn--chrome" onClick={next} disabled={!room || room.available <= 0}>Continue</button>
          ) : (
            <button className="btn btn--aqua" disabled={pending}>{pending ? "Securing your room…" : mode === "manual" ? "Hold my room" : `Pay ${fmt(schedule[0]?.amountCents ?? 0, event.currency)} securely`}</button>
          )}
        </div>
        <p className="fine" style={{ marginTop: 18 }}>Rooms are held for you during checkout so nobody else can take them. Payments are processed by Stripe.</p>
      </form>

      <aside className="book__sum">
        <div className="frame">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img(room?.image || event.image, 900)} alt="" /></div>
        <div className="book__sum-b">
          <span className="caps caps--aqua">{event.dates}</span>
          <h2 className="h3">{event.name}</h2>
          <div className="sumrow"><span>{room?.name}</span><b>{room ? fmt(room.priceCents, event.currency) : "—"}</b></div>
          {withLady && room && <div className="sumrow"><span>Lady companion</span><b>{fmt(room.companionCents, event.currency)}</b></div>}
          <div className="sumrow"><span>7 days · 6 nights · all events</span><b>Included</b></div>
          <div className="sumtotal"><span className="caps caps--dim">Total</span><b className="chrome-static">{fmt(total, event.currency)}</b></div>
          <div className="sumrow"><span>Due today</span><b>{fmt(schedule[0]?.amountCents ?? 0, event.currency)}</b></div>
        </div>
      </aside>
    </div>
  );
}

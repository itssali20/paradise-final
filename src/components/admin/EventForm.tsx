import { DESTINATIONS } from "@/content/destinations";
import type { Event } from "@/db/schema";

const d = (x?: Date | null) => (x ? new Date(x).toISOString().slice(0, 10) : "");

/** Server-rendered event form used for create and edit. */
export default function EventForm({ e, action, submit }: { e?: Event; action: (fd: FormData) => Promise<void>; submit: string }) {
  const policy = e?.cancellationPolicy ?? [
    { daysBefore: 90, refundPercent: 90 }, { daysBefore: 60, refundPercent: 50 }, { daysBefore: 30, refundPercent: 25 }, { daysBefore: 0, refundPercent: 0 },
  ];
  return (
    <form className="form form--card" action={action}>
      {e && <input type="hidden" name="id" value={e.id} />}
      <div className="f"><label htmlFor="e-dest">Destination *</label>
        <select id="e-dest" name="destinationSlug" defaultValue={e?.destinationSlug ?? "cancun"} required>
          {DESTINATIONS.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </select>
      </div>
      <div className="f"><label htmlFor="e-status">Status</label>
        <select id="e-status" name="status" defaultValue={e?.status ?? "DRAFT"}>
          {["DRAFT", "PUBLISHED", "SOLD_OUT", "CLOSED", "CANCELLED"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <span className="hint">Only PUBLISHED events accept reservations. DRAFT is hidden from the site.</span>
      </div>
      <div className="f f--full"><label htmlFor="e-title">Title *</label><input id="e-title" name="title" defaultValue={e?.title ?? "Paradise "} required /></div>
      <div className="f"><label htmlFor="e-resort">Resort name *</label><input id="e-resort" name="resortName" defaultValue={e?.resortName ?? ""} required placeholder="Shown publicly — e.g. 'Riviera Maya resort · announced to applicants'" /></div>
      <div className="f"><label htmlFor="e-loc">Location *</label><input id="e-loc" name="location" defaultValue={e?.location ?? ""} required placeholder="Mexico · Caribbean" /></div>
      <div className="f"><label htmlFor="e-start">Arrival *</label><input id="e-start" name="startDate" type="date" defaultValue={d(e?.startDate)} required /></div>
      <div className="f"><label htmlFor="e-end">Departure *</label><input id="e-end" name="endDate" type="date" defaultValue={d(e?.endDate)} required /><span className="hint">7 days / 6 nights = arrival + 6.</span></div>
      <div className="f f--full"><label htmlFor="e-sum">Resort description</label><textarea id="e-sum" name="resortSummary" defaultValue={e?.resortSummary ?? ""} /></div>
      <div className="f f--full"><label htmlFor="e-img">Hero image (URL, /media/… or un:&lt;unsplash id&gt;)</label><input id="e-img" name="heroImage" defaultValue={e?.heroImage ?? ""} placeholder="Defaults to the destination photo" /></div>
      <div className="f"><label htmlFor="e-men">Gentlemen capacity</label><input id="e-men" name="menCapacity" type="number" min={0} defaultValue={e?.menCapacity ?? 100} /></div>
      <div className="f"><label htmlFor="e-women">Ladies capacity</label><input id="e-women" name="womenCapacity" type="number" min={0} defaultValue={e?.womenCapacity ?? 100} /></div>

      <div className="f f--full"><span className="label" style={{ color: "var(--aqua)" }}>Payments</span></div>
      <div className="f"><label htmlFor="e-cur">Currency</label><select id="e-cur" name="currency" defaultValue={e?.currency ?? "usd"}>{["usd", "eur", "gbp", "cad", "mxn"].map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select></div>
      <div className="f"><label htmlFor="e-dt">Deposit type</label><select id="e-dt" name="depositType" defaultValue={e?.depositType ?? "PERCENT"}><option value="PERCENT">Percent of total</option><option value="FIXED">Fixed amount</option></select></div>
      <div className="f"><label htmlFor="e-dv">Deposit (percent, or amount for fixed)</label><input id="e-dv" name="depositValue" type="number" step="0.01" min={0} defaultValue={e ? (e.depositType === "FIXED" ? e.depositValue / 100 : e.depositValue) : 25} /></div>
      <div className="f"><label htmlFor="e-inst">Balance instalments</label><input id="e-inst" name="installments" type="number" min={1} max={12} defaultValue={e?.installments ?? 2} /></div>
      <div className="f"><label htmlFor="e-due">Final payment due (days before arrival)</label><input id="e-due" name="balanceDueDays" type="number" min={0} defaultValue={e?.balanceDueDays ?? 45} /></div>
      <div className="f"><label htmlFor="e-hold">Checkout hold (minutes)</label><input id="e-hold" name="holdMinutes" type="number" min={10} defaultValue={e?.holdMinutes ?? 15} /></div>

      <div className="f f--full">
        <span className="label" style={{ color: "var(--aqua)" }}>Cancellation policy (refund % of amounts paid)</span>
        <div style={{ display: "grid", gap: 8 }}>
          {[...policy, { daysBefore: NaN, refundPercent: NaN }].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input name="policyDays" type="number" min={0} defaultValue={Number.isNaN(t.daysBefore) ? "" : t.daysBefore} placeholder="days" style={{ maxWidth: 110 }} aria-label="Days before arrival" />
              <span className="muted">or more days before arrival →</span>
              <input name="policyPct" type="number" min={0} max={100} defaultValue={Number.isNaN(t.refundPercent) ? "" : t.refundPercent} placeholder="%" style={{ maxWidth: 90 }} aria-label="Refund percent" />
              <span className="muted">% refunded</span>
            </div>
          ))}
        </div>
      </div>
      {!e && <label className="check"><input type="checkbox" name="defaultTiers" defaultChecked /> Create the four default room tiers (Luxury Room, Ocean-View Room, Ocean-View Suite, Paradise Villa) — you can edit prices and inventory next.</label>}
      <div className="f--full"><button className="btn btn--chrome">{submit}</button></div>
    </form>
  );
}

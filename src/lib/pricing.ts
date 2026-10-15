// Pure pricing / schedule / refund maths (shared by server, admin and UI).

type EventTerms = {
  depositType: "PERCENT" | "FIXED";
  depositValue: number;
  installments: number;
  balanceDueDays: number;
  startDate: Date | string;
};

export type ScheduledPayment = { kind: "FULL" | "DEPOSIT" | "INSTALLMENT"; sequence: number; amountCents: number; dueDate: Date };

const DAY = 86400000;

export function finalDueDate(e: EventTerms) {
  return new Date(new Date(e.startDate).getTime() - e.balanceDueDays * DAY);
}

/** A deposit plan only makes sense if the final payment date is at least two weeks away. */
export function depositAvailable(e: EventTerms, now = new Date()) {
  return finalDueDate(e).getTime() - now.getTime() > 14 * DAY;
}

export function depositAmount(totalCents: number, e: EventTerms) {
  const d = e.depositType === "PERCENT" ? Math.round((totalCents * e.depositValue) / 100) : e.depositValue;
  return Math.min(totalCents, Math.max(100, d));
}

export function buildSchedule({ totalCents, event, plan, now = new Date() }: { totalCents: number; event: EventTerms; plan: "FULL" | "DEPOSIT"; now?: Date }): ScheduledPayment[] {
  if (plan === "FULL" || !depositAvailable(event, now)) {
    return [{ kind: "FULL", sequence: 0, amountCents: totalCents, dueDate: now }];
  }
  const dep = depositAmount(totalCents, event);
  const rest = totalCents - dep;
  const out: ScheduledPayment[] = [{ kind: "DEPOSIT", sequence: 0, amountCents: dep, dueDate: now }];
  const n = Math.max(1, event.installments);
  if (rest <= 0) return out;
  const final = finalDueDate(event).getTime();
  const span = final - now.getTime();
  const each = Math.floor(rest / n);
  for (let k = 1; k <= n; k++) {
    const amount = k === n ? rest - each * (n - 1) : each;
    const due = new Date(now.getTime() + (span * k) / n);
    due.setUTCHours(12, 0, 0, 0);
    out.push({ kind: "INSTALLMENT", sequence: k, amountCents: amount, dueDate: due });
  }
  return out;
}

export type PolicyTier = { daysBefore: number; refundPercent: number };

export function daysUntil(date: Date | string, now = new Date()) {
  return Math.floor((new Date(date).getTime() - now.getTime()) / DAY);
}

/** Refund percentage that applies today under a tiered policy. */
export function refundPercent(policy: PolicyTier[], startDate: Date | string, now = new Date()) {
  const days = daysUntil(startDate, now);
  const tiers = [...policy].sort((a, b) => b.daysBefore - a.daysBefore);
  for (const t of tiers) if (days >= t.daysBefore) return t.refundPercent;
  return 0;
}

export function priceFor(room: { priceCents: number; companionCents: number }, withLady: boolean) {
  return room.priceCents + (withLady ? room.companionCents : 0);
}

export function money(cents: number, currency = "usd", opts: { decimals?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(cents / 100);
}

export function dateRange(start: Date, end: Date) {
  const s = new Date(start), e = new Date(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  const m = (d: Date) => d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return sameMonth
    ? `${s.getUTCDate()}–${e.getUTCDate()} ${m(s)} ${e.getUTCFullYear()}`
    : `${s.getUTCDate()} ${m(s)} – ${e.getUTCDate()} ${m(e)} ${e.getUTCFullYear()}`;
}

export function fmtDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : { timeZone: "UTC" }),
  });
}

export function monthTag(d: Date) {
  const x = new Date(d);
  return {
    month: x.toLocaleString("en-US", { month: "long", timeZone: "UTC" }),
    short: x.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    year: x.getUTCFullYear(),
  };
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function bookingRef() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "PC-";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) r += a[b % a.length];
  return r;
}

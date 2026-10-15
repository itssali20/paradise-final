export function bookingTone(s: string) {
  return s === "PAID" ? "ok" : s === "DEPOSIT_PAID" ? "info" : s === "CANCELLED" || s === "EXPIRED" ? "bad" : "warn";
}
export function paymentTone(s: string) {
  return s === "PAID" ? "ok" : s === "FAILED" ? "bad" : s === "REFUNDED" || s === "PARTIALLY_REFUNDED" || s === "CANCELLED" ? "" : s === "PENDING" ? "warn" : "info";
}
export const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

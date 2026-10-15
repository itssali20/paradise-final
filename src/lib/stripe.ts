import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key) : null;

/**
 * "stripe" – real payments.
 * "demo"   – PAYMENTS_DEMO=1: payments are simulated as successful (staging / client previews).
 * "manual" – no Stripe key yet: rooms are held 48 h and the team completes payment by phone.
 */
export function paymentsMode(): "stripe" | "demo" | "manual" {
  if (stripe) return "stripe";
  if (process.env.PAYMENTS_DEMO === "1") return "demo";
  return "manual";
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

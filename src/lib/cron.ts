import "server-only";
export function cronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}` || new URL(req.url).searchParams.get("secret") === secret;
}

"use server";
import { z } from "zod";
import { db, hasDb, s } from "@/db";
import { getSession } from "@/lib/auth";
import { uploadFiles } from "@/lib/upload";
import { layout, notifyAdmin, sendEmail } from "@/lib/email";
import { SITE } from "@/content/site";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> };

const emailSchema = z.string().trim().toLowerCase().email();

export async function subscribe(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(fd.get("email"));
  if (!parsed.success) return { ok: false, message: "Please enter a valid email." };
  if (hasDb) {
    await db.insert(s.subscribers).values({ email: parsed.data, source: "footer" }).onConflictDoNothing();
  }
  return { ok: true, message: "You're on the list. Next month's paradise lands in your inbox first." };
}

const TYPES = ["LADY", "COMPETITION", "PARTNER", "SPONSOR", "GENERAL", "MEMBER"] as const;
type AppType = (typeof TYPES)[number];

const LABEL: Record<AppType, string> = {
  LADY: "Ladies application",
  COMPETITION: "Competition entry",
  PARTNER: "Hotel partnership",
  SPONSOR: "Sponsorship",
  GENERAL: "General inquiry",
  MEMBER: "Membership waitlist",
};

const base = z.object({
  type: z.enum(TYPES),
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
});

/** Every public form (ladies, competitions, partners, sponsors, contact, waitlist) lands here. */
export async function submitApplication(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "Thank you." }; // honeypot
  const parsed = base.safeParse({
    type: fd.get("type"),
    name: fd.get("name"),
    email: fd.get("email"),
    phone: fd.get("phone") || undefined,
    country: fd.get("country") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const needsAdult = parsed.data.type === "LADY" || parsed.data.type === "COMPETITION" || parsed.data.type === "MEMBER";
  if (needsAdult && fd.get("adult") !== "on") {
    return { ok: false, message: "Please confirm you are 18 or older.", errors: { adult: "Required" } };
  }
  if (fd.get("consent") !== "on") {
    return { ok: false, message: "Please accept the privacy policy so we can contact you.", errors: { consent: "Required" } };
  }

  const skip = new Set(["type", "name", "email", "phone", "country", "adult", "consent", "website", "files", "idFiles"]);
  const data: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (skip.has(k) || k.startsWith("$ACTION")) continue;
    if (typeof v === "string" && v.trim()) data[k] = v.trim().slice(0, 4000);
  }

  const files = [...fd.getAll("files"), ...fd.getAll("idFiles")].filter((f): f is File => f instanceof File && f.size > 0);
  const up = await uploadFiles(files, `applications/${parsed.data.type.toLowerCase()}`);
  if (up.error && files.length) data.uploadNote = up.error;

  if (!hasDb) {
    console.log("[application:showcase]", parsed.data, data);
    return { ok: true, message: `Thank you, ${parsed.data.name.split(" ")[0]}. Our team will contact you personally.` };
  }

  const sess = await getSession();
  await db.insert(s.applications).values({
    type: parsed.data.type,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    country: parsed.data.country,
    data,
    files: up.urls,
    userId: sess?.uid ?? null,
  });

  const first = parsed.data.name.split(" ")[0];
  await Promise.all([
    sendEmail(
      parsed.data.email,
      `We received your ${LABEL[parsed.data.type].toLowerCase()}`,
      layout(
        `Thank you, ${first}.`,
        `<p>Your ${LABEL[parsed.data.type].toLowerCase()} has reached the Paradise Club team. A coordinator will reply personally, usually within two working days.</p><p>For anything urgent call ${SITE.phone}.</p>`,
        { href: `${SITE.url}/events`, label: "See upcoming events" },
      ),
    ),
    notifyAdmin(
      `New ${LABEL[parsed.data.type]} — ${parsed.data.name}`,
      layout(LABEL[parsed.data.type], `<p>${parsed.data.name} · ${parsed.data.email} · ${parsed.data.country ?? ""}</p><pre style="white-space:pre-wrap">${JSON.stringify(data, null, 2).replace(/</g, "&lt;")}</pre>`, { href: `${SITE.url}/admin/applications`, label: "Open in admin" }),
    ),
  ]);

  return { ok: true, message: `Thank you, ${first}. Our team will contact you personally — usually within two working days.` };
}

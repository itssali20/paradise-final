"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, hasDb, s } from "@/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { getVoter } from "@/lib/casting";
import { uploadFiles, uploadsEnabled } from "@/lib/upload";
import { layout, notifyAdmin, sendEmail } from "@/lib/email";
import { audit } from "@/lib/audit";
import { age } from "@/lib/members";
import { CASTING, PHOTO_SETS, type PhotoSetKey } from "@/content/casting";
import { SITE } from "@/content/site";
import type { CastingPhotoSets } from "@/db/schema";
import type { FormState } from "./public";

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const opt = (max: number) => z.string().trim().max(max).optional();

const entrySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().min(6, "Please enter a phone or WhatsApp number").max(40),
  country: z.string().trim().min(2, "Please enter your country").max(80),
  city: opt(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter your date of birth"),
  heightCm: z.coerce.number().int().min(120).max(220).optional(),
  instagram: opt(200),
  languages: opt(200),
  about: opt(1500),
  event: opt(200),
});

const isImage = (f: File) => f.type.startsWith("image/");

/** Ladies' casting application: details + 3 photos in each outfit. */
export async function submitCasting(_: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "Thank you." }; // honeypot
  const val = (k: string) => (fd.get(k) as string | null)?.trim() || undefined;
  const parsed = entrySchema.safeParse({
    name: val("name"), email: val("email"), phone: val("phone"), country: val("country"), city: val("city"),
    birthDate: val("birthDate"), heightCm: val("heightCm"), instagram: val("instagram"), languages: val("languages"),
    about: val("about"), event: val("event"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const d = parsed.data;
  const born = new Date(d.birthDate + "T12:00:00Z");
  if (Number.isNaN(born.getTime()) || (age(born) ?? 0) < 18) {
    return { ok: false, message: "Paradise Casting is open to ladies 18 or older.", errors: { birthDate: "You must be 18 or older" } };
  }
  if (fd.get("adult") !== "on") return { ok: false, message: "Please confirm you are 18 or older.", errors: { adult: "Required" } };
  if (fd.get("consent") !== "on") return { ok: false, message: "Please accept how we use your photos.", errors: { consent: "Required" } };

  const sets = {} as Record<PhotoSetKey, File[]>;
  const errors: Record<string, string> = {};
  for (const p of PHOTO_SETS) {
    const files = fd.getAll(p.key).filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < CASTING.perSet) errors[p.key] = `Please add ${CASTING.perSet} photos ${p.label.toLowerCase()}`;
    else if (files.length > CASTING.maxPerSet) errors[p.key] = `Up to ${CASTING.maxPerSet} photos ${p.label.toLowerCase()}`;
    else if (!files.every(isImage)) errors[p.key] = "Photos only (JPG, PNG, WebP or HEIC)";
    sets[p.key] = files;
  }
  if (Object.keys(errors).length) return { ok: false, message: `Please add at least ${CASTING.perSet} photos in each outfit.`, errors };

  const first = d.name.split(" ")[0];
  if (!hasDb) {
    console.log("[casting:showcase]", d, Object.fromEntries(PHOTO_SETS.map((p) => [p.key, sets[p.key].length])));
    return { ok: true, message: `Thank you, ${first}. Your application has reached our team.` };
  }

  const dupe = await db.select({ id: s.castingEntries.id }).from(s.castingEntries)
    .where(and(eq(s.castingEntries.email, d.email), inArray(s.castingEntries.status, ["PENDING", "APPROVED", "CHOSEN"]))).limit(1);
  if (dupe.length) return { ok: false, message: "You have already applied with this email. Your coordinator will be in touch.", errors: { email: "Already applied" } };

  if (!uploadsEnabled()) {
    return { ok: false, message: `Photo uploads are being set up. Please try again soon or call us on ${SITE.phone}.` };
  }
  const photos: CastingPhotoSets = { dress: [], sport: [], bikini: [] };
  for (const p of PHOTO_SETS) {
    const up = await uploadFiles(sets[p.key], `casting/${p.key}`, CASTING.maxPerSet);
    photos[p.key] = up.urls;
    if (up.error) {
      await removeBlobs(Object.values(photos).flat());
      return { ok: false, message: up.error, errors: { [p.key]: up.error } };
    }
  }

  const sess = await getSession();
  const [entry] = await db.insert(s.castingEntries).values({
    ...d, birthDate: born, photos, userId: sess?.uid ?? null,
  }).returning({ id: s.castingEntries.id });

  await Promise.all([
    sendEmail(d.email, "Your Paradise Casting application",
      layout(`Thank you, ${esc(first)}.`,
        `<p>Your application and photos have reached the Paradise Club team. A coordinator reviews every application personally and will contact you to verify your identity.</p><p>Once approved, gentlemen members privately share their interest. The ${CASTING.shortlist} applicants with the most interest are shortlisted and personally contacted about a complimentary invitation.</p>`,
        { href: `${SITE.url}/casting`, label: "How casting works" })),
    notifyAdmin(`New casting application — ${d.name}`,
      layout("Casting application", `<p>${esc(d.name)} · ${esc(d.email)} · ${esc(d.country)} · age ${age(born)}</p>`, { href: `${SITE.url}/admin/casting?open=${entry.id}`, label: "Review in admin" })),
  ]);
  revalidatePath("/admin/casting");
  return { ok: true, message: `Thank you, ${first}. A coordinator will review your photos and contact you personally, usually within a few days.` };
}

async function removeBlobs(urls: string[]) {
  if (!urls.length || !uploadsEnabled()) return;
  const { del } = await import("@vercel/blob");
  await del(urls).catch(() => {});
}

export type VoteResult = { ok: boolean; voted: boolean; used: number; message?: string };

/** One heart per gentleman per lady, up to CASTING.voteLimit hearts. Tapping again takes it back. */
export async function toggleCastingVote(entryId: string): Promise<VoteResult> {
  const v = await getVoter();
  if (!v.canVote || !v.user) return { ok: false, voted: false, used: 0, message: v.reason === "signin" ? "Please sign in to vote." : "Voting is for club gentlemen." };
  const uid = v.user.id;
  return db.transaction(async (tx) => {
    // serialise this gentleman's votes so the limit can't be beaten by double-clicking
    await tx.execute(sql`select id from users where id = ${uid} for update`);
    const [entry] = await tx.select({ status: s.castingEntries.status }).from(s.castingEntries).where(eq(s.castingEntries.id, entryId)).limit(1);
    const [{ n }] = await tx.select({ n: count() }).from(s.castingVotes).where(eq(s.castingVotes.voterId, uid));
    if (!entry || (entry.status !== "APPROVED" && entry.status !== "CHOSEN")) return { ok: false, voted: false, used: n, message: "This application is no longer open for votes." };
    const removed = await tx.delete(s.castingVotes).where(and(eq(s.castingVotes.entryId, entryId), eq(s.castingVotes.voterId, uid))).returning();
    if (removed.length) return { ok: true, voted: false, used: n - 1 };
    if (n >= CASTING.voteLimit) return { ok: false, voted: false, used: n, message: `You have used all ${CASTING.voteLimit} votes. Remove one to vote again.` };
    await tx.insert(s.castingVotes).values({ entryId, voterId: uid }).onConflictDoNothing();
    return { ok: true, voted: true, used: n + 1 };
  });
}

// ─────────────────────────── Admin ───────────────────────────
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function moderateCasting(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const action = str(fd, "action");
  const back = str(fd, "back") || "/admin/casting";
  const [e] = await db.select().from(s.castingEntries).where(eq(s.castingEntries.id, id));
  if (!e) redirect(back);

  if (action === "delete") {
    await removeBlobs(Object.values(e.photos).flat());
    await db.delete(s.castingEntries).where(eq(s.castingEntries.id, id));
    await audit(admin.id, "casting.deleted", "casting", id, { email: e.email });
    revalidatePath("/casting/vote");
    redirect("/admin/casting?deleted=1");
  }

  const status =
    action === "approve" || action === "unchoose" ? "APPROVED" as const :
    action === "reject" ? "REJECTED" as const :
    action === "choose" ? "CHOSEN" as const : e.status;
  const notes = fd.has("adminNotes") ? str(fd, "adminNotes") || null : e.adminNotes;
  await db.update(s.castingEntries).set({ status, adminNotes: notes }).where(eq(s.castingEntries.id, id));

  if (fd.get("notify") === "on" && status !== e.status) await notifyEntry(e.email, e.name, status);
  await audit(admin.id, "casting.updated", "casting", id, { from: e.status, to: status });
  revalidatePath("/casting/vote");
  redirect(back);
}

/** Shortlists the highest-voted approved ladies until CASTING.shortlist are chosen. */
export async function chooseTopVoted(fd: FormData) {
  const admin = await requireAdmin();
  const notify = fd.get("notify") === "on";
  const [{ n: chosen }] = await db.select({ n: count() }).from(s.castingEntries).where(eq(s.castingEntries.status, "CHOSEN"));
  const room = CASTING.shortlist - chosen;
  if (room > 0) {
    const votes = count(s.castingVotes.voterId);
    const top = await db.select({ id: s.castingEntries.id, email: s.castingEntries.email, name: s.castingEntries.name, votes })
      .from(s.castingEntries).leftJoin(s.castingVotes, eq(s.castingVotes.entryId, s.castingEntries.id))
      .where(eq(s.castingEntries.status, "APPROVED"))
      .groupBy(s.castingEntries.id).orderBy(desc(votes), s.castingEntries.createdAt).limit(room);
    if (top.length) {
      await db.update(s.castingEntries).set({ status: "CHOSEN" }).where(inArray(s.castingEntries.id, top.map((t) => t.id)));
      if (notify) for (const t of top) await notifyEntry(t.email, t.name, "CHOSEN");
      await audit(admin.id, "casting.shortlisted", "casting", null, { count: top.length });
    }
  }
  revalidatePath("/casting/vote");
  redirect("/admin/casting?status=CHOSEN");
}

async function notifyEntry(email: string, name: string, status: string) {
  const first = esc(name.split(" ")[0]);
  if (status === "APPROVED") {
    await sendEmail(email, "Your casting application is approved",
      layout(`You're in the casting, ${first}.`, "<p>Your photos are approved and now visible to the club gentlemen for voting. We'll let you know as soon as the shortlist is chosen.</p>"));
  } else if (status === "CHOSEN") {
    await sendEmail(email, "You have been chosen for Paradise Club",
      layout(`Congratulations, ${first}!`, "<p>You are on the Paradise Club shortlist. Your coordinator will contact you with your written invitation, setting out exactly what is included.</p>", { href: `${SITE.url}/ladies`, label: "What's included" }));
  } else if (status === "REJECTED") {
    await sendEmail(email, "Your Paradise Casting application",
      layout("Thank you for applying.", "<p>We aren't able to include your application in this casting. You are very welcome to apply again for a future event.</p>"));
  }
}

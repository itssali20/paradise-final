"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, or } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser, hashPassword, verifyPassword, destroySession } from "@/lib/auth";
import { uploadFiles, uploadsEnabled } from "@/lib/upload";
import { layout, notifyAdmin, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { isBlockedEither } from "@/lib/members";

export type MState = { ok: boolean; message: string };

export async function saveProfile(_: MState, fd: FormData): Promise<MState> {
  const u = await requireUser();
  const str = (k: string, max = 400) => (String(fd.get(k) ?? "").trim().slice(0, max) || null);
  const [existing] = await db.select().from(s.profiles).where(eq(s.profiles.userId, u.id));
  let photos = existing?.photos ?? [];
  const remove = new Set(fd.getAll("removePhoto").map(String));
  photos = photos.filter((p) => !remove.has(p));
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length) {
    const up = await uploadFiles(files, `profiles/${u.id}`);
    if (up.error) return { ok: false, message: up.error };
    photos = [...photos, ...up.urls].slice(0, 8);
  }
  const urls = String(fd.get("photoUrls") ?? "").split(/\s+/).filter((x) => /^https:\/\//.test(x));
  if (urls.length) photos = [...photos, ...urls].slice(0, 8);
  const values = {
    displayName: str("displayName", 40) ?? u.name.split(" ")[0],
    headline: str("headline", 120),
    bio: str("bio", 2000),
    city: str("city", 80),
    occupation: str("occupation", 80),
    languages: str("languages", 120),
    interests: String(fd.get("interests") ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12),
    videoUrl: str("videoUrl", 300),
    visible: fd.get("visible") === "on",
    photos,
  };
  const changedContent = !existing || existing.bio !== values.bio || existing.photos.join() !== photos.join();
  if (existing) {
    await db.update(s.profiles).set({ ...values, status: changedContent && existing.status === "REJECTED" ? "PENDING" : existing.status }).where(eq(s.profiles.id, existing.id));
  } else {
    await db.insert(s.profiles).values({ userId: u.id, ...values });
  }
  if (!existing || existing.status !== "APPROVED") await notifyAdmin(`Profile to review · ${values.displayName}`, layout("Profile review", `<p>${u.name} (${u.email}) updated their profile.</p>`, { href: `${siteUrl()}/admin/members`, label: "Review" }));
  revalidatePath("/account/profile");
  return { ok: true, message: uploadsEnabled() || !files.length ? "Profile saved." : "Profile saved (photo uploads need BLOB_READ_WRITE_TOKEN)." };
}

export async function requestIntro(fd: FormData) {
  const u = await requireUser();
  const to = String(fd.get("to"));
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  if (to === u.id || (await isBlockedEither(u.id, to))) redirect("/account/members");
  const [target] = await db.select().from(s.users).where(eq(s.users.id, to));
  if (!target) redirect("/account/members");
  // if they already asked me, accepting is the natural action
  const [reverse] = await db.select().from(s.introductions).where(and(eq(s.introductions.fromId, to), eq(s.introductions.toId, u.id)));
  if (reverse && reverse.status === "PENDING") {
    await acceptIntroInternal(reverse.id, u.id);
    redirect("/account/messages");
  }
  await db.insert(s.introductions).values({ fromId: u.id, toId: to, note }).onConflictDoNothing();
  await sendEmail(target.email, "Someone would like to meet you", layout("You have a new introduction request", `<p>A Paradise Club member would like to be introduced to you${note ? `: <i>“${note.replace(/</g, "&lt;")}”</i>` : "."}</p><p>Messaging opens only if you accept.</p>`, { href: `${siteUrl()}/account/intros`, label: "See request" }));
  revalidatePath(`/account/members/${to}`);
  redirect(`/account/members/${to}?sent=1`);
}

async function acceptIntroInternal(introId: string, me: string) {
  const [i] = await db.select().from(s.introductions).where(and(eq(s.introductions.id, introId), eq(s.introductions.toId, me)));
  if (!i) return null;
  await db.update(s.introductions).set({ status: "ACCEPTED" }).where(eq(s.introductions.id, i.id));
  const [a, b] = [i.fromId, i.toId].sort();
  const [conv] = await db.insert(s.conversations).values({ aId: a, bId: b }).onConflictDoNothing().returning();
  const c = conv ?? (await db.select().from(s.conversations).where(and(eq(s.conversations.aId, a), eq(s.conversations.bId, b))))[0];
  const [from] = await db.select().from(s.users).where(eq(s.users.id, i.fromId));
  if (from) await sendEmail(from.email, "Your introduction was accepted", layout("It's a match.", "<p>Your introduction was accepted. You can now message each other privately.</p>", { href: `${siteUrl()}/account/messages/${c.id}`, label: "Open conversation" }));
  return c;
}

export async function respondIntro(fd: FormData) {
  const u = await requireUser();
  const id = String(fd.get("id"));
  if (fd.get("decision") === "accept") {
    const c = await acceptIntroInternal(id, u.id);
    if (c) redirect(`/account/messages/${c.id}`);
  } else {
    await db.update(s.introductions).set({ status: "DECLINED" }).where(and(eq(s.introductions.id, id), eq(s.introductions.toId, u.id)));
  }
  revalidatePath("/account/intros");
  redirect("/account/intros");
}

export async function sendMessage(conversationId: string, body: string) {
  const u = await requireUser();
  const text = body.trim().slice(0, 4000);
  if (!text) return { ok: false };
  const [c] = await db.select().from(s.conversations).where(and(eq(s.conversations.id, conversationId), or(eq(s.conversations.aId, u.id), eq(s.conversations.bId, u.id))));
  if (!c) return { ok: false };
  const other = c.aId === u.id ? c.bId : c.aId;
  if (await isBlockedEither(u.id, other)) return { ok: false, blocked: true };
  const [m] = await db.insert(s.messages).values({ conversationId: c.id, senderId: u.id, body: text }).returning();
  await db.update(s.conversations).set({ updatedAt: new Date() }).where(eq(s.conversations.id, c.id));
  return { ok: true, message: { id: m.id, body: m.body, senderId: m.senderId, createdAt: m.createdAt.toISOString() } };
}

export async function blockUser(fd: FormData) {
  const u = await requireUser();
  const id = String(fd.get("id"));
  if (id !== u.id) await db.insert(s.blocks).values({ blockerId: u.id, blockedId: id }).onConflictDoNothing();
  await audit(u.id, "member.blocked", "user", id);
  redirect("/account/members?blocked=1");
}

export async function unblockUser(fd: FormData) {
  const u = await requireUser();
  await db.delete(s.blocks).where(and(eq(s.blocks.blockerId, u.id), eq(s.blocks.blockedId, String(fd.get("id")))));
  revalidatePath("/account/settings");
}

export async function reportUser(fd: FormData) {
  const u = await requireUser();
  const id = String(fd.get("id"));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 2000) || "No reason given";
  await db.insert(s.reports).values({ reporterId: u.id, reportedId: id, reason });
  await notifyAdmin("Member reported", layout("A member was reported", `<p>${reason.replace(/</g, "&lt;")}</p>`, { href: `${siteUrl()}/admin/members?tab=reports`, label: "Review" }));
  redirect(`/account/members/${id}?reported=1`);
}

export async function changePassword(_: MState, fd: FormData): Promise<MState> {
  const u = await requireUser();
  if (!(await verifyPassword(String(fd.get("current") ?? ""), u.passwordHash))) return { ok: false, message: "Current password is incorrect." };
  const pw = String(fd.get("password") ?? "");
  if (pw.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
  await db.update(s.users).set({ passwordHash: await hashPassword(pw) }).where(eq(s.users.id, u.id));
  return { ok: true, message: "Password updated." };
}

export async function deleteAccount(fd: FormData) {
  const u = await requireUser();
  if (fd.get("confirm") !== "DELETE") redirect("/account/settings?confirm=1");
  await audit(u.id, "user.deleted", "user", u.id, { email: u.email });
  await db.update(s.bookings).set({ userId: null }).where(eq(s.bookings.userId, u.id));
  await db.update(s.applications).set({ userId: null }).where(eq(s.applications.userId, u.id));
  await db.delete(s.users).where(eq(s.users.id, u.id));
  await destroySession();
  redirect("/?deleted=1");
}

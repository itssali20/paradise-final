import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { uploadsEnabled } from "@/lib/upload";
import ProfileForm from "@/components/account/ProfileForm";
import { label } from "@/lib/status";

export default async function ProfilePage() {
  const u = await requireUser();
  const p = (await db.query.profiles.findFirst({ where: eq(s.profiles.userId, u.id) })) ?? null;
  return (
    <div className="stack">
      <div className="panel-head">
        <h1 className="h2">My profile</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`status status--${p?.status === "APPROVED" ? "ok" : p?.status === "REJECTED" ? "bad" : "warn"}`}>{label(p?.status ?? "PENDING")}</span>
          {p?.verified && <span className="status status--info">Verified</span>}
          <Link className="mini-btn" href={`/account/members/${u.id}`}>Preview</Link>
        </div>
      </div>
      <p className="muted">Profiles are reviewed by our team before they appear to other members. Only approved, signed-in members can see you — and you can hide your profile at any time.</p>
      <ProfileForm p={p} uploads={uploadsEnabled()} />
    </div>
  );
}

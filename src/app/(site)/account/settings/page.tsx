import { eq, inArray } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteAccount, unblockUser } from "@/actions/member";
import PasswordForm from "@/components/account/PasswordForm";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ confirm?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const blocked = await db.select().from(s.blocks).where(eq(s.blocks.blockerId, u.id));
  const profiles = blocked.length ? await db.select().from(s.profiles).where(inArray(s.profiles.userId, blocked.map((b) => b.blockedId))) : [];
  return (
    <div className="stack">
      <h1 className="h2">Settings & privacy</h1>
      <div className="panel">
        <h2>Account</h2>
        <div className="kv" style={{ marginTop: 14 }}>
          <div><span>Name</span><b>{u.name}</b></div>
          <div><span>Email</span><b>{u.email}</b></div>
          <div><span>Country</span><b>{u.country ?? "—"}</b></div>
        </div>
      </div>
      <div className="panel"><h2>Password</h2><div style={{ marginTop: 14 }}><PasswordForm /></div></div>
      <div className="panel">
        <h2>Blocked members</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {blocked.length ? blocked.map((b) => (
            <form key={b.blockedId} action={unblockUser} className="conv" style={{ justifyContent: "space-between" }}>
              <input type="hidden" name="id" value={b.blockedId} />
              <span>{profiles.find((p) => p.userId === b.blockedId)?.displayName ?? "Member"}</span>
              <button className="mini-btn">Unblock</button>
            </form>
          )) : <p className="muted">Nobody blocked.</p>}
        </div>
      </div>
      <div className="panel">
        <h2>Delete account</h2>
        <p className="muted" style={{ marginTop: 8 }}>Removes your profile, photos, introductions and messages. Booking records are kept for accounting, without your login.</p>
        <form action={deleteAccount} className="toolbar" style={{ marginTop: 14 }}>
          <input name="confirm" placeholder='Type "DELETE" to confirm' aria-label="Confirm deletion" />
          <button className="mini-btn mini-btn--bad">Delete my account</button>
        </form>
        {sp.confirm && <p className="form-msg is-err">Please type DELETE to confirm.</p>}
      </div>
    </div>
  );
}

import Link from "next/link";
import { desc, eq, ilike, or, and, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, s } from "@/db";
import { fmtDate } from "@/lib/format";
import { label } from "@/lib/status";
import { age, initials } from "@/lib/members";
import { moderateProfile, resolveReport } from "@/actions/admin";

export const metadata = { title: "Members" };

export default async function Members({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab ?? "review";
  const Btn = ({ userId, action, children, bad }: { userId: string; action: string; children: React.ReactNode; bad?: boolean }) => (
    <form action={moderateProfile} style={{ display: "inline" }}>
      <input type="hidden" name="userId" value={userId} /><input type="hidden" name="action" value={action} /><input type="hidden" name="tab" value={tab} />
      <button className={`mini-btn${bad ? " mini-btn--bad" : ""}`}>{children}</button>
    </form>
  );

  let body: React.ReactNode = null;
  if (tab === "review") {
    const rows = await db.select({ p: s.profiles, u: s.users }).from(s.profiles).innerJoin(s.users, eq(s.users.id, s.profiles.userId)).where(eq(s.profiles.status, "PENDING")).orderBy(desc(s.profiles.updatedAt));
    body = rows.length ? (
      <div style={{ display: "grid", gap: 14 }}>
        {rows.map(({ p, u }) => (
          <div key={p.id} className="panel" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
              {p.photos.length ? p.photos.slice(0, 6).map((ph) => (
                // eslint-disable-next-line @next/next/no-img-element
                <a key={ph} href={ph} target="_blank" rel="noopener"><img src={ph} alt="" style={{ aspectRatio: "3/4", objectFit: "cover", borderRadius: 10, width: "100%" }} /></a>
              )) : <span className="avatar" style={{ width: 90, height: 90, fontSize: "2rem" }}>{initials(p.displayName)}</span>}
            </div>
            <div className="stack-s">
              <h2>{p.displayName} <span className="muted" style={{ fontSize: "1rem" }}>{u.gender === "LADY" ? "Lady" : "Gentleman"}{age(u.birthDate) ? ` · ${age(u.birthDate)}` : ""} · {u.country}</span></h2>
              <p className="fine">{u.email} · joined {fmtDate(u.createdAt)}</p>
              {p.headline && <p><b>{p.headline}</b></p>}
              {p.bio && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{p.bio}</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn userId={u.id} action="approve">Approve</Btn>
                <Btn userId={u.id} action="verify">Mark ID verified</Btn>
                <Btn userId={u.id} action="reject" bad>Reject</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : <p className="muted">No profiles waiting for review.</p>;
  } else if (tab === "reports") {
    const reporter = alias(s.users, "reporter");
    const rows = await db.select({ r: s.reports, reported: s.users, reporter: { email: reporter.email } }).from(s.reports)
      .innerJoin(s.users, eq(s.users.id, s.reports.reportedId)).innerJoin(reporter, eq(reporter.id, s.reports.reporterId)).orderBy(desc(s.reports.createdAt)).limit(200);
    body = (
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Reported</th><th>Reason</th><th>By</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map(({ r, reported, reporter }) => (
              <tr key={r.id}>
                <td><b>{reported.name}</b><div className="fine">{reported.email}</div></td>
                <td style={{ maxWidth: 360 }}>{r.reason}</td>
                <td className="fine">{reporter.email}<br />{fmtDate(r.createdAt, true)}</td>
                <td><span className={`status status--${r.status === "OPEN" ? "warn" : "ok"}`}>{label(r.status)}</span></td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {r.status === "OPEN" && <>
                    <form action={resolveReport} style={{ display: "inline" }}><input type="hidden" name="id" value={r.id} /><button className="mini-btn">Resolve</button></form>{" "}
                    <form action={resolveReport} style={{ display: "inline" }}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="DISMISSED" /><button className="mini-btn">Dismiss</button></form>{" "}
                  </>}
                  <Btn userId={reported.id} action={reported.suspended ? "unsuspend" : "suspend"} bad={!reported.suspended}>{reported.suspended ? "Unsuspend" : "Suspend"}</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="muted" style={{ padding: 16 }}>No reports.</p>}
      </div>
    );
  } else {
    const conds: SQL[] = [];
    if (sp.q) conds.push(or(ilike(s.users.email, `%${sp.q}%`), ilike(s.users.name, `%${sp.q}%`))!);
    const rows = await db.select({ u: s.users, p: s.profiles }).from(s.users).leftJoin(s.profiles, eq(s.profiles.userId, s.users.id)).where(conds.length ? and(...conds) : undefined).orderBy(desc(s.users.createdAt)).limit(300);
    body = (
      <>
        <form className="toolbar"><input type="hidden" name="tab" value="all" /><input name="q" placeholder="Name or email" defaultValue={sp.q ?? ""} /><button className="mini-btn mini-btn--solid">Search</button></form>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Member</th><th>Gender</th><th>Country</th><th>Profile</th><th>Role</th><th>Joined</th><th /></tr></thead>
            <tbody>
              {rows.map(({ u, p }) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b><div className="fine">{u.email}</div></td>
                  <td>{u.gender ? label(u.gender) : "—"}</td>
                  <td>{u.country ?? "—"}</td>
                  <td>{p ? <span className={`status status--${p.status === "APPROVED" ? "ok" : p.status === "REJECTED" ? "bad" : "warn"}`}>{label(p.status)}{p.verified ? " · ID" : ""}</span> : "—"}</td>
                  <td>{u.role === "ADMIN" ? <span className="status status--info">Admin</span> : "Member"}{u.suspended && <span className="status status--bad">Suspended</span>}</td>
                  <td className="fine">{fmtDate(u.createdAt)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {p && p.status !== "APPROVED" && <Btn userId={u.id} action="approve">Approve</Btn>}{" "}
                    <Btn userId={u.id} action={p?.verified ? "unverify" : "verify"}>{p?.verified ? "Unverify" : "Verify"}</Btn>{" "}
                    <Btn userId={u.id} action={u.suspended ? "unsuspend" : "suspend"} bad={!u.suspended}>{u.suspended ? "Unsuspend" : "Suspend"}</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin__head"><div><span className="caps caps--aqua">Community</span><h1>Members & moderation</h1></div><a className="mini-btn" href="/api/admin/export?type=members">Export CSV</a></div>
      <div className="tabs">
        {[["review", "Profiles to review"], ["all", "All members"], ["reports", "Reports"]].map(([k, l]) => <Link key={k} href={`/admin/members?tab=${k}`} className={tab === k ? "on" : ""}>{l}</Link>)}
      </div>
      {body}
    </>
  );
}

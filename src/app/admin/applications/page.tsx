import Link from "next/link";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { db, s } from "@/db";
import { fmtDate } from "@/lib/format";
import { label } from "@/lib/status";
import { deleteApplicationFiles, updateApplication } from "@/actions/admin";

export const metadata = { title: "Applications" };
const TYPES = ["LADY", "COMPETITION", "PARTNER", "SPONSOR", "GENERAL", "MEMBER"] as const;
const STATUSES = ["NEW", "REVIEWING", "APPROVED", "REJECTED"] as const;

export default async function Applications({ searchParams }: { searchParams: Promise<{ type?: string; status?: string; open?: string; saved?: string }> }) {
  const sp = await searchParams;
  const conds: SQL[] = [];
  if (sp.type && (TYPES as readonly string[]).includes(sp.type)) conds.push(eq(s.applications.type, sp.type as (typeof TYPES)[number]));
  if (sp.status && (STATUSES as readonly string[]).includes(sp.status)) conds.push(eq(s.applications.status, sp.status as (typeof STATUSES)[number]));
  const list = await db.select().from(s.applications).where(conds.length ? and(...conds) : undefined).orderBy(desc(s.applications.createdAt)).limit(300);
  const open = sp.open ? (list.find((a) => a.id === sp.open) ?? (await db.select().from(s.applications).where(eq(s.applications.id, sp.open)))[0]) : null;
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ type: sp.type, status: sp.status, ...o }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <div className="admin__head">
        <div><span className="caps caps--aqua">Ladies · competitions · partners · sponsors</span><h1>Applications</h1></div>
        <a className="mini-btn" href={`/api/admin/export?type=applications${sp.type ? `&appType=${sp.type}` : ""}`}>Export CSV</a>
      </div>
      <div className="tabs">
        <Link href={qs({ type: undefined })} className={!sp.type ? "on" : ""}>All</Link>
        {TYPES.map((t) => <Link key={t} href={qs({ type: t })} className={sp.type === t ? "on" : ""}>{label(t)}</Link>)}
      </div>
      <form className="toolbar">
        {sp.type && <input type="hidden" name="type" value={sp.type} />}
        <select name="status" defaultValue={sp.status ?? ""}><option value="">Any status</option>{STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
        <button className="mini-btn mini-btn--solid">Filter</button>
      </form>
      <div style={{ display: "grid", gridTemplateColumns: open ? "minmax(0,1fr) minmax(0,1fr)" : "1fr", gap: 18, alignItems: "start" }}>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} style={a.id === open?.id ? { background: "rgba(47,216,242,.06)" } : undefined}>
                  <td><Link href={qs({ open: a.id })}><b>{a.name}</b></Link><div className="fine">{a.email} · {a.country}</div></td>
                  <td>{label(a.type)}{a.data.competition ? <div className="fine">{a.data.competition}</div> : null}</td>
                  <td><span className={`status status--${a.status === "APPROVED" ? "ok" : a.status === "REJECTED" ? "bad" : a.status === "NEW" ? "info" : "warn"}`}>{label(a.status)}</span></td>
                  <td className="fine">{fmtDate(a.createdAt, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="muted" style={{ padding: 16 }}>No applications.</p>}
        </div>
        {open && (
          <div className="panel" style={{ position: "sticky", top: 20 }}>
            {sp.saved && <p className="notice" style={{ marginBottom: 12 }}>Saved.</p>}
            <div className="panel-head"><h2>{open.name}</h2><Link className="mini-btn" href={qs({ open: undefined })}>Close</Link></div>
            <div className="kv">
              <div><span>Type</span><b>{label(open.type)}</b></div>
              <div><span>Email</span><b><a href={`mailto:${open.email}`}>{open.email}</a></b></div>
              <div><span>Phone</span><b>{open.phone ?? "—"}</b></div>
              <div><span>Country</span><b>{open.country ?? "—"}</b></div>
              {Object.entries(open.data).map(([k, v]) => <div key={k} style={{ gridColumn: v.length > 60 ? "1/-1" : undefined }}><span>{k}</span><b style={{ whiteSpace: "pre-wrap", fontWeight: 400 }}>{v}</b></div>)}
            </div>
            {open.files.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <span className="caps caps--dim">Files ({open.files.length})</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8, marginTop: 10 }}>
                  {open.files.map((f) => (
                    <a key={f} href={f} target="_blank" rel="noopener" className="frame" style={{ aspectRatio: "3/4", borderRadius: 12, display: "grid", placeItems: "center" }}>
                      {/\.(jpe?g|png|webp|heic)(\?|$)/i.test(f) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f} alt="" />
                      ) : <span className="fine">Open file</span>}
                    </a>
                  ))}
                </div>
                <form action={deleteApplicationFiles} style={{ marginTop: 10 }}><input type="hidden" name="id" value={open.id} /><button className="mini-btn mini-btn--bad">Delete files (after ID verification)</button></form>
              </div>
            )}
            <form className="form" action={updateApplication} style={{ marginTop: 18 }}>
              <input type="hidden" name="id" value={open.id} />
              <div className="f"><label>Status</label><select name="status" defaultValue={open.status}>{STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></div>
              <label className="check" style={{ alignSelf: "end" }}><input type="checkbox" name="notify" defaultChecked /> Email the applicant</label>
              <div className="f f--full"><label>Internal notes</label><textarea name="adminNotes" defaultValue={open.adminNotes ?? ""} /></div>
              <div className="f--full" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="mini-btn mini-btn--solid">Save</button>
                {open.type === "LADY" && <Link className="mini-btn mini-btn--aqua" href={`/admin/bookings/new?app=${open.id}`}>Approve & create complimentary booking</Link>}
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

import { desc } from "drizzle-orm";
import { db, s } from "@/db";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function Audit() {
  const list = await db.select().from(s.auditLogs).orderBy(desc(s.auditLogs.createdAt)).limit(300);
  return (
    <>
      <div className="admin__head"><div><span className="caps caps--aqua">System</span><h1>Audit log</h1></div></div>
      <div className="table-wrap"><table className="t"><thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
        <tbody>{list.map((l) => <tr key={l.id}><td className="fine">{fmtDate(l.createdAt, true)}</td><td><b>{l.action}</b></td><td className="fine">{l.entity} {l.entityId?.slice(0, 8)}</td><td className="fine" style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis" }}>{l.data ? JSON.stringify(l.data).slice(0, 160) : ""}</td></tr>)}</tbody></table></div>
    </>
  );
}

import { desc } from "drizzle-orm";
import { db, s } from "@/db";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Subscribers" };

export default async function Subscribers() {
  const list = await db.select().from(s.subscribers).orderBy(desc(s.subscribers.createdAt)).limit(1000);
  return (
    <>
      <div className="admin__head"><div><span className="caps caps--aqua">Marketing</span><h1>Subscribers</h1><p className="muted">{list.length} people asked to hear about next month&apos;s destination.</p></div><a className="mini-btn mini-btn--solid" href="/api/admin/export?type=subscribers">Export CSV</a></div>
      <div className="table-wrap"><table className="t"><thead><tr><th>Email</th><th>Source</th><th>Date</th></tr></thead>
        <tbody>{list.map((x) => <tr key={x.id}><td>{x.email}</td><td>{x.source}</td><td className="fine">{fmtDate(x.createdAt, true)}</td></tr>)}</tbody></table></div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEGAL } from "@/content/legal";

/** Renders **bold** spans inside legal copy. */
const rich = (text: string) => text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} style={{ color: "var(--ink)" }}>{part}</strong> : part));

export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL.find((x) => x.slug === slug);
  return { title: doc?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL.find((x) => x.slug === slug);
  if (!doc) notFound();
  return (
    <div className="page-pad bg-glow">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)", gap: "clamp(24px,5vw,80px)" }}>
        <nav className="acct__side" aria-label="Legal">
          {LEGAL.map((d) => <Link key={d.slug} href={`/legal/${d.slug}`} className={d.slug === doc.slug ? "on" : ""}>{d.title}</Link>)}
        </nav>
        <article className="prose">
          <span className="caps caps--aqua">Updated {doc.updated}</span>
          <h1 className="h2" style={{ marginTop: 14 }}>{doc.title}</h1>
          {doc.intro?.map((p, i) => <p key={i} className={i ? "fine" : "caps caps--dim"} style={{ marginTop: i ? 8 : 18 }}>{p}</p>)}
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p, i) => <p key={i}>{rich(p)}</p>)}
              {s.list && <ul>{s.list.map((li) => <li key={li}>{rich(li)}</li>)}</ul>}
              {s.table && (
                <div className="table-wrap" style={{ margin: "18px 0" }}>
                  <table className="t">
                    <thead><tr>{s.table[0].map((c) => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>{s.table.slice(1).map((r, i, all) => <tr key={r[0]}>{r.map((c, j) => <td key={j} className={j ? "num" : undefined}>{i === all.length - 1 ? <b>{c}</b> : c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              {s.after?.map((p, i) => <p key={i}>{rich(p)}</p>)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

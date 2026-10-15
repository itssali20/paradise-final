import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { and, count, inArray, sql } from "drizzle-orm";
import { db, s } from "@/db";
import VoteBoard, { type BoardEntry } from "@/components/casting/VoteBoard";
import { getVoter, votesUsed } from "@/lib/casting";
import { age } from "@/lib/members";
import { CASTING } from "@/content/casting";

export const metadata: Metadata = { title: "Casting · vote", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SHOWS = [
  { key: "new", label: "Not voted yet" },
  { key: "all", label: "Everyone" },
  { key: "mine", label: "My votes" },
] as const;

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="page-pad center stack bg-glow">
      <span className="caps caps--aqua">Paradise Casting</span>
      <h1 className="h2">{title}</h1>
      {children}
    </div>
  );
}

export default async function VotePage({ searchParams }: { searchParams: Promise<{ show?: string; page?: string }> }) {
  const v = await getVoter();
  if (v.reason === "signin") redirect("/login?next=/casting/vote");
  if (v.reason === "nodb") return <Gate title="Voting opens soon"><p className="lead">The voting board goes live as soon as member accounts are switched on.</p><Link className="btn" href="/casting">Back to casting</Link></Gate>;
  if (v.reason === "admin") return <Gate title="Admins don't vote"><p className="lead">See the live ranking in the admin dashboard.</p><Link className="btn btn--chrome" href="/admin/casting">Open casting ranking</Link></Gate>;
  if (v.reason === "suspended") redirect("/login?error=suspended");
  if (!v.canVote || !v.user) return <Gate title="Voting is for gentlemen"><p className="lead">Ladies can apply to the casting instead. It takes five minutes.</p><Link className="btn btn--chrome" href="/casting#apply">Apply to the casting</Link></Gate>;

  const uid = v.user.id;
  const sp = await searchParams;
  const show = SHOWS.some((x) => x.key === sp.show) ? sp.show! : "new";
  const page = Math.max(1, Number(sp.page) || 1);
  const mine = sql`exists (select 1 from casting_votes v where v.entry_id = ${s.castingEntries.id} and v.voter_id = ${uid})`;
  const where = and(
    inArray(s.castingEntries.status, ["APPROVED", "CHOSEN"]),
    show === "mine" ? mine : show === "new" ? sql`not ${mine}` : undefined,
  );

  const [rows, [{ n: total }], [{ n: live }], used] = await Promise.all([
    db.select({ e: s.castingEntries, voted: sql<boolean>`${mine}` }).from(s.castingEntries).where(where)
      // a fixed shuffle per gentleman: nobody gets an advantage from applying first
      .orderBy(sql`md5(${s.castingEntries.id} || ${uid})`)
      .limit(CASTING.pageSize).offset((page - 1) * CASTING.pageSize),
    db.select({ n: count() }).from(s.castingEntries).where(where),
    db.select({ n: count() }).from(s.castingEntries).where(inArray(s.castingEntries.status, ["APPROVED", "CHOSEN"])),
    votesUsed(uid),
  ]);
  const pages = Math.max(1, Math.ceil(total / CASTING.pageSize));

  const entries: BoardEntry[] = rows.map(({ e, voted }) => ({
    id: e.id,
    name: e.name.split(" ")[0],
    age: age(e.birthDate),
    place: [e.city, e.country].filter(Boolean).join(", "),
    heightCm: e.heightCm,
    languages: e.languages,
    about: e.about,
    photos: e.photos,
    voted: Boolean(voted),
  }));
  const href = (o: { show?: string; page?: number }) => `/casting/vote?show=${o.show ?? show}${(o.page ?? 1) > 1 ? `&page=${o.page}` : ""}`;

  return (
    <div className="page-pad bg-glow">
      <div className="container" style={{ paddingInline: 0 }}>
        <div className="vote-head">
          <div>
            <span className="caps caps--aqua eyebrow">Paradise Casting · private</span>
            <h1 className="h2" style={{ marginTop: 14 }}>Choose who <em className="chrome">comes to paradise</em></h1>
            <p className="lead" style={{ marginTop: 14 }}>{live} {live === 1 ? "lady is" : "ladies are"} in the casting. You have {CASTING.voteLimit} hearts. The {CASTING.shortlist} ladies with the most votes are invited.</p>
          </div>
          <nav className="tabs" aria-label="Filter">
            {SHOWS.map((x) => <Link key={x.key} href={href({ show: x.key })} className={show === x.key ? "on" : ""} aria-current={show === x.key ? "page" : undefined}>{x.label}</Link>)}
          </nav>
        </div>

        {entries.length ? (
          <VoteBoard key={`${show}-${page}`} entries={entries} used={used} limit={CASTING.voteLimit} />
        ) : (
          <div className="panel center" style={{ marginTop: 30 }}>
            <p className="lead" style={{ margin: "0 auto" }}>
              {show === "mine" ? "You haven't voted yet. Open “Not voted yet” to start." : show === "new" && live ? "You've seen everyone in the casting. New ladies are approved every day." : "The casting opens soon. New ladies are approved every day."}
            </p>
          </div>
        )}

        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link className="btn btn--sm" href={href({ page: page - 1 })}>← Previous</Link>}
            <span className="caps caps--dim">Page {page} of {pages}</span>
            {page < pages && <Link className="btn btn--sm" href={href({ page: page + 1 })}>Next →</Link>}
          </nav>
        )}
        <p className="fine" style={{ marginTop: 40 }}>Photos are private to Paradise Club members. Saving, sharing or screenshotting them breaks the community standards and closes your account.</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { FOOTER_NAV, SITE } from "@/content/site";
import Newsletter from "./Newsletter";
import Marquee from "@/components/motion/Marquee";

export default function Footer() {
  return (
    <footer className="foot">
      <Marquee className="marquee--caps" speed={30}>
        {["Cancún", "Bahamas", "Jamaica", "St. Lucia", "Ibiza", "Amalfi", "Capri", "Maldives", "Monaco", "Croatia"].map((d) => (
          <span key={d} style={{ paddingRight: "3em" }}>{d} ✦</span>
        ))}
      </Marquee>
      <div className="foot__top" style={{ marginTop: "clamp(70px,9vw,120px)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="foot__logo" src="/brand/logo-600.webp" alt="Paradise Club" loading="lazy" width={600} height={294} />
        <p className="foot__big chrome" data-split="chars">Join us in Paradise</p>
        <p className="caps caps--dim">{SITE.name} · {SITE.pillars}</p>
        <Newsletter />
      </div>
      <div className="foot__cols">
        {FOOTER_NAV.map((c) => (
          <div key={c.title}>
            <h4>{c.title}</h4>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot__base">
        <span>© {new Date().getFullYear()} Paradise Club. A subsidiary of {SITE.company}</span>
        <nav aria-label="Contact">
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          {SITE.socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener">{s.label}</a>)}
          <a href="/admin" data-no-transition>Team login</a>
        </nav>
      </div>
      <p className="fine" style={{ marginTop: 20, position: "relative" }}>
        Paradise Club is a proposed luxury travel and membership concept. Resort buyouts, event schedules, membership functions,
        airfare subsidies, complimentary attendance and competition prizes are subject to contractual and operational confirmation
        and are not guaranteed until confirmed in each event&apos;s written terms. Terms, fees, eligibility and cancellation policies
        are disclosed before purchase. Some imagery is illustrative. Guests must be 18 or older.
      </p>
    </footer>
  );
}

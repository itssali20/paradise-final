import Link from "next/link";
import { FOOTER_NAV, SITE } from "@/content/site";
import Newsletter from "./Newsletter";
import Marquee from "@/components/motion/Marquee";

export default function Footer() {
  return (
    <footer className="foot">
      <Marquee className="marquee--caps" speed={30}>
        {["Cancún", "Bahamas", "Jamaica", "Bora Bora", "Ibiza", "Amalfi", "Mykonos", "Maldives", "Monaco", "Croatia"].map((d) => (
          <span key={d} style={{ paddingRight: "3em" }}>{d} ✦</span>
        ))}
      </Marquee>
      <div className="foot__top" style={{ marginTop: "clamp(70px,9vw,120px)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="foot__logo" src="/brand/logo-600.webp" alt="Paradise Club" loading="lazy" width={600} height={294} />
        <p className="foot__big chrome" data-split="chars">Join us in Paradise</p>
        <p className="caps caps--dim">A new resort every month · Ladies always come free</p>
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
        Event programming, destinations, guest composition, prizes and property exclusivity are planned features and subject to
        confirmation in each event&apos;s written terms. Some imagery is illustrative. Guests must be 18 or older.
      </p>
    </footer>
  );
}

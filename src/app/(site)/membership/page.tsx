import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "Membership", description: "Join Paradise Club: create your profile, meet members before you travel with consent-based introductions and private messaging." };

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Paradise Club membership"
        title={<>Meet before <em className="chrome">you travel</em></>}
        lead="Create your profile, browse approved members going to the same resort and request introductions. Messaging opens only when both of you agree."
        image="un:1552600337-6f42e4fb2e78"
        crumbs={[{ href: "/membership", label: "Membership" }]}
      >
        <Link className="btn btn--chrome" href="/register" data-magnetic>Become a member</Link>
        <Link className="btn btn--ghost" href="/account/members">Members area</Link>
      </PageHero>

      <section className="section bg-glow">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>How Paradise Club works</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Join. Connect. <em className="chrome">Experience.</em></h2>
          <div className="trio" data-stagger>
            <div><b className="chrome-static">I</b><h3>Join</h3><p>Create your member profile with photos and tell us which destinations and months interest you.</p></div>
            <div><b className="chrome-static">II</b><h3>Connect</h3><p>Browse approved profiles and request introductions. Messaging opens only when both sides accept.</p></div>
            <div><b className="chrome-static">III</b><h3>Experience</h3><p>Meet in person at a luxury beachfront resort: seven days, six nights and 200 fascinating singles.</p></div>
          </div>
        </div>
      </section>

      <section className="split bg-navy">
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>Members area</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Private, <em className="chrome">by design</em></h2>
          <ul className="ticks" style={{ marginTop: 28 }} data-stagger>
            <li>Your profile, with photos and an optional video</li>
            <li>Consent-based discovery and private messaging</li>
            <li>Upcoming events, your bookings and payment schedule</li>
            <li>Member verification and privacy controls — hide your profile any time</li>
            <li>Community standards, reporting and blocking</li>
          </ul>
          <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }} data-reveal>
            <Link className="btn btn--chrome" href="/register">Create your account</Link>
            <Link className="btn" href="/legal/community">Community standards</Link>
          </div>
        </div>
        <div className="split__media" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 10 }}>
          {["/media/ladies.webp", "/media/comp-bikini.webp", "un:1593836788196-9fd68e904906", "/media/club-rain.webp"].map((g, i) => (
            <div key={g} className="frame" style={{ borderRadius: 20, filter: i % 3 ? "blur(0px)" : "none" }} data-reveal="zoom">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(g, 700)} alt="" loading="lazy" style={{ aspectRatio: "3/4" }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

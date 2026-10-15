import Link from "next/link";
import type { Metadata } from "next";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Video from "@/components/ui/Video";
import { SITE } from "@/content/site";
import { CLIPS } from "@/content/media";

export const metadata: Metadata = { title: "Contact", description: "Confidential inquiries, hotel partnerships and sponsorships." };

const TABS = [
  { k: "general", label: "General", type: "GENERAL" as const },
  { k: "partner", label: "Hotel partner", type: "PARTNER" as const },
  { k: "sponsor", label: "Sponsor", type: "SPONSOR" as const },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; destination?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.k === sp.type) ?? TABS[0];
  const fields =
    tab.type === "PARTNER"
      ? [
          { name: "organisation", label: "Property / hotel group", required: true, full: true },
          { name: "rooms", label: "Number of rooms", type: "number" as const },
          { name: "dates", label: "Possible months" },
          { name: "message", label: "Tell us about the property", type: "textarea" as const },
        ]
      : tab.type === "SPONSOR"
        ? [
            { name: "organisation", label: "Company", required: true, full: true },
            { name: "interest", label: "Sponsorship interest", type: "select" as const, options: ["Competition prize", "Stage / show", "Swimwear & fashion", "Drinks & hospitality", "Live stream", "Other"] },
            { name: "budget", label: "Indicative budget" },
            { name: "message", label: "Message", type: "textarea" as const },
          ]
        : [
            { name: "subject", label: "Subject", type: "select" as const, options: ["Reservations", "Ladies attending", "Competitions", "Membership", "Press", "Other"], full: true },
            { name: "message", label: "Message", type: "textarea" as const, defaultValue: sp.destination ? `I'm interested in ${sp.destination}.` : undefined },
          ];

  return (
    <section className="screen" style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <div className="media shade-left"><Video mixkit={CLIPS.turquoise} poster="/media/dest-jamaica.webp" eager /></div>
      <div className="container grid-2" style={{ position: "relative", zIndex: 2, paddingBlock: "150px 100px", alignItems: "center" }}>
        <div className="stack">
          <span className="caps caps--aqua eyebrow">Reservations & inquiries</span>
          <h1 className="h1" data-split="words">Your paradise <em className="chrome">starts here</em></h1>
          <p className="lead" style={{ color: "var(--ink)" }}>Confidential inquiries can be made by phone or WhatsApp, or send the form and our team will reply personally.</p>
          <a className="h2 chrome-static" href={SITE.phoneHref} style={{ textDecoration: "none", display: "block" }}>{SITE.phone}</a>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn--ghost btn--sm" href={SITE.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
            <a className="btn btn--ghost btn--sm" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
        </div>
        <div>
          <div className="tabs" role="tablist">
            {TABS.map((t) => (
              <Link key={t.k} href={`/contact?type=${t.k}`} role="tab" aria-selected={t.k === tab.k} scroll={false}>{t.label}</Link>
            ))}
            <Link href="/ladies#apply" role="tab" aria-selected={false}>Ladies apply</Link>
            <Link href="/competitions#enter" role="tab" aria-selected={false}>Competitions</Link>
          </div>
          <ApplicationForm key={tab.k} type={tab.type} fields={fields} submit={tab.type === "GENERAL" ? "Send message" : "Contact partnerships"} />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { img } from "@/content/media";
import Video from "./Video";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: string;
  video?: { src?: string; srcMobile?: string; mixkit?: string; poster?: string };
  crumbs?: { href: string; label: string }[];
  short?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Cinematic inner-page hero: full-bleed media with parallax, split headline, optional actions. */
export default function PageHero({ eyebrow, title, lead, image, video, crumbs, short, className, children }: Props) {
  return (
    <section className={`phero${short ? " phero--short" : ""}${className ? ` ${className}` : ""}`}>
      <div className="media">
        {video ? (
          <Video {...video} eager />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img(image, 2200)} alt="" data-parallax="8" fetchPriority="high" />
        )}
      </div>
      <div className="phero__c">
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c) => (
              <span key={c.href} style={{ display: "contents" }}><span aria-hidden="true">/</span><Link href={c.href}>{c.label}</Link></span>
            ))}
          </nav>
        )}
        {eyebrow && <span className="caps caps--aqua eyebrow" data-reveal="fade">{eyebrow}</span>}
        <h1 className="h1" style={{ marginTop: 18 }} data-split="words">{title}</h1>
        {lead && <p className="lead" data-reveal>{lead}</p>}
        {children && <div className="phero__meta" data-reveal>{children}</div>}
      </div>
    </section>
  );
}

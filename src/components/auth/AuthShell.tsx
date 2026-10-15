import type { ReactNode } from "react";
import { img } from "@/content/media";

export default function AuthShell({ image, eyebrow, title, children }: { image: string; eyebrow: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="auth bg-navy">
      <div className="auth__media"><div className="media shade">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img(image, 1600)} alt="" data-parallax="6" /></div></div>
      <div className="auth__form">
        <span className="caps caps--aqua eyebrow">{eyebrow}</span>
        <h1 className="h2" style={{ margin: "16px 0 30px" }} data-split="words">{title}</h1>
        {children}
      </div>
    </section>
  );
}

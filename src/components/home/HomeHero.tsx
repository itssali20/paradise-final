"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReduced } from "@/lib/gsap";
import { VIDEO } from "@/content/media";
import Video from "@/components/ui/Video";

type Next = { title: string; dates: string; href: string } | null;

/**
 * The opening: three seconds of pure film — no words, no menu.
 * Then the chrome logo rises out of the water, the headline types itself in,
 * and only then do the buttons and navigation arrive.
 */
export default function HomeHero({ next }: { next: Next }) {
  const root = useRef<HTMLElement>(null);
  const [intro, setIntro] = useState(true);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (prefersReduced()) { setIntro(false); return; }
      let seen = false;
      try { seen = sessionStorage.getItem("pc_intro") === "1"; } catch {}
      const silent = seen ? 0.4 : 3.2;
      html.classList.add("intro-lock");

      const split = SplitText.create(".hero h1 .ln", { type: "chars,words", mask: "words", charsClass: "split-char", wordsClass: "split-word" });

      const finish = () => {
        split.revert(); // back to plain text: one clean chrome gradient, no leftover letter layers
        html.classList.remove("intro-lock");
        setIntro(false);
        try { sessionStorage.setItem("pc_intro", "1"); } catch {}
      };

      gsap.set([".hero__sub", ".hero__cta > *", ".hero__bar"], { opacity: 0 });
      gsap.set([".hero__logo .art", ".hero__logo .word"], { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: finish });
      tlRef.current = tl;
      tl.fromTo(".hero .media", { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: silent + 2.2, ease: "power2.out" }, 0)
        .addLabel("logo", silent)
        .fromTo(".hero__logo .art",
          { opacity: 0, clipPath: "circle(0% at 70% 58%)", filter: "blur(16px)", y: 30 },
          { opacity: 1, clipPath: "circle(140% at 70% 58%)", filter: "blur(0px)", y: 0, duration: 2, ease: "power3.inOut", clearProps: "clipPath,filter" }, "logo")
        .fromTo(".hero__logo .word",
          { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
          { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" }, "logo+=1")
        .fromTo(".hero__logo .shine", { backgroundPosition: "150% 0" }, { backgroundPosition: "-60% 0", duration: 1.8, ease: "power2.inOut" }, "logo+=1.9")
        .addLabel("type", "logo+=2.1")
        .from(split.chars, { yPercent: 120, rotate: 6, duration: 1.3, stagger: 0.028 }, "type")
        .to(".hero__sub", { opacity: 1, duration: 1.2 }, "type+=0.7")
        .from(".hero__sub", { y: 24, duration: 1.2 }, "type+=0.7")
        .to(".hero__cta > *", { opacity: 1, duration: 1, stagger: 0.1 }, "type+=0.9")
        .from(".hero__cta > *", { y: 26, duration: 1, stagger: 0.1 }, "type+=0.9")
        .call(() => html.classList.remove("intro-lock"), [], "type+=0.8")
        .fromTo("#nav", { yPercent: -110 }, { yPercent: 0, duration: 1.2, clearProps: "transform" }, "type+=0.8")
        .to(".hero__bar", { opacity: 1, duration: 1.2 }, "type+=1.1")
        .from(".hero__bar", { y: 30, duration: 1.2 }, "type+=1.1");

      // any intent to move on fast-forwards the intro
      const hurry = () => { if (tl.isActive()) tl.timeScale(4); };
      window.addEventListener("wheel", hurry, { passive: true, once: true });
      window.addEventListener("touchstart", hurry, { passive: true, once: true });
      window.addEventListener("keydown", hurry, { once: true });

      // parallax out
      gsap.to(".hero .media", { yPercent: 22, scale: 1.08, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__c", { yPercent: -10, opacity: 0, ease: "power1.in", scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true } });

      return () => {
        split.revert();
        html.classList.remove("intro-lock");
        window.removeEventListener("wheel", hurry);
        window.removeEventListener("touchstart", hurry);
        window.removeEventListener("keydown", hurry);
      };
    },
    { scope: root },
  );

  return (
    <section className="hero" ref={root} aria-label="Paradise Club">
      <div className="media">
        <Video src={VIDEO.heroDesktop} srcMobile={VIDEO.heroMobile} poster={VIDEO.heroPoster} eager />
      </div>
      <div className="hero__veil" />
      <div className="hero__c">
        <div className="hero__logo" aria-hidden="true">
          <div className="lw lw--art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="art" src="/brand/mark-1400.webp" alt="" width={1400} height={527} />
            <span className="shine" />
          </div>
          <div className="lw lw--word">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="word" src="/brand/wordmark-1200.webp" alt="" width={1200} height={244} />
            <span className="shine" />
          </div>
        </div>
        <h1 aria-label="One unforgettable paradise">
          <span className="ln">One unforgettable</span>
          <span className="ln l2 chrome">paradise</span>
        </h1>
        <p className="hero__sub">100 extraordinary women. 100 successful men. Seven days, six nights, one private luxury resort — a new one every month.</p>
        <div className="hero__cta">
          <Link className="btn btn--chrome" href="/events" data-magnetic>Reserve your room</Link>
          <Link className="btn btn--ghost" href="/ladies">Ladies come free</Link>
        </div>
      </div>
      <div className="hero__bar">
        <div className="hero__stats">
          <div><b>100</b><span>Ladies</span></div>
          <div><b>100</b><span>Gentlemen</span></div>
          <div><b>7</b><span>Days · 6 nights</span></div>
          <div><b className="chrome">$40K</b><span>Contest prizes</span></div>
        </div>
        {next ? (
          <Link className="hero__next" href={next.href}>
            <span className="caps caps--aqua">Next paradise</span>
            <b>{next.title}</b>
            <span className="caps caps--dim">{next.dates}</span>
          </Link>
        ) : (
          <span className="scroll-cue caps caps--dim"><i />Scroll</span>
        )}
      </div>
      {intro && (
        <button className="hero__skip caps caps--dim" onClick={() => tlRef.current?.timeScale(6)}>
          Skip intro
        </button>
      )}
    </section>
  );
}

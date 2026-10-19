"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/content/site";
import { img } from "@/content/media";
import { gsap, lockScroll, prefersReduced } from "@/lib/gsap";

const SOLID = ["/account", "/book", "/login", "/register", "/reset", "/legal", "/members", "/casting/vote"];
const QUICK = [
  { href: "/events", label: "Events" },
  { href: "/destinations", label: "Destinations" },
  { href: "/rooms", label: "Rooms" },
  { href: "/ladies", label: "For Ladies" },
  { href: "/competitions", label: "Competitions" },
];

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  useEffect(() => {
    fetch("/api/session", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then(setUser).catch(() => {});
  }, [pathname]);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const nav = useRef<HTMLElement>(null);
  const forceSolid = SOLID.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const el = nav.current!;
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      el.classList.toggle("is-solid", forceSolid || y > window.innerHeight * 0.5);
      const menuOpen = document.body.classList.contains("menu-open");
      if (!menuOpen) el.classList.toggle("is-hidden", y > last + 4 && y > 400);
      if (y < last - 4) el.classList.remove("is-hidden");
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [forceSolid, pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    lockScroll(open);
    if (open && !prefersReduced()) {
      gsap.fromTo(".menu__links > a, .menu__foot", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.045, duration: 0.9, delay: 0.3, ease: "expo.out", clearProps: "all" });
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const acctHref = user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login";

  return (
    <>
      <header className="nav" ref={nav} id="nav">
        <Link className="brand" href="/" aria-label="Paradise Club home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-480.webp" alt="" width={140} height={44} />
          <span><b>Paradise</b><small>Club · Elite Vacations</small></span>
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {QUICK.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="nav__r">
          <a className="nav__phone" href={SITE.phoneHref}>{SITE.phone}</a>
          <Link className="btn btn--chrome btn--sm nav__book" href="/events" data-magnetic>Book now</Link>
          <Link className="nav__acct" href={acctHref} aria-label={user ? "My account" : "Sign in"} title={user ? user.name : "Sign in"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          </Link>
          <button className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            <i /><span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </header>

      <div className="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open}>
        <nav className="menu__links" aria-label="Main">
          {NAV.map((l, i) => (
            <Link key={l.href} href={l.href} onMouseEnter={() => setHover(i)} aria-current={pathname === l.href ? "page" : undefined} tabIndex={open ? 0 : -1}>
              <small>{String(i + 1).padStart(2, "0")}</small>{l.label}
            </Link>
          ))}
          <div className="menu__foot">
            <Link className="btn btn--chrome btn--sm" href="/events" tabIndex={open ? 0 : -1}>Reserve your room</Link>
            <Link className="btn btn--sm" href={acctHref} tabIndex={open ? 0 : -1}>{user ? "My account" : "Sign in / Join"}</Link>
          </div>
        </nav>
        <div className="menu__side">
          <div className="media shade">
            {NAV.map((l, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={l.href} src={img(l.img, 1400)} alt="" loading="lazy" style={{ opacity: hover === i ? 1 : 0, transform: hover === i ? "scale(1)" : "scale(1.08)" }} />
            ))}
          </div>
          <div className="menu__info">
            <span className="caps caps--aqua">Confidential inquiries</span>
            <a href={SITE.phoneHref}>{SITE.phone}</a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener" className="caps caps--dim" style={{ fontFamily: "var(--f-sans)", fontSize: ".7rem" }}>WhatsApp us →</a>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/content/site";

/** Persistent Book · Call · WhatsApp bar on phones (appears after the hero). */
export default function MobileBar() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const on = () => ref.current?.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);
  if (pathname.startsWith("/book") || pathname.startsWith("/account")) return null;
  return (
    <div className="mbar" ref={ref}>
      <Link href="/events">Book</Link>
      <a href={SITE.phoneHref}>Call</a>
      <a href={SITE.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
    </div>
  );
}

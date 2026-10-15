import Link from "next/link";

export default function NotFound() {
  return (
    <section className="screen" style={{ display: "grid", placeItems: "center", position: "relative" }}>
      <div className="media" style={{ opacity: 0.4 }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/media/act-coral.webp" alt="" /></div>
      <div className="center stack" style={{ position: "relative", zIndex: 2, padding: "140px var(--gutter)" }}>
        <span className="caps caps--aqua">404</span>
        <h1 className="display chrome">Lost at sea.</h1>
        <p className="lead">This page drifted away. Let&apos;s get you back to paradise.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn--chrome" href="/">Home</Link>
          <Link className="btn" href="/events">Upcoming events</Link>
        </div>
      </div>
    </section>
  );
}

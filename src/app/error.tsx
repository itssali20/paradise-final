"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-pad center stack">
      <span className="caps caps--aqua">Something went wrong</span>
      <h1 className="h2">A wave knocked this page over.</h1>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn btn--chrome" onClick={reset}>Try again</button>
        <Link className="btn" href="/">Home</Link>
      </div>
    </div>
  );
}

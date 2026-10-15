import Link from "next/link";
export default function RootNotFound() {
  return (
    <div className="page-pad center stack">
      <h1 className="h2 chrome">Lost at sea.</h1>
      <Link className="btn" href="/">Back to Paradise</Link>
    </div>
  );
}

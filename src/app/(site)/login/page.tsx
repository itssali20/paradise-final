import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERR: Record<string, string> = { suspended: "This account is suspended.", admin: "Please sign in with an administrator account." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const sess = await getSession();
  if (sess && !sp.error) redirect(sp.next || (sess.role === "ADMIN" ? "/admin" : "/account"));
  return (
    <AuthShell image="/media/ladies.webp" eyebrow="Members" title={<>Welcome <em className="chrome">back</em></>}>
      {sp.next?.startsWith("/book") && <p className="notice" style={{ marginBottom: 22 }}>Sign in — or create a free account in one minute — to reserve your room. Your booking, payment schedule and receipts live in your account.</p>}
      <LoginForm next={sp.next} error={sp.error ? ERR[sp.error] : undefined} />
      <p className="muted" style={{ marginTop: 30 }}>New to Paradise Club? <Link className="link-line" href={`/register${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`} style={{ color: "var(--ink)" }}>Create an account</Link></p>
    </AuthShell>
  );
}

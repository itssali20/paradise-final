import Link from "next/link";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Become a member" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell image="un:1552600337-6f42e4fb2e78" eyebrow="Membership" title={<>Join <em className="chrome">Paradise Club</em></>}>
      {sp.next?.startsWith("/book") && <p className="notice" style={{ marginBottom: 22 }}>Create your account and you&apos;ll go straight back to your reservation.</p>}
      <RegisterForm next={sp.next} />
      <p className="muted" style={{ marginTop: 30 }}>Already a member? <Link className="link-line" href={`/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`} style={{ color: "var(--ink)" }}>Sign in</Link></p>
    </AuthShell>
  );
}

import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell image="/media/dest-costa-rica.webp" eyebrow="Account" title={<>{sp.token ? "Choose a new" : "Reset your"} <em className="chrome">password</em></>}>
      <ResetForm token={sp.token} />
    </AuthShell>
  );
}

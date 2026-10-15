import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  return NextResponse.json(s ? { name: s.name, role: s.role } : null, { headers: { "Cache-Control": "private, no-store" } });
}

import { NextResponse } from "next/server";
import { and, asc, eq, gt, isNull, ne, or } from "drizzle-orm";
import { db, s } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const [c] = await db.select().from(s.conversations).where(and(eq(s.conversations.id, id), or(eq(s.conversations.aId, sess.uid), eq(s.conversations.bId, sess.uid))));
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  const after = new URL(req.url).searchParams.get("after");
  const since = after ? new Date(after) : new Date(0);
  const rows = await db.select().from(s.messages).where(and(eq(s.messages.conversationId, id), gt(s.messages.createdAt, since))).orderBy(asc(s.messages.createdAt)).limit(100);
  if (rows.some((r) => r.senderId !== sess.uid)) {
    await db.update(s.messages).set({ readAt: new Date() }).where(and(eq(s.messages.conversationId, id), ne(s.messages.senderId, sess.uid), isNull(s.messages.readAt)));
  }
  return NextResponse.json({ messages: rows.map((m) => ({ id: m.id, body: m.body, senderId: m.senderId, createdAt: m.createdAt.toISOString() })) });
}

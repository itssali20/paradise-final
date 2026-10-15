import "server-only";
import { db, s } from "@/db";

export async function audit(actorId: string | null, action: string, entity: string, entityId?: string | null, data?: unknown) {
  try {
    await db.insert(s.auditLogs).values({ actorId, action, entity, entityId: entityId ?? null, data: (data ?? null) as never });
  } catch (e) {
    console.error("[audit]", e);
  }
}

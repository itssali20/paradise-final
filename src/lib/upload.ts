import "server-only";
import { put } from "@vercel/blob";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf", "video/mp4", "video/quicktime"];
const MAX = 10 * 1024 * 1024;

export const uploadsEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Stores uploaded files in Vercel Blob under an unguessable path. Returns public URLs. */
export async function uploadFiles(files: File[], folder: string, max = 8): Promise<{ urls: string[]; error?: string }> {
  const list = files.filter((f) => f && f.size > 0);
  if (!list.length) return { urls: [] };
  if (!uploadsEnabled()) return { urls: [], error: "File uploads are not configured yet (BLOB_READ_WRITE_TOKEN)." };
  const urls: string[] = [];
  for (const f of list.slice(0, max)) {
    if (!OK_TYPES.includes(f.type)) return { urls, error: `${f.name}: unsupported file type` };
    if (f.size > MAX) return { urls, error: `${f.name}: larger than 10 MB` };
    const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const blob = await put(`${folder}/${crypto.randomUUID()}.${ext}`, f, { access: "public", addRandomSuffix: true });
    urls.push(blob.url);
  }
  return { urls };
}

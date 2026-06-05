import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

const CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/** Serve a raw uploaded image — authed only, never web-public. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const db = getDb();
  const photo = db.select().from(schema.photos).where(eq(schema.photos.id, id)).get();
  if (!photo || photo.purgedAt) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readFile(photo.filepath);
    const ext = photo.filepath.slice(photo.filepath.lastIndexOf(".")).toLowerCase();
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": CONTENT_TYPE[ext] ?? "application/octet-stream",
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";

/** Serve a stored policy PDF — authed only, never web-public. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const db = getDb();
  const policy = db.select().from(schema.policies).where(eq(schema.policies.id, id)).get();
  if (!policy || !policy.filepath || policy.purgedAt) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const bytes = await readFile(policy.filepath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "application/pdf",
        "cache-control": "private, no-store",
        "content-disposition": `inline; filename="${policy.policyNumber ?? "polita"}.pdf"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

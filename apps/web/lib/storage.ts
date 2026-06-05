import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./data/uploads";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

function extFor(file: File): string {
  const fromName = extname(file.name).toLowerCase();
  if (fromName) return fromName;
  return EXT_BY_TYPE[file.type] ?? ".bin";
}

/**
 * Save an uploaded image under UPLOAD_DIR/<dosarId>/<photoId><ext>.
 * Raw images live on disk (GDPR: purged after Emis), never in the DB. Returns the stored path.
 */
export async function saveUpload(dosarId: string, photoId: string, file: File): Promise<string> {
  const dir = resolve(UPLOAD_DIR, dosarId);
  await mkdir(dir, { recursive: true });
  const filepath = join(dir, `${photoId}${extFor(file)}`);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
  return filepath;
}

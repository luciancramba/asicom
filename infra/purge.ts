/**
 * GDPR purge — "process, don't warehouse".
 *
 * Deletes raw photo files N days after a dosar is Emis (default 14), and marks them
 * purged. Structured data (client/vehicle/policy) is retained for operations + reminders.
 * Runs on a systemd timer (wired in PR6), decoupled from the web app so the retention
 * promise holds even during downtime/deploys.
 *
 *   DATABASE_PATH=./data/issuedoc.db node --experimental-strip-types infra/purge.ts
 */
import Database from "better-sqlite3";
import { unlinkSync, existsSync } from "node:fs";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/issuedoc.db";
const RETENTION_DAYS = Number(process.env.PURGE_AFTER_EMIS_DAYS ?? 14);

interface PhotoRow {
  id: string;
  filepath: string;
}

function main(): void {
  const db = new Database(DB_PATH);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();

  const rows = db
    .prepare(
      `SELECT p.id, p.filepath
         FROM photos p
         JOIN dosare d ON d.id = p.dosar_id
        WHERE d.status = 'emis'
          AND d.emis_at IS NOT NULL
          AND d.emis_at < ?
          AND p.purged_at IS NULL`,
    )
    .all(cutoff) as PhotoRow[];

  const mark = db.prepare(`UPDATE photos SET purged_at = ? WHERE id = ?`);
  const stamp = new Date().toISOString();
  let purged = 0;

  for (const row of rows) {
    if (existsSync(row.filepath)) unlinkSync(row.filepath);
    mark.run(stamp, row.id);
    purged += 1;
  }

  console.log(`[purge] removed ${purged} raw photo(s) older than ${RETENTION_DAYS}d post-Emis`);
}

main();

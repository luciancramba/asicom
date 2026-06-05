import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/issuedoc.db";

let instance: BetterSQLite3Database<typeof schema> | undefined;

/** Lazily open the SQLite connection — never runs at build time. */
export function getDb() {
  if (!instance) {
    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = drizzle(sqlite, { schema });
  }
  return instance;
}

export { schema };

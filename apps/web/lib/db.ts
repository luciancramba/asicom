import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/asicom.db";
const MIGRATIONS_DIR = resolve(process.cwd(), "drizzle");

let instance: BetterSQLite3Database<typeof schema> | undefined;

/** Lazily open the SQLite connection — never runs at build time. Applies pending migrations once. */
export function getDb() {
  if (!instance) {
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = drizzle(sqlite, { schema });
    migrate(instance, { migrationsFolder: MIGRATIONS_DIR });
  }
  return instance;
}

export { schema };

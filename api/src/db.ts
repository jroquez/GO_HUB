import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 5,
});

export async function migrate(): Promise<void> {
  const sqlPath = join(dirname(fileURLToPath(import.meta.url)), "sql", "001_init.sql");
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}

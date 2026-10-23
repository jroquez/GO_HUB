import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
import { hashPassword } from "./passwords.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 10) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) are required.");
  process.exit(1);
}

const sqlPath = join(dirname(fileURLToPath(import.meta.url)), "sql", "001_init.sql");
await pool.query(readFileSync(sqlPath, "utf8"));

const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
if (existing.rowCount) {
  console.log("Admin account already exists.");
  await pool.end();
  process.exit(0);
}

const passwordHash = await hashPassword(password);
await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, passwordHash]);
console.log(`Created admin ${email}.`);
await pool.end();

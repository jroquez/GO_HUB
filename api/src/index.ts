import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { migrate, pool } from "./db.js";
import { hashToken, newSessionToken, verifyPassword } from "./passwords.js";
import { planningCenterPreview } from "./planningCenter.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";
const COOKIE = "gohub_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const SECURE_COOKIE = process.env.COOKIE_SECURE === "true";

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

const personSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200).or(z.literal("")).optional(),
  phone: z.string().trim().max(40).optional(),
  congregation: z.enum(["english", "renova"]),
});

type SessionUser = { id: string; email: string };

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

function sameOrigin(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}

async function currentUser(req: Request): Promise<SessionUser | null> {
  const token = req.cookies?.[COOKIE];
  if (typeof token !== "string" || token.length < 20) return null;
  const result = await pool.query<{ id: string; email: string }>(
    `SELECT users.id, users.email
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

function requireUser(req: Request, res: Response, next: NextFunction): void {
  currentUser(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      res.locals.user = user;
      next();
    })
    .catch(next);
}

const app = express();
app.set("trust proxy", "loopback");
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    if (!sameOrigin(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const ip = req.ip ?? "unknown";
    if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
      res.status(429).json({ error: "Too many attempts" });
      return;
    }
    const body = loginSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const found = await pool.query<{ id: string; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email],
    );
    const user = found.rows[0];
    const valid = user ? await verifyPassword(body.password, user.password_hash) : false;
    if (!user || !valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = newSessionToken();
    await pool.query(
      "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '7 days')",
      [user.id, hashToken(token)],
    );
    res.cookie(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: SECURE_COOKIE,
      path: "/",
      maxAge: SESSION_MS,
    });
    res.json({ email: user.email });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE];
    if (typeof token === "string") {
      await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
    }
    res.clearCookie(COOKIE, { path: "/" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireUser, (req, res) => {
  const user = res.locals.user as SessionUser;
  res.json({ email: user.email });
});

app.get("/api/planning-center/people", requireUser, async (_req, res, next) => {
  try {
    res.json(await planningCenterPreview());
  } catch (error) {
    next(error);
  }
});

app.get("/api/people", requireUser, async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, congregation, created_at
       FROM people
       ORDER BY last_name, first_name
       LIMIT 200`,
    );
    res.json({ people: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/people", requireUser, async (req, res, next) => {
  try {
    if (!sameOrigin(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const body = personSchema.parse(req.body);
    const user = res.locals.user as SessionUser;
    const result = await pool.query(
      `INSERT INTO people (first_name, last_name, email, phone, congregation, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, phone, congregation, created_at`,
      [
        body.firstName,
        body.lastName,
        body.email || null,
        body.phone || null,
        body.congregation,
        user.id,
      ],
    );
    res.status(201).json({ person: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/people/:id", requireUser, async (req, res, next) => {
  try {
    if (!sameOrigin(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = z.string().uuid().parse(req.params.id);
    const result = await pool.query("DELETE FROM people WHERE id = $1", [id]);
    if (!result.rowCount) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Server error" });
});

await migrate();
app.listen(PORT, HOST, () => {
  console.log(`GO Hub API listening on ${HOST}:${PORT}`);
});

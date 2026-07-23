import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { hashPassword } from "@/lib/rep-auth";

// App users: real login accounts created by the admin. They can log in, own
// movies, and open any movie shared with their email.

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      name          TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at    BIGINT NOT NULL
    )
  `);
  ensured = true;
}

async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

type Row = { id: string; email: string; name: string; created_at: string };
const toUser = (r: Row) => ({
  id: r.id,
  email: r.email,
  name: r.name ?? "",
  createdAt: Number(r.created_at),
});

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  await ensureTable();
  const { rows } = await pool.query<Row>(
    "SELECT id, email, name, created_at FROM app_users ORDER BY created_at DESC"
  );
  return NextResponse.json({ users: rows.map(toUser) });
}

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  await ensureTable();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const name = String(b.name ?? "").trim();
  if (!email.includes("@"))
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  if (password.length < 4)
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  const exists = await pool.query("SELECT 1 FROM app_users WHERE email=$1", [email]);
  if (exists.rowCount)
    return NextResponse.json(
      { error: "A user with that email already exists." },
      { status: 409 }
    );
  const id = "u-" + crypto.randomBytes(5).toString("hex");
  const { rows } = await pool.query<Row>(
    `INSERT INTO app_users (id, email, name, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5)
     RETURNING id, email, name, created_at`,
    [id, email, name, hashPassword(password), Date.now()]
  );
  return NextResponse.json({ user: toUser(rows[0]) });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  await ensureTable();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required." }, { status: 400 });
  await pool.query("DELETE FROM app_users WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}

// Reset a user's password (passwords are hashed and can't be read back).
export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  await ensureTable();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(b.id ?? "");
  const password = String(b.password ?? "");
  if (!id) return NextResponse.json({ error: "id required." }, { status: 400 });
  if (password.length < 4)
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  await pool.query("UPDATE app_users SET password_hash=$1 WHERE id=$2", [
    hashPassword(password),
    id,
  ]);
  return NextResponse.json({ ok: true });
}

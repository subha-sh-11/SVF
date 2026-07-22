import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { currentEmail } from "@/lib/auth";

const ADMIN = (process.env.ADMIN_EMAIL || "admin@svf.in").toLowerCase();

// Movies live in the shared Postgres DB (not per-browser localStorage) so every
// admin user sees the same list — someone adding a movie is visible to all.

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      release     TEXT DEFAULT '',
      created_at  BIGINT NOT NULL,
      owner_email TEXT
    )
  `);
  await pool
    .query("ALTER TABLE movies ADD COLUMN IF NOT EXISTS owner_email TEXT")
    .catch(() => {});
  ensured = true;
}

type Row = { id: string; name: string; release: string | null; created_at: string };
const toMovie = (r: Row) => ({
  id: r.id,
  name: r.name,
  release: r.release ?? "",
  createdAt: Number(r.created_at),
});

export async function GET() {
  const email = await currentEmail();
  if (!email)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await ensureTable();
  // Admin sees every movie; a user sees only the ones they own or are shared.
  if (email.toLowerCase() === ADMIN) {
    const { rows } = await pool.query<Row>(
      "SELECT id, name, release, created_at FROM movies ORDER BY created_at DESC"
    );
    return NextResponse.json({ movies: rows.map(toMovie) });
  }
  await pool
    .query(
      `CREATE TABLE IF NOT EXISTS movie_shares (
         movie_id TEXT NOT NULL, email TEXT NOT NULL,
         role TEXT NOT NULL DEFAULT 'editor', created_at BIGINT NOT NULL,
         PRIMARY KEY (movie_id, email))`
    )
    .catch(() => {});
  const { rows } = await pool.query<Row>(
    `SELECT DISTINCT m.id, m.name, m.release, m.created_at
       FROM movies m
       LEFT JOIN movie_shares s ON s.movie_id = m.id
      WHERE lower(m.owner_email) = lower($1) OR lower(s.email) = lower($1)
      ORDER BY m.created_at DESC`,
    [email]
  );
  return NextResponse.json({ movies: rows.map(toMovie) });
}

export async function POST(req: Request) {
  const owner = await currentEmail();
  if (!owner)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await ensureTable();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name required." }, { status: 400 });
  const release = String(b.release ?? "").trim();
  const id = "mov-" + crypto.randomBytes(5).toString("hex");
  const { rows } = await pool.query<Row>(
    "INSERT INTO movies (id, name, release, created_at, owner_email) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, release, created_at",
    [id, name, release, Date.now(), owner]
  );
  return NextResponse.json({ movie: toMovie(rows[0]) });
}

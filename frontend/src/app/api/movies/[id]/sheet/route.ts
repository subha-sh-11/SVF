import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { currentEmail } from "@/lib/auth";

// Per-movie spreadsheet blob, shared across collaborators. Clients auto-save
// (debounced) and poll for a higher `version` to pull others' edits.

let ensured = false;
async function ensureTables() {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS movie_sheets (
      movie_id   TEXT PRIMARY KEY,
      data       JSONB NOT NULL,
      version    BIGINT NOT NULL DEFAULT 1,
      updated_by TEXT,
      updated_at BIGINT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS movie_shares (
      movie_id   TEXT NOT NULL,
      email      TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'editor',
      created_at BIGINT NOT NULL,
      PRIMARY KEY (movie_id, email)
    )
  `);
  ensured = true;
}

const whoami = currentEmail; // admin or user session

// Returns "editor" | "viewer" | null (no access). Admin & owner are editors.
async function accessRole(movieId: string, email: string): Promise<string | null> {
  const admin = (process.env.ADMIN_EMAIL || "admin@svf.in").toLowerCase();
  if (email.toLowerCase() === admin) return "editor";
  const owner = await pool.query(
    "SELECT owner_email FROM movies WHERE id = $1",
    [movieId]
  );
  if (owner.rows[0]?.owner_email?.toLowerCase() === email.toLowerCase())
    return "editor";
  const shr = await pool.query(
    "SELECT role FROM movie_shares WHERE movie_id = $1 AND LOWER(email) = LOWER($2)",
    [movieId, email]
  );
  return shr.rows[0]?.role ?? null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await whoami();
  if (!email)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await ensureTables();
  const { id } = await params;
  // owner_email column may not exist yet on old `movies` — add it lazily.
  await pool
    .query("ALTER TABLE movies ADD COLUMN IF NOT EXISTS owner_email TEXT")
    .catch(() => {});
  const role = await accessRole(id, email);
  if (!role)
    return NextResponse.json({ error: "No access." }, { status: 403 });
  // Cheap poll: ?meta=1 returns just the version (no heavy data blob).
  if (new URL(req.url).searchParams.get("meta")) {
    const { rows } = await pool.query(
      "SELECT version, updated_by, updated_at FROM movie_sheets WHERE movie_id = $1",
      [id]
    );
    const r = rows[0];
    return NextResponse.json({
      role,
      version: r ? Number(r.version) : 0,
      updatedBy: r?.updated_by ?? null,
      updatedAt: r ? Number(r.updated_at) : 0,
    });
  }
  const { rows } = await pool.query(
    "SELECT data, version, updated_by, updated_at FROM movie_sheets WHERE movie_id = $1",
    [id]
  );
  const r = rows[0];
  return NextResponse.json({
    role,
    version: r ? Number(r.version) : 0,
    data: r ? r.data : null,
    updatedBy: r?.updated_by ?? null,
    updatedAt: r ? Number(r.updated_at) : 0,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await whoami();
  if (!email)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await ensureTables();
  const { id } = await params;
  await pool
    .query("ALTER TABLE movies ADD COLUMN IF NOT EXISTS owner_email TEXT")
    .catch(() => {});
  const role = await accessRole(id, email);
  if (role !== "editor")
    return NextResponse.json({ error: "Read-only access." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { data?: unknown };
  if (body.data == null)
    return NextResponse.json({ error: "No data." }, { status: 400 });
  // Upsert; version increments on every save (last-write-wins).
  const { rows } = await pool.query(
    `INSERT INTO movie_sheets (movie_id, data, version, updated_by, updated_at)
       VALUES ($1, $2, 1, $3, $4)
     ON CONFLICT (movie_id) DO UPDATE
       SET data = EXCLUDED.data,
           version = movie_sheets.version + 1,
           updated_by = EXCLUDED.updated_by,
           updated_at = EXCLUDED.updated_at
     RETURNING version`,
    [id, JSON.stringify(body.data), email, Date.now()]
  );
  return NextResponse.json({ version: Number(rows[0].version) });
}

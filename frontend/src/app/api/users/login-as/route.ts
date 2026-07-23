import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import {
  SESSION_COOKIE,
  IMPERSONATE_COOKIE,
  verifySession,
  signSession,
} from "@/lib/auth";

// Admin "Login as user" — sets a short-lived impersonation cookie so the admin
// sees exactly what that user sees. The admin's own session stays intact; a
// DELETE clears it (return to admin).

const cookieOpts = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { email?: string };
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!email.includes("@"))
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  // Only allow impersonating a real app user.
  const u = await pool
    .query("SELECT 1 FROM app_users WHERE lower(email)=lower($1)", [email])
    .catch(() => ({ rowCount: 0 }));
  if (!u.rowCount)
    return NextResponse.json({ error: "No such user." }, { status: 404 });
  const res = NextResponse.json({ ok: true, email });
  res.cookies.set(IMPERSONATE_COOKIE, signSession(email), {
    ...cookieOpts,
    maxAge: 60 * 60, // 1 hour
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(IMPERSONATE_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}

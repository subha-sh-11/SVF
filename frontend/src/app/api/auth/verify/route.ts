import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  REP_SESSION_COOKIE,
  REP_SESSION_MAX_AGE,
  signRepSession,
  verifyPassword,
} from "@/lib/rep-auth";
import { publicRep } from "@/lib/rep-data";

export async function POST(req: Request) {
  let email = "";
  let password = "";
  try {
    const b = await req.json();
    email = String(b?.email || "").trim().toLowerCase();
    password = String(b?.password || "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT * FROM reps WHERE lower(email) = $1 AND status = 'approved' LIMIT 1`,
    [email]
  );
  const rep = rows[0];
  if (!rep || !verifyPassword(password, rep.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ representative: publicRep(rep) });
  res.cookies.set(REP_SESSION_COOKIE, signRepSession(rep.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REP_SESSION_MAX_AGE,
  });
  return res;
}

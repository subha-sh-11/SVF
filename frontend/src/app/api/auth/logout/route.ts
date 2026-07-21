import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { REP_SESSION_COOKIE } from "@/lib/rep-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear both admin and representative sessions.
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REP_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

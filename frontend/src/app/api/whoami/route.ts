import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  currentEmail,
  sessionEmail,
  SESSION_COOKIE,
  IMPERSONATE_COOKIE,
} from "@/lib/auth";

// Who is signed in (email + whether admin) — for the header user indicator.
// Also reports impersonation so the UI can show a "Return to admin" banner.
export async function GET() {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ email: null });
  const admin = (process.env.ADMIN_EMAIL || "admin@svf.in").toLowerCase();
  const jar = await cookies();
  const realAdmin = sessionEmail(jar.get(SESSION_COOKIE)?.value);
  const impersonating =
    !!realAdmin && !!sessionEmail(jar.get(IMPERSONATE_COOKIE)?.value);
  return NextResponse.json({
    email,
    isAdmin: email.toLowerCase() === admin,
    impersonating,
  });
}

import { NextResponse } from "next/server";
import { currentEmail } from "@/lib/auth";

// Who is signed in (email + whether admin) — for the header user indicator.
export async function GET() {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ email: null });
  const admin = (process.env.ADMIN_EMAIL || "admin@svf.in").toLowerCase();
  return NextResponse.json({
    email,
    isAdmin: email.toLowerCase() === admin,
  });
}

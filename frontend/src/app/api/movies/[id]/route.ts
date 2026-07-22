import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { currentEmail } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await currentEmail();
  if (!email)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const admin = (process.env.ADMIN_EMAIL || "admin@svf.in").toLowerCase();
  // Only the admin or the movie's owner may delete it.
  const owner = await pool.query("SELECT owner_email FROM movies WHERE id=$1", [id]);
  const ownerEmail = owner.rows[0]?.owner_email?.toLowerCase();
  if (email.toLowerCase() !== admin && ownerEmail && ownerEmail !== email.toLowerCase())
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  await pool.query("DELETE FROM movies WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

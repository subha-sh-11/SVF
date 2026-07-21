import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { currentRep } from "@/lib/rep-data";

export async function GET() {
  const rep = await currentRep();
  if (!rep) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { rows } = await pool.query(
    "SELECT theatre_id FROM assignments WHERE rep_id = $1 ORDER BY theatre_id",
    [rep.id]
  );
  return NextResponse.json({ theatreIds: rows.map((r) => r.theatre_id) });
}

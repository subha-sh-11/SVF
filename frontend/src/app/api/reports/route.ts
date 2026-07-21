import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { currentRep, reportRow } from "@/lib/rep-data";

export async function GET() {
  const rep = await currentRep();
  if (!rep) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { rows } = await pool.query(
    "SELECT * FROM reports WHERE rep_id = $1 ORDER BY submitted_at DESC",
    [rep.id]
  );
  return NextResponse.json({ reports: rows.map(reportRow) });
}

export async function POST(req: Request) {
  const rep = await currentRep();
  if (!rep) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!b.key || !b.theatreId || !b.date || !b.time) {
    return NextResponse.json({ error: "Malformed report." }, { status: 400 });
  }
  const id = "rep_" + crypto.randomBytes(8).toString("hex");
  const { rows } = await pool.query(
    `INSERT INTO reports (
       id, rep_id, key, theatre_id, theatre_name, location, screen_id, screen_name,
       movie_id, movie_title, date, time, total_seats, total_sold, total_unsold,
       actual_collection, max_collection, difference, occupancy, status
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'submitted'
     )
     ON CONFLICT (rep_id, key) DO UPDATE SET
       total_seats=EXCLUDED.total_seats, total_sold=EXCLUDED.total_sold,
       total_unsold=EXCLUDED.total_unsold, actual_collection=EXCLUDED.actual_collection,
       max_collection=EXCLUDED.max_collection, difference=EXCLUDED.difference,
       occupancy=EXCLUDED.occupancy, submitted_at=now()
     RETURNING *`,
    [
      id, rep.id, b.key, b.theatreId, b.theatreName ?? null, b.location ?? null,
      b.screenId ?? null, b.screenName ?? null, b.movieId ?? null, b.movieTitle ?? null,
      b.date, b.time, b.totalSeats ?? 0, b.totalSold ?? 0, b.totalUnsold ?? null,
      b.actualCollection ?? 0, b.maxCollection ?? 0, b.difference ?? null, b.occupancy ?? null,
    ]
  );
  return NextResponse.json({ report: reportRow(rows[0]) });
}

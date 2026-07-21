import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { SESSION_COOKIE, USER_SESSION_COOKIE, verifySession } from "@/lib/auth";

// Readable by the user (movies viewer) or admin — used to fill the movie sheet.
export async function GET() {
  const store = await cookies();
  const ok =
    verifySession(store.get(USER_SESSION_COOKIE)?.value) ||
    verifySession(store.get(SESSION_COOKIE)?.value);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT theatre_id, screen_name, movie_title, date, time,
            total_sold, actual_collection
       FROM reports
       ORDER BY submitted_at DESC`
  );
  return NextResponse.json({
    reports: rows.map((r) => ({
      theatreId: r.theatre_id,
      screenName: r.screen_name,
      movieTitle: r.movie_title,
      date: r.date,
      time: r.time,
      totalSold: r.total_sold,
      actualCollection: Number(r.actual_collection),
    })),
  });
}

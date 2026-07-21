import { cookies } from "next/headers";
import { pool } from "./db";
import { REP_SESSION_COOKIE, verifyRepSession } from "./rep-auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function publicRep(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.phone,
    role: "Theatre Representative",
  };
}

export async function repById(id: string) {
  const { rows } = await pool.query(
    "SELECT id, name, email, phone, region, color, status, role_id FROM reps WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

/** Resolve the logged-in, approved rep from the rep_session cookie, or null. */
export async function currentRep() {
  const store = await cookies();
  const id = verifyRepSession(store.get(REP_SESSION_COOKIE)?.value);
  if (!id) return null;
  const rep = await repById(id);
  return rep && rep.status === "approved" ? rep : null;
}

export function reportRow(r: any) {
  return {
    key: r.key,
    theatreId: r.theatre_id,
    theatreName: r.theatre_name,
    location: r.location,
    screenId: r.screen_id,
    screenName: r.screen_name,
    movieId: r.movie_id,
    movieTitle: r.movie_title,
    date: r.date,
    time: r.time,
    totalSeats: r.total_seats,
    totalSold: r.total_sold,
    totalUnsold: r.total_unsold,
    actualCollection: Number(r.actual_collection),
    maxCollection: Number(r.max_collection),
    difference: r.difference == null ? undefined : Number(r.difference),
    occupancy: r.occupancy,
    submittedAt: r.submitted_at,
    status: r.status,
  };
}

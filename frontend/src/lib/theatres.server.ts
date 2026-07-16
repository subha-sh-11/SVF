import { pool } from "./db";
import { Theatre } from "@/data/theatres";

/** Load all theatres from Postgres (the shared source of truth). */
export async function getTheatres(): Promise<Theatre[]> {
  const { rows } = await pool.query(
    `SELECT id, sno, district, centre, theatre, format, type,
            screen_count, capacity, hfc_total, screens
       FROM theatres
       ORDER BY id`
  );
  return rows.map((r) => ({
    id: r.id,
    sno: r.sno,
    district: r.district,
    centre: r.centre,
    theatre: r.theatre,
    format: r.format,
    type: r.type,
    screen_count: r.screen_count,
    capacity: Number(r.capacity),
    hfc_total: Number(r.hfc_total), // BIGINT comes back as string
    screens: r.screens, // JSONB is already parsed
  }));
}

"use client";

import { RateSlab } from "@/data/theatres";

// Per-movie, per-day, per-theatre rate overrides.
// shape: { [dayName]: { [theatreId]: RateSlab[][] } }  (outer array = per screen)
type Store = Record<string, Record<string, RateSlab[][]>>;

function keyFor(movieId: string) {
  return `svf.ratecard.${movieId}`;
}

function loadAll(movieId: string): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(keyFor(movieId)) || "{}");
  } catch {
    return {};
  }
}

/** Slabs (per screen) for a theatre on a given day — saved override, else defaults. */
export function getTheatreSlabs(
  movieId: string,
  dayName: string,
  theatreId: number,
  defaults: RateSlab[][]
): RateSlab[][] {
  const all = loadAll(movieId);
  const v = all?.[dayName]?.[String(theatreId)];
  return Array.isArray(v) ? v : defaults;
}

export function saveTheatreSlabs(
  movieId: string,
  dayName: string,
  theatreId: number,
  perScreen: RateSlab[][]
) {
  const all = loadAll(movieId);
  all[dayName] = all[dayName] || {};
  all[dayName][String(theatreId)] = perScreen;
  localStorage.setItem(keyFor(movieId), JSON.stringify(all));
}

"use client";

import { useSyncExternalStore } from "react";
import { RateSlab } from "@/data/theatres";

const KEY = "svf.rates.v1";

// key `${theatreId}:${screenIdx}` -> slabs
type Overrides = Record<string, RateSlab[]>;

let cache: Overrides | null = null;
const listeners = new Set<() => void>();

function load(): Overrides {
  if (cache) return cache;
  if (typeof window === "undefined") return {};
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    cache = {};
  }
  return cache!;
}

function persist(next: Overrides) {
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useRateOverrides(): Overrides {
  return useSyncExternalStore(subscribe, load, () => ({}));
}

export function screenKey(theatreId: number, screenIdx: number) {
  return `${theatreId}:${screenIdx}`;
}

export function setScreenSlabs(
  theatreId: number,
  screenIdx: number,
  slabs: RateSlab[]
) {
  const next = { ...load() };
  next[screenKey(theatreId, screenIdx)] = slabs;
  persist(next);
}

export function resetScreen(theatreId: number, screenIdx: number) {
  const next = { ...load() };
  delete next[screenKey(theatreId, screenIdx)];
  persist(next);
}

export function toNum(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Full house for a screen = sum(rate × seats) across slabs. */
export function slabsHfc(slabs: RateSlab[]): number {
  return slabs.reduce((sum, s) => sum + toNum(s.rate) * toNum(s.aud), 0);
}

/** Total seats for a screen = sum(seats). */
export function slabsSeats(slabs: RateSlab[]): number {
  return slabs.reduce((sum, s) => sum + toNum(s.aud), 0);
}

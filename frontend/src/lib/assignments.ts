"use client";

import { useSyncExternalStore } from "react";

const KEY = "svf.assignments.v1";

// theatreId -> repId
type Assignments = Record<number, string>;

let cache: Assignments = {};
let loaded = false;
const listeners = new Set<() => void>();

function load(): Assignments {
  if (loaded) return cache;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      cache = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      cache = {};
    }
  }
  return cache;
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(cache));
  }
  listeners.forEach((l) => l());
}

export function assign(theatreId: number, repId: string | null) {
  load();
  cache = { ...cache };
  if (repId) cache[theatreId] = repId;
  else delete cache[theatreId];
  persist();
}

export function assignMany(theatreIds: number[], repId: string | null) {
  load();
  cache = { ...cache };
  for (const id of theatreIds) {
    if (repId) cache[id] = repId;
    else delete cache[id];
  }
  persist();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAssignments(): Assignments {
  return useSyncExternalStore(subscribe, load, () => ({}));
}

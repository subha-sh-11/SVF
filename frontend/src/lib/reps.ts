"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_REPS,
  REP_COLORS,
  Representative,
  RepStatus,
} from "@/data/representatives";

const KEY = "svf.reps.v1";

let cache: Representative[] | null = null;
const listeners = new Set<() => void>();

function load(): Representative[] {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_REPS;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Representative[]) : DEFAULT_REPS;
  } catch {
    cache = DEFAULT_REPS;
  }
  return cache;
}

function persist(next: Representative[]) {
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

export function useReps(): Representative[] {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_REPS);
}

function newId(): string {
  return "rep-" + Math.random().toString(36).slice(2, 9);
}

export type RepInput = {
  name: string;
  phone: string;
  email: string;
  region: string;
};

export function addRep(data: RepInput, status: RepStatus = "approved"): string {
  const list = load();
  const id = newId();
  const color = REP_COLORS[list.length % REP_COLORS.length];
  persist([...list, { id, color, status, ...data }]);
  return id;
}

export function updateRep(id: string, data: Partial<RepInput>) {
  persist(load().map((r) => (r.id === id ? { ...r, ...data } : r)));
}

export function deleteRep(id: string) {
  persist(load().filter((r) => r.id !== id));
}

export function setRepStatus(id: string, status: RepStatus) {
  persist(load().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function setRepRole(id: string, roleId: string | undefined) {
  persist(load().map((r) => (r.id === id ? { ...r, roleId } : r)));
}

export function repMap(list: Representative[]): Record<string, Representative> {
  return Object.fromEntries(list.map((r) => [r.id, r]));
}

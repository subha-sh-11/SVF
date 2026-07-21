"use client";

import { useSyncExternalStore } from "react";

export type Movie = {
  id: string;
  name: string;
  release: string; // free text / date
  createdAt: number;
};

const KEY = "svf.movies.v1";

let cache: Movie[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: Movie[] = [];

function load(): Movie[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Movie[]) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function persist(next: Movie[]) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMovies(): Movie[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

function newId() {
  return "mov-" + Math.random().toString(36).slice(2, 9);
}

export function addMovie(name: string, release: string): string {
  const id = newId();
  persist([{ id, name, release, createdAt: Date.now() }, ...load()]);
  return id;
}

export function deleteMovie(id: string) {
  persist(load().filter((m) => m.id !== id));
}

export function getMovie(id: string): Movie | undefined {
  return load().find((m) => m.id === id);
}

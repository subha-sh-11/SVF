"use client";

import { useSyncExternalStore } from "react";

export type Member = {
  id: string;
  name: string;
  email: string; // login identifier
  mobile: string;
  region: string;
  roleId: string;
  createdAt: number;
};

const KEY = "svf.users.v1";

let cache: Member[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: Member[] = [];

function load(): Member[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Member[]) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function persist(next: Member[]) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useUsers(): Member[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

function newId() {
  return "user-" + Math.random().toString(36).slice(2, 9);
}

export type UserInput = {
  name: string;
  email: string;
  mobile: string;
  region: string;
  roleId: string;
  createdAt: number;
};

export function addUser(data: UserInput): string {
  const id = newId();
  persist([...load(), { id, ...data }]);
  return id;
}

export function deleteUser(id: string) {
  persist(load().filter((u) => u.id !== id));
}

export function setUserRole(id: string, roleId: string) {
  persist(load().map((u) => (u.id === id ? { ...u, roleId } : u)));
}

/** Case-insensitive email uniqueness check. */
export function emailExists(email: string): boolean {
  const e = email.trim().toLowerCase();
  return load().some((u) => u.email.trim().toLowerCase() === e);
}

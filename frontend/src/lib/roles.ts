"use client";

import { useSyncExternalStore } from "react";

export type Permission = {
  key: string;
  label: string;
  description: string;
};

export const PERMISSIONS: Permission[] = [
  { key: "view_dashboard", label: "View dashboard", description: "See analytics and coverage" },
  { key: "view_theatres", label: "View theatres", description: "Browse the theatre tree & details" },
  { key: "edit_rates", label: "Edit rate slabs", description: "Change rates and full-house values" },
  { key: "assign_reps", label: "Assign representatives", description: "Attach reps to theatres" },
  { key: "manage_reps", label: "Manage representatives", description: "Approve, reject & edit reps" },
  { key: "manage_roles", label: "Manage roles", description: "Create roles & set permissions" },
  { key: "export_data", label: "Export data", description: "Download reports (PDF/Excel)" },
];

export const ALL_PERMS = PERMISSIONS.map((p) => p.key);

export type Role = {
  id: string;
  name: string;
  permissions: string[];
  system?: boolean; // system roles can't be deleted
};

const KEY = "svf.roles.v1";

const DEFAULT_ROLES: Role[] = [
  { id: "role-admin", name: "Super Admin", permissions: [...ALL_PERMS], system: true },
  {
    id: "role-manager",
    name: "Manager",
    permissions: ["view_dashboard", "view_theatres", "edit_rates", "assign_reps", "export_data"],
  },
  {
    id: "role-rep",
    name: "Representative",
    permissions: ["view_theatres"],
    system: true,
  },
];

let cache: Role[] | null = null;
const listeners = new Set<() => void>();

function load(): Role[] {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_ROLES;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Role[]) : DEFAULT_ROLES;
  } catch {
    cache = DEFAULT_ROLES;
  }
  return cache!;
}

function persist(next: Role[]) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useRoles(): Role[] {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_ROLES);
}

function newId() {
  return "role-" + Math.random().toString(36).slice(2, 9);
}

export function addRole(name: string, permissions?: string[]): string {
  const id = newId();
  persist([
    ...load(),
    { id, name, permissions: permissions ?? ["view_theatres"] },
  ]);
  return id;
}

export function renameRole(id: string, name: string) {
  persist(load().map((r) => (r.id === id ? { ...r, name } : r)));
}

export function deleteRole(id: string) {
  persist(load().filter((r) => r.id !== id || r.system));
}

export function togglePermission(id: string, perm: string) {
  persist(
    load().map((r) => {
      if (r.id !== id) return r;
      const has = r.permissions.includes(perm);
      return {
        ...r,
        permissions: has
          ? r.permissions.filter((p) => p !== perm)
          : [...r.permissions, perm],
      };
    })
  );
}

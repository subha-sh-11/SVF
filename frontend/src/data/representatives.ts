export type Representative = {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  color: string; // accent for avatar/badge
};

export const REP_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
  "#b47e2f",
  "#0891b2",
];

// Representatives now start empty and are created by the admin via the
// "Assign representative" form. Managed at runtime in lib/reps.ts.
export const DEFAULT_REPS: Representative[] = [];

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

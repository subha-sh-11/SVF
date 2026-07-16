"use client";

import { Theatre } from "@/data/theatres";
import { useReps } from "@/lib/reps";
import { useAssignments } from "@/lib/assignments";
import RepAvatar from "./RepAvatar";

export default function CoverageCard({ theatres }: { theatres: Theatre[] }) {
  const assignments = useAssignments();
  const reps = useReps();

  const total = theatres.length;
  const assigned = theatres.filter((t) => assignments[t.id]).length;
  const pct = Math.round((assigned / total) * 100);

  const load: Record<string, number> = {};
  for (const t of theatres) {
    const r = assignments[t.id];
    if (r) load[r] = (load[r] || 0) + 1;
  }
  const ranked = reps
    .map((r) => ({ rep: r, n: load[r.id] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-strong">
          Representative coverage
        </h3>
        <span className="text-xs text-faint">
          {assigned} / {total} assigned
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-chip">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-faint">
        {pct}% covered · {total - assigned} theatres unassigned
      </p>

      <div className="mt-4 space-y-2">
        {ranked.length === 0 && (
          <p className="text-xs text-faint">
            No assignments yet — assign representatives on the Theatres page.
          </p>
        )}
        {ranked.map(({ rep, n }) => (
          <div key={rep.id} className="flex items-center gap-3">
            <RepAvatar name={rep.name} color={rep.color} size={26} />
            <span className="flex-1 text-sm text-body">{rep.name}</span>
            <span className="text-xs font-medium text-faint">
              {n} theatres
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

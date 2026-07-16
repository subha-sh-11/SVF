import { Theatre, statsOf } from "@/data/theatres";
import { getTheatres } from "@/lib/theatres.server";
import CoverageCard from "@/components/CoverageCard";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-strong">
        {value}
      </p>
    </div>
  );
}

function formatBreakdown(theatres: Theatre[]) {
  const counts: Record<string, number> = {};
  for (const t of theatres) {
    for (const s of t.screens) {
      const f = (s.format || "Unspecified").toString().trim().toUpperCase();
      counts[f] = (counts[f] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function topCentres(theatres: Theatre[]) {
  const counts: Record<string, number> = {};
  for (const t of theatres) counts[t.centre] = (counts[t.centre] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

export default async function DashboardPage() {
  const theatres = await getTheatres();
  const STATS = statsOf(theatres);
  const formats = formatBreakdown(theatres);
  const centres = topCentres(theatres);
  const maxFmt = Math.max(...formats.map((f) => f[1]), 1);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-strong">
          Dashboard
        </h2>
        <p className="mt-0.5 text-sm text-faint">
          Nizam territory overview — theatres, screens and representative coverage.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Theatres" value={STATS.total} />
        <Metric label="Multiplexes" value={STATS.multiplexes} />
        <Metric label="Single Screens" value={STATS.singles} />
        <Metric label="Screens" value={STATS.screens} />
        <Metric label="Centres" value={STATS.centres} />
        <Metric
          label="Total Seats"
          value={STATS.capacity.toLocaleString("en-IN")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CoverageCard theatres={theatres} />

        {/* Screen formats */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-strong">
            Screens by format
          </h3>
          <div className="mt-4 space-y-2.5">
            {formats.map(([fmt, n]) => (
              <div key={fmt} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-body">
                  {fmt}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-chip">
                  <div
                    className="h-full rounded-full bg-brand-400"
                    style={{ width: `${(n / maxFmt) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-faint">
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top centres */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-strong">
            Top centres
          </h3>
          <div className="mt-4 space-y-1">
            {centres.map(([centre, n], i) => (
              <div
                key={centre}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-4 text-right text-xs text-faint">
                    {i + 1}
                  </span>
                  <span className="text-body">{centre}</span>
                </span>
                <span className="text-xs font-medium text-faint">
                  {n} theatres
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

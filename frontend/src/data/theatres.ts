export type RateSlab = {
  rate: number | string | null;
  aud: number | string | null;
};

export type Screen = {
  name: string | null;
  format: string | null;
  hfc: number | string | null;
  hfa: number | string | null;
  slabs: RateSlab[];
};

export type Theatre = {
  id: number;
  sno: number;
  district: string;
  centre: string;
  theatre: string;
  format: string | null;
  type: "multiplex" | "single";
  screen_count: number;
  capacity: number;
  hfc_total: number;
  screens: Screen[];
};

export type DistrictSummary = {
  name: string;
  total: number;
  multiplexes: number;
  singles: number;
};

/** District summaries derived from a theatre list (sorted by size). */
export function districtsOf(theatres: Theatre[]): DistrictSummary[] {
  const map = new Map<string, DistrictSummary>();
  for (const t of theatres) {
    const d =
      map.get(t.district) ||
      { name: t.district, total: 0, multiplexes: 0, singles: 0 };
    d.total++;
    if (t.type === "multiplex") d.multiplexes++;
    else d.singles++;
    map.set(t.district, d);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Headline stats derived from a theatre list. */
export function statsOf(theatres: Theatre[]) {
  return {
    total: theatres.length,
    multiplexes: theatres.filter((t) => t.type === "multiplex").length,
    singles: theatres.filter((t) => t.type === "single").length,
    screens: theatres.reduce((n, t) => n + t.screen_count, 0),
    centres: new Set(theatres.map((t) => t.centre)).size,
    capacity: theatres.reduce((n, t) => n + (t.capacity || 0), 0),
  };
}

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

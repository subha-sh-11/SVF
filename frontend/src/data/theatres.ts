import raw from "./theatres.json";

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

export const THEATRES: Theatre[] = raw as Theatre[];

export const MULTIPLEXES = THEATRES.filter((t) => t.type === "multiplex");
export const SINGLE_SCREENS = THEATRES.filter((t) => t.type === "single");

export type DistrictSummary = {
  name: string;
  total: number;
  multiplexes: number;
  singles: number;
};

export const DISTRICTS: DistrictSummary[] = (() => {
  const map = new Map<string, DistrictSummary>();
  for (const t of THEATRES) {
    const d =
      map.get(t.district) ||
      { name: t.district, total: 0, multiplexes: 0, singles: 0 };
    d.total++;
    if (t.type === "multiplex") d.multiplexes++;
    else d.singles++;
    map.set(t.district, d);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
})();

export const STATS = {
  total: THEATRES.length,
  multiplexes: MULTIPLEXES.length,
  singles: SINGLE_SCREENS.length,
  screens: THEATRES.reduce((n, t) => n + t.screen_count, 0),
  centres: new Set(THEATRES.map((t) => t.centre)).size,
  capacity: THEATRES.reduce((n, t) => n + (t.capacity || 0), 0),
};

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

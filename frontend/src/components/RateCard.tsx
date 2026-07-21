"use client";

import { useEffect, useMemo, useState } from "react";
import { Theatre, RateSlab, inr } from "@/data/theatres";
import { getTheatreSlabs, saveTheatreSlabs } from "@/lib/ratecard";

type Draft = { rate: string; aud: string }[][]; // per screen -> classes

function toDraft(perScreen: RateSlab[][]): Draft {
  return perScreen.map((slabs) =>
    (slabs || []).map((s) => ({
      rate: s.rate == null ? "" : String(s.rate),
      aud: s.aud == null ? "" : String(s.aud),
    }))
  );
}

function fromDraft(d: Draft): RateSlab[][] {
  return d.map((classes) =>
    classes.map((c) => ({
      rate: c.rate === "" ? null : Number(c.rate),
      aud: c.aud === "" ? null : Number(c.aud),
    }))
  );
}

export default function RateCard({
  theatres,
  theatreId,
  dayName,
  movieId,
  onApply,
  onClose,
}: {
  theatres: Theatre[];
  theatreId?: number | null;
  dayName: string;
  movieId: string;
  onApply: (theatreId: number, perScreen: RateSlab[][]) => void;
  onClose: () => void;
}) {
  const [tid, setTid] = useState<number | null>(
    theatreId ?? theatres[0]?.id ?? null
  );
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft>([]);

  const t = useMemo(() => theatres.find((x) => x.id === tid) || null, [theatres, tid]);

  // (re)seed draft from saved override or the theatre defaults whenever theatre/day changes
  useEffect(() => {
    if (!t) return;
    const defaults = t.screens.map((s) => s.slabs || []);
    setDraft(toDraft(getTheatreSlabs(movieId, dayName, t.id, defaults)));
  }, [t, movieId, dayName]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const matches = theatres.filter(
    (x) =>
      !q ||
      x.theatre.toLowerCase().includes(q.toLowerCase()) ||
      x.centre.toLowerCase().includes(q.toLowerCase())
  );

  function setCell(si: number, ci: number, field: "rate" | "aud", val: string) {
    setDraft((d) =>
      d.map((classes, i) =>
        i !== si
          ? classes
          : classes.map((c, j) => (j !== ci ? c : { ...c, [field]: val }))
      )
    );
  }
  function addClass(si: number) {
    setDraft((d) => d.map((classes, i) => (i !== si ? classes : [...classes, { rate: "", aud: "" }])));
  }
  function removeClass(si: number, ci: number) {
    setDraft((d) => d.map((classes, i) => (i !== si ? classes : classes.filter((_, j) => j !== ci))));
  }

  function save() {
    if (!t) return;
    const perScreen = fromDraft(draft);
    saveTheatreSlabs(movieId, dayName, t.id, perScreen);
    onApply(t.id, perScreen);
    onClose();
  }

  const num = (v: string) => (v === "" ? 0 : Number(v) || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line shadow-pop"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-strong">Rate card</h3>
            <p className="text-xs text-faint">
              Editable prices &amp; seats — applies to{" "}
              <b className="text-body">{dayName}</b> only.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-faint hover:bg-chip hover:text-body"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-line bg-muted/40 px-5 py-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search theatre or centre…"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400 sm:max-w-xs"
          />
          <select
            value={tid ?? ""}
            onChange={(e) => setTid(Number(e.target.value))}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-body outline-none focus:border-brand-400 sm:max-w-sm"
          >
            {matches.slice(0, 200).map((x) => (
              <option key={x.id} value={x.id}>
                {x.centre} · {x.theatre}
                {x.type === "multiplex" ? " (multiplex)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!t ? (
            <p className="text-sm text-faint">Select a theatre.</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <h4 className="text-lg font-semibold text-strong">{t.theatre}</h4>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${
                    t.type === "multiplex"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                  }`}
                >
                  {t.type}
                </span>
                <span className="text-xs text-faint">
                  {t.district} · {t.centre} · {t.screen_count} screen
                  {t.screen_count > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {t.screens.map((s, si) => {
                  const classes = draft[si] || [];
                  const cap = classes.reduce((n, c) => n + num(c.aud), 0);
                  const gross = classes.reduce((n, c) => n + num(c.rate) * num(c.aud), 0);
                  return (
                    <div key={si} className="overflow-hidden rounded-lg border border-line">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted px-3 py-2">
                        <span className="text-sm font-semibold text-strong">
                          {s.name || `Screen ${si + 1}`}
                          {s.format ? (
                            <span className="ml-2 rounded bg-chip px-1.5 py-0.5 text-[11px] font-medium text-body">
                              {s.format}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-faint">
                          Capacity {inr(cap)} · House-full ₹{inr(gross)}
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-line text-left text-xs text-faint">
                            <th className="px-3 py-1.5 font-medium">Class</th>
                            <th className="px-3 py-1.5 font-medium">Price (₹)</th>
                            <th className="px-3 py-1.5 font-medium">Seats (Aud)</th>
                            <th className="px-3 py-1.5 text-right font-medium">Class gross (₹)</th>
                            <th className="w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {classes.map((c, ci) => (
                            <tr key={ci} className="border-b border-line last:border-0">
                              <td className="px-3 py-1.5 text-body">Class {ci + 1}</td>
                              <td className="px-3 py-1.5">
                                <input
                                  type="number"
                                  value={c.rate}
                                  onChange={(e) => setCell(si, ci, "rate", e.target.value)}
                                  className="w-24 rounded border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-brand-400"
                                />
                              </td>
                              <td className="px-3 py-1.5">
                                <input
                                  type="number"
                                  value={c.aud}
                                  onChange={(e) => setCell(si, ci, "aud", e.target.value)}
                                  className="w-24 rounded border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-brand-400"
                                />
                              </td>
                              <td className="px-3 py-1.5 text-right text-emerald-600 dark:text-emerald-400">
                                ₹{inr(num(c.rate) * num(c.aud))}
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <button
                                  onClick={() => removeClass(si, ci)}
                                  title="Remove class"
                                  className="rounded p-1 text-faint hover:bg-chip hover:text-rose-500"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path d="M6 6l12 12M18 6L6 18" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2">
                        <button
                          onClick={() => addClass(si)}
                          className="rounded border border-dashed border-line px-2 py-1 text-[11px] font-medium text-body hover:border-brand-400 hover:text-brand-700"
                        >
                          + Add class
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-faint hover:bg-chip"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!t}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

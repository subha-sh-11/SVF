"use client";

import { useEffect, useRef } from "react";
import "@univerjs/presets/lib/styles/preset-sheets-core.css";

/* eslint-disable @typescript-eslint/no-explicit-any */

// A full Excel/Google-Sheets-like spreadsheet (ribbon, formatting, formulas)
// powered by Univer. Loads an IWorkbookData snapshot and reports edits back.
export default function UniverSheet({
  snapshot,
  onChange,
  onReady,
}: {
  snapshot: any;
  onChange?: (snap: any) => void;
  onReady?: (api: any, phase: "mount" | "replace") => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  const apiRef = useRef<any>(null);
  const lastRef = useRef("");
  const sigRef = useRef<(o: unknown) => string>((o) => JSON.stringify(o));
  const replacingRef = useRef(false); // applying an external snapshot in place
  const initialSnapRef = useRef(snapshot); // the snapshot we mounted with
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  // Excel-style Shift+click column-header range selection.
  const shiftRef = useRef(false); // Shift held at the last pointer/key event
  const anchorColRef = useRef<number | null>(null); // last plain column click
  const colEvtDisposeRef = useRef<any>(null); // ColumnHeaderClick disposer

  useEffect(() => {
    let disposed = false;
    let saveIv: ReturnType<typeof setInterval> | undefined;
    // Track whether Shift is held at click time (for column range selection).
    const onKey = (e: KeyboardEvent) => (shiftRef.current = e.shiftKey);
    const onDown = (e: MouseEvent) => (shiftRef.current = e.shiftKey);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("pointerdown", onDown, true);
    (async () => {
      const presets = await import("@univerjs/presets");
      const { createUniver, LocaleType, mergeLocales, defaultTheme } =
        presets as any;
      const { UniverSheetsCorePreset } = await import(
        "@univerjs/presets/preset-sheets-core"
      );
      const enUS = (
        (await import(
          "@univerjs/presets/preset-sheets-core/locales/en-US"
        )) as any
      ).default;
      if (disposed || !containerRef.current) return;

      const { univer, univerAPI } = createUniver({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: mergeLocales(enUS) },
        theme: defaultTheme,
        presets: [UniverSheetsCorePreset({ container: containerRef.current })],
      });
      univerRef.current = univer;
      apiRef.current = univerAPI;
      // Dev aid: expose the facade so behaviors can be verified from the console.
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV !== "production"
      )
        (window as any).__univerAPI = univerAPI;

      univerAPI.createWorkbook(
        snapshot || {
          id: "wb-empty",
          sheetOrder: ["s1"],
          sheets: {
            s1: {
              id: "s1",
              name: "Sheet1",
              cellData: {},
              rowCount: 200,
              columnCount: 40,
            },
          },
        }
      );
      // Hand the facade API to the parent so it can drive the sheet (e.g. the
      // special-shows column toggle).
      try {
        onReadyRef.current?.(univerAPI, "mount");
      } catch {}

      // Excel-style column range selection: click a column header, then
      // Shift+click another → select every column between them (inclusive).
      // We use Univer's ColumnHeaderClick event (authoritative clicked column)
      // and override the selection with the correct anchor→target range.
      try {
        const EVT =
          univerAPI.Event?.ColumnHeaderClick ?? "ColumnHeaderClick";
        colEvtDisposeRef.current = univerAPI.addEvent(EVT, (p: any) => {
          const col = p?.column;
          if (typeof col !== "number") return;
          const ws = p.worksheet;
          const wb = p.workbook;
          if (
            shiftRef.current &&
            anchorColRef.current != null &&
            anchorColRef.current !== col &&
            ws &&
            wb
          ) {
            const a = Math.min(anchorColRef.current, col);
            const b = Math.max(anchorColRef.current, col);
            try {
              const maxRows = ws.getMaxRows?.() ?? 1000;
              const range = ws.getRange({
                startRow: 0,
                endRow: Math.max(0, maxRows - 1),
                startColumn: a,
                endColumn: b,
                rangeType: 2, // RANGE_TYPE.COLUMN
              });
              wb.setActiveRange(range);
            } catch {}
            // keep the anchor so further shift-clicks extend from the same start
          } else {
            anchorColRef.current = col; // new anchor (plain click)
          }
        });
      } catch {}
      // Stable content signature — ignore Univer's volatile "rev" counters so we
      // don't fire a "change" (and a save) on every poll when nothing changed.
      const sig = (o: unknown) =>
        JSON.stringify(o, (k, v) => (k === "rev" ? undefined : v));
      sigRef.current = sig;
      // Seed from the ACTUAL created workbook so the first real edit — not the
      // initial state — triggers the first save.
      try {
        const wb0 = univerAPI.getActiveWorkbook?.();
        const snap0 = wb0?.getSnapshot ? wb0.getSnapshot() : wb0?.save?.();
        lastRef.current = sig(snap0 ?? snapshot ?? "");
      } catch {
        lastRef.current = sig(snapshot ?? "");
      }

      // Poll the workbook snapshot for edits → notify the parent (debounced feel).
      saveIv = setInterval(() => {
        if (replacingRef.current) return; // mid external-update; don't echo it back
        try {
          const wb = univerAPI.getActiveWorkbook?.();
          if (!wb) return;
          const snap = wb.getSnapshot ? wb.getSnapshot() : wb.save?.();
          if (!snap) return;
          const s = sig(snap);
          if (s !== lastRef.current) {
            lastRef.current = s;
            onChangeRef.current?.(snap);
          }
        } catch {}
      }, 1500);
    })();

    return () => {
      disposed = true;
      if (saveIv) clearInterval(saveIv);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("pointerdown", onDown, true);
      try {
        colEvtDisposeRef.current?.dispose?.();
      } catch {}
      try {
        univerRef.current?.dispose?.();
      } catch {}
      univerRef.current = null;
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the parent passes a NEW snapshot (a remote collaborator's save), update
  // the workbook IN PLACE — dispose the current unit + recreate inside the same
  // engine — instead of remounting the whole component (which blanks the screen).
  useEffect(() => {
    if (snapshot === initialSnapRef.current) return; // that's the mount value
    const api = apiRef.current;
    if (!api || !snapshot) return;
    try {
      const sig = sigRef.current;
      // Skip if the incoming content matches what's already shown (our own save).
      if (sig(snapshot) === lastRef.current) return;
      replacingRef.current = true;
      const cur = api.getActiveWorkbook?.();
      const id = cur?.getId?.();
      // Dispose the old unit first, then recreate with the SAME id — avoids an
      // id collision and keeps ids stable (no sync ping-pong). Fast because the
      // Univer engine stays alive (only the workbook data is swapped).
      if (id && api.disposeUnit) {
        try {
          api.disposeUnit(id);
        } catch {}
      }
      api.createWorkbook(snapshot);
      lastRef.current = sig(snapshot);
      try {
        onReadyRef.current?.(api, "replace");
      } catch {}
      setTimeout(() => (replacingRef.current = false), 400);
    } catch {
      replacingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 0 }}
    />
  );
}

"use client";

import { useEffect, useRef } from "react";
import "@univerjs/presets/lib/styles/preset-sheets-core.css";

/* eslint-disable @typescript-eslint/no-explicit-any */

// A full Excel/Google-Sheets-like spreadsheet (ribbon, formatting, formulas)
// powered by Univer. Loads an IWorkbookData snapshot and reports edits back.
export default function UniverSheet({
  snapshot,
  onChange,
}: {
  snapshot: any;
  onChange?: (snap: any) => void;
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

  useEffect(() => {
    let disposed = false;
    let saveIv: ReturnType<typeof setInterval> | undefined;
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

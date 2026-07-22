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
    // Re-init only on mount; external snapshot swaps are done via a `key` remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 0 }}
    />
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useMovies,
  addMovie,
  deleteMovie,
  refreshMovies,
} from "@/lib/movies";

export default function MoviesPage() {
  const movies = useMovies();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");
  const [dragging, setDragging] = useState(false);
  const [me, setMe] = useState<{
    email: string | null;
    isAdmin?: boolean;
    impersonating?: boolean;
  }>({
    email: null,
  });

  useEffect(() => {
    fetch("/api/whoami", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  }

  async function returnToAdmin() {
    await fetch("/api/users/login-as", { method: "DELETE" }).catch(() => {});
    window.location.reload();
  }

  // Keep the shared list fresh — refetch when the tab regains focus and on a
  // light interval, so uploads by other users show up here too.
  useEffect(() => {
    refreshMovies();
    const onFocus = () => refreshMovies();
    window.addEventListener("focus", onFocus);
    const t = setInterval(refreshMovies, 20000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(t);
    };
  }, []);

  // gzip an object → { __gz: base64 } (matches the sheet loader's decompress).
  async function compress(obj: unknown): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CS = (globalThis as any).CompressionStream;
    if (!CS) return obj; // fallback: send raw
    const stream = new Blob([JSON.stringify(obj)])
      .stream()
      .pipeThrough(new CS("gzip"));
    const buf = await new Response(stream).arrayBuffer();
    const b64: string = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.readAsDataURL(new Blob([buf]));
    });
    return { __gz: b64 };
  }

  // Read an uploaded Excel → convert to a spreadsheet, create the entry, and
  // save it so it shows up as a card that opens directly.
  async function uploadFile(file: File) {
    if (!/\.xlsx$/i.test(file.name)) {
      setUploadErr("Please upload an Excel .xlsx file.");
      return;
    }
    setUploadErr("");
    setUploadMsg(`Uploading “${file.name}”…`);
    setUploading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ExcelJSmod: any = await import("exceljs");
      const ExcelJS = ExcelJSmod.default ?? ExcelJSmod;
      const { excelToUniverSnapshot, parseThemePalette, setThemePalette } =
        await import("@/lib/xlsxToUniver");
      const buf = await file.arrayBuffer();
      // Pull the file's real theme palette so colors match exactly.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const JSZipMod: any = await import("jszip");
        const JSZip = JSZipMod.default ?? JSZipMod;
        const zip = await JSZip.loadAsync(buf);
        const themeXml = await zip
          .file("xl/theme/theme1.xml")
          ?.async("string");
        if (themeXml) setThemePalette(parseThemePalette(themeXml));
      } catch {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wb: any = new ExcelJS.Workbook();
      await wb.xlsx.load(buf);
      const snap = excelToUniverSnapshot(wb, file.name);
      const name = file.name.replace(/\.[^.]+$/, "");
      const id = await addMovie(name, "");
      if (!id) throw new Error("Could not create the entry.");
      const blob = { v: 5, splCount: 3, plain: true, univer: snap, days: [] };
      const data = await compress(blob);
      const res = await fetch(`/api/movies/${id}/sheet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Could not save the uploaded sheet.");
      await refreshMovies();
      setUploadMsg(`Opening “${name}”…`);
      // Open the uploaded sheet straight away, like double-clicking a file.
      router.push(`/movies/${id}`);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUploadErr((e as any)?.message || "Upload failed.");
      setUploadMsg("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Impersonation banner — admin is viewing a user's profile */}
      {me.impersonating && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <span>
            You are viewing <b>{me.email}</b>&rsquo;s profile as admin.
          </span>
          <button
            onClick={returnToAdmin}
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            ↩ Return to admin
          </button>
        </div>
      )}

      {/* Header banner */}
      <div
        className="mb-8 overflow-hidden rounded-2xl px-6 py-7 text-white shadow-lg"
        style={{
          backgroundImage:
            "linear-gradient(120deg, var(--brand-600), var(--brand-400))",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🎬 Sheets</h1>
            <p className="mt-1 text-sm text-white/85">
              Upload an Excel file from your device — it&rsquo;s saved here and
              you can open it any time to work on it.
            </p>
          </div>
          {me.email && (
            <div className="shrink-0 text-right">
              <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {me.isAdmin ? "👑 " : "👤 "}
                {me.email}
              </div>
              <button
                onClick={logout}
                className="mt-2 rounded-md bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload from device */}
      <div className="mb-8">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f && !uploading) uploadFile(f);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-brand-500 bg-brand-50"
              : "border-brand-300 bg-surface hover:border-brand-400 hover:bg-brand-50/40"
          } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        >
          {uploading ? (
            <span className="flex items-center gap-3 text-sm font-medium text-body">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
              {uploadMsg || "Uploading…"}
            </span>
          ) : (
            <>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "var(--brand-600)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-strong">
                Upload from device
              </p>
              <p className="mt-1 text-xs text-faint">
                Click to choose or drag an Excel <b>.xlsx</b> file here
              </p>
            </>
          )}
        </div>
        {uploadMsg && !uploading && (
          <p className="mt-2 text-xs text-brand-600">{uploadMsg}</p>
        )}
        {uploadErr && <p className="mt-2 text-xs text-rose-600">{uploadErr}</p>}
      </div>

      {/* Uploaded sheets */}
      {movies.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-faint">
          Nothing uploaded yet. Upload an Excel file above to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="h-1.5 w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--brand-500), var(--brand-300))",
                }}
              />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-strong">
                      {m.name}
                    </p>
                    <p className="text-xs text-faint">
                      {m.createdAt
                        ? "Uploaded " +
                          new Date(m.createdAt).toLocaleDateString()
                        : "Uploaded sheet"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete “${m.name}”? This permanently removes the uploaded sheet.`
                        )
                      )
                        deleteMovie(m.id);
                    }}
                    title="Delete"
                    className="rounded p-1 text-faint opacity-0 transition hover:bg-chip hover:text-rose-500 group-hover:opacity-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path d="M5 7h14M10 7V5h4v2m-6 0v12h8V7" />
                    </svg>
                  </button>
                </div>
                <Link
                  href={`/movies/${m.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Open sheet →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

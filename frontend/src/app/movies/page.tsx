"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMovies, addMovie, deleteMovie, refreshMovies } from "@/lib/movies";

export default function MoviesPage() {
  const movies = useMovies();
  const [name, setName] = useState("");
  const [release, setRelease] = useState("");
  const [me, setMe] = useState<{ email: string | null; isAdmin?: boolean }>({
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

  // Keep the shared list fresh — refetch when the tab regains focus and on a
  // light interval, so movies added by other users show up here too.
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

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setName("");
    setRelease("");
    await addMovie(name.trim(), release.trim());
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
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
            <h1 className="text-2xl font-bold tracking-tight">🎬 Movies</h1>
            <p className="mt-1 text-sm text-white/85">
              Create a movie, then open it to fill the Nizam centres sheet or
              upload your own Excel.
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

      {/* Create */}
      <form
        onSubmit={create}
        className="mb-8 rounded-xl border border-line bg-surface p-5 shadow-sm"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          Create a movie
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Movie name *"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={release}
            onChange={(e) => setRelease(e.target.value)}
            placeholder="Release date (optional)"
            className="w-full max-w-[200px] rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Create movie
          </button>
        </div>
      </form>

      {/* List */}
      {movies.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-faint">
          No movies yet. Create one above.
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
                    {m.release || "No release date"}
                  </p>
                </div>
                <button
                  onClick={() => deleteMovie(m.id)}
                  title="Delete"
                  className="rounded p-1 text-faint opacity-0 transition hover:bg-chip hover:text-rose-500 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
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

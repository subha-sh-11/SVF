"use client";

import Link from "next/link";
import { useState } from "react";
import { useMovies, addMovie, deleteMovie } from "@/lib/movies";

export default function MoviesPage() {
  const movies = useMovies();
  const [name, setName] = useState("");
  const [release, setRelease] = useState("");

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addMovie(name.trim(), release.trim());
    setName("");
    setRelease("");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-strong">Movies</h1>
        <p className="mt-1 text-sm text-faint">
          Create a movie, then open it to fill the Nizam centres sheet.
        </p>
      </div>

      {/* Create */}
      <form
        onSubmit={create}
        className="mb-8 rounded-lg border border-line bg-surface p-4"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col rounded-lg border border-line bg-surface p-4"
            >
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
                className="mt-4 inline-flex items-center justify-center rounded-md border border-line px-3 py-1.5 text-sm font-medium text-body hover:border-brand-400 hover:text-brand-700"
              >
                Open sheet →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type AppUser = {
  id: string;
  email: string;
  name: string;
  createdAt: number;
};

const DOMAIN = "@svf.in"; // common login domain for all users

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // the part before @svf.in
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) setUsers((await res.json()).users ?? []);
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    const uname = username.trim().toLowerCase().replace(/@.*/, "").replace(/\s+/g, "");
    if (!uname) {
      setErr("Enter a username.");
      return;
    }
    if (password.length < 4) {
      setErr("Password must be at least 4 characters.");
      return;
    }
    const email = uname + DOMAIN;
    setBusy(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Could not create user.");
      } else {
        setOk(`Created ${data.user.email}. They can log in with these credentials.`);
        setName("");
        setUsername("");
        setPassword("");
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, em: string) {
    if (!confirm(`Delete user ${em}? They will lose access.`)) return;
    await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-strong">Users</h2>
        <p className="mt-0.5 text-sm text-faint">
          Create login accounts. A user signs in with their email &amp; password,
          then sees any movie sheet you share with them (via the Share button on a
          sheet).
        </p>
      </div>

      {/* Create user */}
      <form
        onSubmit={create}
        className="rounded-xl border border-line bg-surface p-5 shadow-sm"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          Create a user
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <div className="flex items-stretch rounded-md border border-line bg-surface focus-within:border-brand-400">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username *"
              className="w-full rounded-l-md bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="flex items-center rounded-r-md border-l border-line bg-muted px-2 text-sm text-faint">
              {DOMAIN}
            </span>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password *"
            type="text"
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        </div>
        {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
        {ok && <p className="mt-2 text-xs text-brand-600">{ok}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          Create user
        </button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-faint">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-faint">
                  No users yet. Create one above.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 text-body">{u.name || "—"}</td>
                  <td className="px-4 py-2 font-medium text-strong">{u.email}</td>
                  <td className="px-4 py-2 text-faint">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => remove(u.id, u.email)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

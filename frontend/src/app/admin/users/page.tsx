"use client";

import { Fragment, useEffect, useState } from "react";

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

  const [expanded, setExpanded] = useState<string | null>(null);

  async function loginAs(em: string) {
    const res = await fetch("/api/users/login-as", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em }),
    });
    if (res.ok) {
      // Open their profile in a new tab — you stay admin here; click "Return to
      // admin" in that tab (or it expires in 1h).
      window.open("/movies", "_blank");
    } else {
      alert((await res.json().catch(() => ({}))).error || "Could not log in as user.");
    }
  }

  async function resetPassword(id: string, em: string) {
    const pw = prompt(`Set a new password for ${em}:`);
    if (!pw) return;
    if (pw.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: pw }),
    });
    alert(res.ok ? `Password updated for ${em}.` : "Could not update password.");
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
                <Fragment key={u.id}>
                  <tr
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-muted/40"
                    onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                  >
                    <td className="px-4 py-2 text-body">
                      <span className="mr-1 inline-block text-faint">
                        {expanded === u.id ? "▾" : "▸"}
                      </span>
                      {u.name || "—"}
                    </td>
                    <td className="px-4 py-2 font-medium text-strong">{u.email}</td>
                    <td className="px-4 py-2 text-faint">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(u.id, u.email);
                        }}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expanded === u.id && (
                    <tr className="border-b border-line bg-muted/30">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-xs text-faint">
                            <div>
                              <span className="font-semibold text-body">Login email:</span>{" "}
                              {u.email}
                            </div>
                            <div>
                              <span className="font-semibold text-body">Name:</span>{" "}
                              {u.name || "—"}
                            </div>
                            <div className="mt-0.5 italic">
                              Passwords are encrypted and can't be shown — use Reset.
                            </div>
                          </div>
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => loginAs(u.email)}
                              className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            >
                              ↗ Login as this user
                            </button>
                            <button
                              onClick={() => resetPassword(u.id, u.email)}
                              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-body hover:bg-chip"
                            >
                              Reset password
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { addRole, PERMISSIONS } from "@/lib/roles";
import { addUser, emailExists } from "@/lib/users";

export default function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [roleName, setRoleName] = useState("");
  const [perms, setPerms] = useState<string[]>(["view_theatres"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function togglePerm(k: string) {
    setPerms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!roleName.trim()) return setError("Role name is required.");
    if (!name.trim()) return setError("Member name is required.");
    if (!email.trim()) return setError("Login email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Enter a valid email address.");
    if (emailExists(email)) return setError("That email is already in use.");

    const roleId = addRole(roleName.trim(), perms);
    addUser({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      region: region.trim(),
      roleId,
      createdAt: Date.now(),
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line shadow-pop"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-strong">Create role</h3>
            <p className="text-xs text-faint">
              Add a role and the person who will log in with it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-faint hover:bg-chip hover:text-body"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Role */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-faint">
              Role name *
            </label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Accountant, Regional Head"
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>

          {/* Member details */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
              Member details (login user)
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name *"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login email *"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Region"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
              Permissions
            </p>
            <div className="space-y-1.5">
              {PERMISSIONS.map((p) => (
                <label
                  key={p.key}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md border border-line px-3 py-2 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={perms.includes(p.key)}
                    onChange={() => togglePerm(p.key)}
                    className="mt-0.5 h-4 w-4 rounded border-line accent-brand-600"
                  />
                  <span className="leading-tight">
                    <span className="block text-sm font-medium text-strong">
                      {p.label}
                    </span>
                    <span className="block text-xs text-faint">
                      {p.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-faint hover:bg-chip"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Create role &amp; add member
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useReps, addRep, updateRep, deleteRep } from "@/lib/reps";
import { assign } from "@/lib/assignments";
import RepAvatar from "./RepAvatar";

type Props = {
  theatreId: number;
  theatreName: string;
  currentRepId?: string;
  onClose: () => void;
};

const EMPTY = { name: "", phone: "", email: "", region: "" };

export default function AssignRepModal({
  theatreId,
  theatreName,
  currentRepId,
  onClose,
}: Props) {
  const reps = useReps();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const id = addRep({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      region: form.region.trim(),
    });
    assign(theatreId, id); // create + assign to this theatre
    onClose();
  }

  function saveEdit(id: string) {
    if (!editForm.name.trim()) return;
    updateRep(id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      region: editForm.region.trim(),
    });
    setEditingId(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line shadow-pop"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-strong">
              Assign representative
            </h3>
            <p className="text-xs text-faint">{theatreName}</p>
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

        <div className="flex-1 overflow-y-auto">
          {/* Existing reps */}
          <div className="px-5 py-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
              Representatives
            </p>

            {reps.length === 0 && (
              <p className="rounded-lg bg-muted px-3 py-4 text-center text-sm text-faint">
                No representatives yet. Add one below.
              </p>
            )}

            <ul className="space-y-1.5">
              {reps.map((r) => {
                const isCurrent = r.id === currentRepId;
                if (editingId === r.id) {
                  return (
                    <li
                      key={r.id}
                      className="rounded-lg border border-line p-3"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Name"
                          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                        />
                        <input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          placeholder="Phone"
                          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                        />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          placeholder="Email"
                          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                        />
                        <input
                          value={editForm.region}
                          onChange={(e) =>
                            setEditForm({ ...editForm, region: e.target.value })
                          }
                          placeholder="Region"
                          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                        />
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-faint hover:bg-chip"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(r.id)}
                          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          Save
                        </button>
                      </div>
                    </li>
                  );
                }
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                      isCurrent
                        ? "border-brand-300 bg-brand-50"
                        : "border-line"
                    }`}
                  >
                    <RepAvatar name={r.name} color={r.color} size={32} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-medium text-strong">
                        {r.name}
                      </p>
                      <p className="truncate text-xs text-faint">
                        {[r.region, r.phone, r.email].filter(Boolean).join(" · ") ||
                          "—"}
                      </p>
                    </div>

                    {confirmDelete === r.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-faint">Delete?</span>
                        <button
                          onClick={() => {
                            deleteRep(r.id);
                            setConfirmDelete(null);
                          }}
                          className="rounded-md bg-rose-500 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-md px-2 py-1 text-xs text-faint hover:bg-chip"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {isCurrent ? (
                          <span className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                            Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              assign(theatreId, r.id);
                              onClose();
                            }}
                            className="rounded-md border border-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          >
                            Assign
                          </button>
                        )}
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditingId(r.id);
                            setEditForm({
                              name: r.name,
                              phone: r.phone,
                              email: r.email ?? "",
                              region: r.region,
                            });
                          }}
                          className="rounded-md p-1.5 text-faint hover:bg-chip hover:text-body"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M4 20h4L18 10l-4-4L4 16v4Zm11-13 3 3" />
                          </svg>
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDelete(r.id)}
                          className="rounded-md p-1.5 text-faint hover:bg-rose-50 hover:text-rose-500"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M5 7h14M10 7V5h4v2m-6 0v12h8V7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {currentRepId && (
              <button
                onClick={() => {
                  assign(theatreId, null);
                  onClose();
                }}
                className="mt-3 text-xs font-medium text-rose-500 hover:underline"
              >
                Unassign from this theatre
              </button>
            )}
          </div>

          {/* Add new */}
          <form
            onSubmit={handleAdd}
            className="border-t border-line bg-muted px-5 py-4"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
              Add new representative
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name *"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Mobile number"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email (for invite)"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="Region"
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-faint">
                Invite by email and/or mobile once added.
              </p>
              <button
                type="submit"
                disabled={!form.name.trim()}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add &amp; assign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

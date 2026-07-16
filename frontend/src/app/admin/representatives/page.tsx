"use client";

import { useMemo, useState } from "react";
import {
  useReps,
  addRep,
  deleteRep,
  setRepStatus,
  setRepRole,
} from "@/lib/reps";
import { useAssignments } from "@/lib/assignments";
import { useRoles } from "@/lib/roles";
import { RepStatus } from "@/data/representatives";
import RepAvatar from "@/components/RepAvatar";

const STATUS_STYLES: Record<RepStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  approved:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export default function RepresentativesPage() {
  const reps = useReps();
  const roles = useRoles();
  const assignments = useAssignments();

  const [form, setForm] = useState({ name: "", email: "", phone: "", region: "" });
  const [showForm, setShowForm] = useState(false);

  // theatre counts per rep
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const id of Object.values(assignments)) c[id] = (c[id] || 0) + 1;
    return c;
  }, [assignments]);

  const norm = reps.map((r) => ({ ...r, status: r.status ?? "approved" }));
  const pending = norm.filter((r) => r.status === "pending");
  const approved = norm.filter((r) => r.status === "approved");
  const rejected = norm.filter((r) => r.status === "rejected");

  function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addRep(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
      },
      "pending"
    );
    setForm({ name: "", email: "", phone: "", region: "" });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-strong">
            Representatives
          </h2>
          <p className="mt-0.5 text-sm text-faint">
            Approve representatives before they can access the app.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? "Close" : "+ Invite representative"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={invite}
          className="rounded-lg border border-line bg-surface p-4"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name *"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
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
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="Region"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-faint">
              Invited reps start as <b>Pending</b> until you approve them.
            </p>
            <button
              type="submit"
              disabled={!form.name.trim()}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Add as pending
            </button>
          </div>
        </form>
      )}

      {/* Pending */}
      <Section
        title="Pending approval"
        count={pending.length}
        empty="No one waiting for approval."
      >
        {pending.map((r) => (
          <RepRow
            key={r.id}
            r={r}
            roles={roles}
            theatres={counts[r.id] || 0}
            onSetRole={(role) => setRepRole(r.id, role)}
            actions={
              <>
                <ActionBtn tone="approve" onClick={() => setRepStatus(r.id, "approved")}>
                  Approve
                </ActionBtn>
                <ActionBtn tone="reject" onClick={() => setRepStatus(r.id, "rejected")}>
                  Reject
                </ActionBtn>
              </>
            }
          />
        ))}
      </Section>

      {/* Approved */}
      <Section
        title="Approved"
        count={approved.length}
        empty="No approved representatives yet."
      >
        {approved.map((r) => (
          <RepRow
            key={r.id}
            r={r}
            roles={roles}
            theatres={counts[r.id] || 0}
            onSetRole={(role) => setRepRole(r.id, role)}
            actions={
              <ActionBtn tone="reject" onClick={() => setRepStatus(r.id, "rejected")}>
                Revoke access
              </ActionBtn>
            }
          />
        ))}
      </Section>

      {/* Rejected */}
      {rejected.length > 0 && (
        <Section title="Rejected" count={rejected.length} empty="">
          {rejected.map((r) => (
            <RepRow
              key={r.id}
              r={r}
              roles={roles}
              theatres={counts[r.id] || 0}
              onSetRole={(role) => setRepRole(r.id, role)}
              actions={
                <>
                  <ActionBtn tone="approve" onClick={() => setRepStatus(r.id, "approved")}>
                    Approve
                  </ActionBtn>
                  <ActionBtn tone="reject" onClick={() => deleteRep(r.id)}>
                    Delete
                  </ActionBtn>
                </>
              }
            />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-strong">{title}</h3>
        <span className="rounded bg-chip px-1.5 py-0.5 text-[11px] font-medium text-faint">
          {count}
        </span>
      </div>
      {count === 0 ? (
        empty ? (
          <p className="rounded-lg border border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            {empty}
          </p>
        ) : null
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function RepRow({
  r,
  roles,
  theatres,
  onSetRole,
  actions,
}: {
  r: {
    id: string;
    name: string;
    email: string;
    phone: string;
    region: string;
    color: string;
    status: RepStatus;
    roleId?: string;
  };
  roles: { id: string; name: string }[];
  theatres: number;
  onSetRole: (roleId: string | undefined) => void;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
      <RepAvatar name={r.name} color={r.color} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-strong">{r.name}</p>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[r.status]}`}
          >
            {r.status}
          </span>
        </div>
        <p className="truncate text-xs text-faint">
          {[r.region, r.phone, r.email].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-faint">
        <span className="hidden sm:inline">{theatres} theatres</span>
        <select
          value={r.roleId || ""}
          onChange={(e) => onSetRole(e.target.value || undefined)}
          className="rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-body outline-none focus:border-brand-400"
        >
          <option value="">No role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

function ActionBtn({
  tone,
  onClick,
  children,
}: {
  tone: "approve" | "reject";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles =
    tone === "approve"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : "border border-line text-body hover:bg-chip";
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${styles}`}
    >
      {children}
    </button>
  );
}

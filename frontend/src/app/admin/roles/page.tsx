"use client";

import { useState } from "react";
import {
  useRoles,
  addRole,
  deleteRole,
  renameRole,
  togglePermission,
  PERMISSIONS,
} from "@/lib/roles";
import { useUsers, deleteUser } from "@/lib/users";
import CreateRoleModal from "@/components/CreateRoleModal";

export default function RolesPage() {
  const roles = useRoles();
  const users = useUsers();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const roleName = (id: string) =>
    roles.find((r) => r.id === id)?.name ?? "—";

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    addRole(newName.trim());
    setNewName("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-strong">
            Roles
          </h2>
          <p className="mt-0.5 text-sm text-faint">
            Create roles and control what each can do.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Create role
        </button>
      </div>

      <form onSubmit={create} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Quick add role (name only)"
          className="w-full max-w-xs rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-body hover:bg-chip disabled:opacity-40"
        >
          Add role
        </button>
      </form>

      {/* Permission matrix */}
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-muted text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-faint">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="px-4 py-3 text-center">
                  {editing === role.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => {
                        if (editName.trim()) renameRole(role.id, editName.trim());
                        setEditing(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editName.trim()) renameRole(role.id, editName.trim());
                          setEditing(null);
                        }
                      }}
                      className="w-28 rounded border border-line bg-surface px-1.5 py-1 text-xs outline-none focus:border-brand-400"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-strong">
                        {role.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {role.system ? (
                          <span className="rounded bg-chip px-1.5 py-0.5 text-[10px] text-faint">
                            system
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditing(role.id);
                                setEditName(role.name);
                              }}
                              className="text-[11px] text-faint hover:text-brand-700"
                            >
                              rename
                            </button>
                            <span className="text-faint">·</span>
                            <button
                              onClick={() => deleteRole(role.id)}
                              className="text-[11px] text-rose-500 hover:underline"
                            >
                              delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0">
            {PERMISSIONS.map((perm) => (
              <tr key={perm.key}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-strong">{perm.label}</p>
                  <p className="text-xs text-faint">{perm.description}</p>
                </td>
                {roles.map((role) => {
                  const on = role.permissions.includes(perm.key);
                  const locked = role.system && role.id === "role-admin";
                  return (
                    <td key={role.id} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={locked}
                        onChange={() => togglePermission(role.id, perm.key)}
                        className="h-4 w-4 rounded border-line accent-brand-600 disabled:opacity-50"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-faint">
        The <b>Super Admin</b> role always has every permission. Representatives
        inherit the permissions of the role you assign them on the
        Representatives page.
      </p>

      {/* Members / login users */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-strong">Members</h3>
          <span className="rounded bg-chip px-1.5 py-0.5 text-[11px] font-medium text-faint">
            {users.length}
          </span>
        </div>
        {users.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            No members yet. Use <b>Create role</b> to add a role with a login user.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line bg-muted text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Login email</th>
                  <th className="px-4 py-2.5 font-medium">Mobile</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5 font-medium text-strong">
                      {u.name}
                    </td>
                    <td className="px-4 py-2.5 text-body">{u.email}</td>
                    <td className="px-4 py-2.5 text-body">{u.mobile || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {roleName(u.roleId)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-xs font-medium text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

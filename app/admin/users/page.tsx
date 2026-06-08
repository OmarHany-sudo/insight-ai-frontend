"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const path = `/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, error, reload, setError } = useAdminData<any[]>(path);
  const mutate = useAdminMutation(reload, setError);

  const resetPassword = (id: string) => {
    const password = prompt("Enter a temporary password with at least 8 characters");
    if (password) mutate(`/admin/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) });
  };

  return (
    <AdminPage
      title="Users"
      subtitle="Manage customer users and platform super admins."
      action={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm" />}
    >
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "user", header: "User", render: (row: any) => <div><p className="font-bold">{row.fullName || "Unnamed"}</p><p className="text-xs text-foreground/40">{row.email}</p></div> },
            { key: "org", header: "Organization", render: (row: any) => row.memberships?.[0]?.organization?.name || "Platform" },
            { key: "role", header: "Role", render: (row: any) => row.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : row.memberships?.[0]?.role || "USER" },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.isActive ? "ACTIVE" : "SUSPENDED"} /> },
            { key: "last", header: "Last Login", render: (row: any) => row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "Never" },
            {
              key: "actions",
              header: "Actions",
              render: (row: any) => (
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => mutate(`/admin/users/${row.id}/activate`, { method: "POST" })}>Activate</AdminButton>
                  <AdminButton onClick={() => mutate(`/admin/users/${row.id}/suspend`, { method: "POST" })}>Suspend</AdminButton>
                  <AdminButton onClick={() => resetPassword(row.id)}>Reset Password</AdminButton>
                  <AdminButton tone="danger" onClick={() => confirm(`Delete ${row.email}?`) && mutate(`/admin/users/${row.id}`, { method: "DELETE" })}>Delete</AdminButton>
                </div>
              ),
            },
          ]}
        />
      )}
    </AdminPage>
  );
}

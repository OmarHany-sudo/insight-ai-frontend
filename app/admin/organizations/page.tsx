"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { token, setAuth } = useAuthStore();
  const [search, setSearch] = useState("");
  const path = `/admin/organizations${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading, error, reload, setError } = useAdminData<any[]>(path);
  const mutate = useAdminMutation(reload, setError);

  const loginAs = async (id: string) => {
    if (!token) return;
    try {
      const data: any = await apiFetch(`/admin/organizations/${id}/login-as`, { method: "POST" }, token);
      setAuth(data.user, data.accessToken, data.organizations, data.currentOrg);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to login as customer");
    }
  };

  return (
    <AdminPage
      title="Organizations"
      subtitle="Manage all customer agencies, plans, status, brands, and support access."
      action={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..." className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm" />}
    >
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "name", header: "Organization", render: (row: any) => <div><p className="font-bold">{row.name}</p><p className="text-xs text-foreground/40">{row.email}</p></div> },
            { key: "plan", header: "Plan", render: (row: any) => row.plan },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.status} /> },
            { key: "counts", header: "Brands / Users", render: (row: any) => `${row.brandsCount} / ${row.usersCount}` },
            { key: "created", header: "Created", render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
            {
              key: "actions",
              header: "Actions",
              render: (row: any) => (
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => mutate(`/admin/organizations/${row.id}/activate`, { method: "POST" })}>Activate</AdminButton>
                  <AdminButton onClick={() => mutate(`/admin/organizations/${row.id}/suspend`, { method: "POST" })}>Suspend</AdminButton>
                  <AdminButton onClick={() => loginAs(row.id)}>Login As</AdminButton>
                  <AdminButton tone="danger" onClick={() => confirm(`Delete ${row.name}?`) && mutate(`/admin/organizations/${row.id}`, { method: "DELETE" })}>Delete</AdminButton>
                </div>
              ),
            },
          ]}
        />
      )}
    </AdminPage>
  );
}

"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminSubscriptionsPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/subscriptions");
  const orgs = useAdminData<any[]>("/admin/organizations");
  const plans = useAdminData<any[]>("/admin/plans");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ organizationId: "", planId: "", status: "ACTIVE", expiresAt: "" });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/subscriptions", { method: "POST", body: JSON.stringify(form) });
    setForm({ organizationId: "", planId: "", status: "ACTIVE", expiresAt: "" });
  };

  return (
    <AdminPage title="Subscriptions" subtitle="Activate, suspend, extend, upgrade, and downgrade manual subscriptions.">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_180px_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <select required value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Organization</option>
          {orgs.data?.map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Plan</option>
          {plans.data?.map((plan: any) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          {["ACTIVE", "TRIAL", "PENDING_PAYMENT", "EXPIRED", "SUSPENDED"].map((status) => <option key={status}>{status}</option>)}
        </select>
        <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <button className="btn-premium px-4 py-2 text-sm">Create</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "customer", header: "Customer", render: (row: any) => row.organization?.name },
            { key: "plan", header: "Plan", render: (row: any) => row.plan?.name || "Unassigned" },
            { key: "dates", header: "Dates", render: (row: any) => <span>{new Date(row.startsAt).toLocaleDateString()} - {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Open"}</span> },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row: any) => (
                <div className="flex flex-wrap gap-2">
                  {["ACTIVE", "SUSPENDED", "EXPIRED", "TRIAL"].map((status) => (
                    <AdminButton key={status} onClick={() => mutate(`/admin/subscriptions/${row.id}`, { method: "PATCH", body: JSON.stringify({ status }) })}>{status}</AdminButton>
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
    </AdminPage>
  );
}

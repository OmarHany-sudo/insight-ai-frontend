"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminPaymentsPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/payments");
  const orgs = useAdminData<any[]>("/admin/organizations");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ organizationId: "", amount: "", currency: "USD", method: "Manual Invoice", notes: "" });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/payments", { method: "POST", body: JSON.stringify(form) });
    setForm({ organizationId: "", amount: "", currency: "USD", method: "Manual Invoice", notes: "" });
  };

  return (
    <AdminPage title="Payments" subtitle="Track Instapay, Vodafone Cash, bank transfer, and manual invoice payments.">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_180px_1fr_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <select required value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Customer</option>
          {orgs.data?.map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <input required type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          {["Instapay", "Vodafone Cash", "Bank Transfer", "Manual Invoice"].map((method) => <option key={method}>{method}</option>)}
        </select>
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <button className="btn-premium px-4 py-2 text-sm">Record</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "id", header: "Payment ID", render: (row: any) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span> },
            { key: "customer", header: "Customer", render: (row: any) => row.organization?.name },
            { key: "amount", header: "Amount", render: (row: any) => `${row.currency} ${row.amount}` },
            { key: "method", header: "Method", render: (row: any) => row.method },
            { key: "date", header: "Date", render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row: any) => (
                <div className="flex flex-wrap gap-2">
                  {["PAID", "FAILED", "REFUNDED"].map((status) => (
                    <AdminButton key={status} onClick={() => mutate(`/admin/payments/${row.id}`, { method: "PATCH", body: JSON.stringify({ status }) })}>{status}</AdminButton>
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

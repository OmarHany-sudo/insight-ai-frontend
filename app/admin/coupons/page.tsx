"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminCouponsPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/coupons");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "", expiresAt: "", usageLimit: "" });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/coupons", { method: "POST", body: JSON.stringify(form) });
    setForm({ code: "", type: "PERCENTAGE", value: "", expiresAt: "", usageLimit: "" });
  };

  return (
    <AdminPage title="Coupons" subtitle="Create, disable, and track percentage or fixed-amount discounts.">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-[1fr_160px_120px_180px_140px_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option>PERCENTAGE</option>
          <option>FIXED_AMOUNT</option>
        </select>
        <input required type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Usage limit" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <button className="btn-premium px-4 py-2 text-sm">Create</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "code", header: "Code", render: (row: any) => <span className="font-mono">{row.code}</span> },
            { key: "type", header: "Type", render: (row: any) => row.type },
            { key: "value", header: "Value", render: (row: any) => row.value },
            { key: "expiry", header: "Expiration", render: (row: any) => row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "No expiry" },
            { key: "usage", header: "Usage", render: (row: any) => `${row.redemptions?.length || 0}/${row.usageLimit || "∞"}` },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.isActive} /> },
            { key: "actions", header: "Actions", render: (row: any) => <AdminButton tone="danger" onClick={() => mutate(`/admin/coupons/${row.id}`, { method: "DELETE" })}>Disable</AdminButton> },
          ]}
        />
      )}
    </AdminPage>
  );
}

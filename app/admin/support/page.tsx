"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminSupportPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/support");
  const orgs = useAdminData<any[]>("/admin/organizations");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ organizationId: "", subject: "", message: "" });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/support", { method: "POST", body: JSON.stringify(form) });
    setForm({ organizationId: "", subject: "", message: "" });
  };

  const reply = (id: string) => {
    const text = prompt("Reply to ticket");
    if (text) mutate(`/admin/support/${id}`, { method: "PATCH", body: JSON.stringify({ reply: text, status: "PENDING" }) });
  };

  return (
    <AdminPage title="Support Center" subtitle="Manage open, pending, resolved, and closed customer support tickets.">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <select value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Organization</option>
          {orgs.data?.map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Initial message" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <button className="btn-premium px-4 py-2 text-sm">Create</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "subject", header: "Ticket", render: (row: any) => <div><p className="font-bold">{row.subject}</p><p className="text-xs text-foreground/40">{row.organization?.name || "Platform"}</p></div> },
            { key: "priority", header: "Priority", render: (row: any) => row.priority },
            { key: "assigned", header: "Assigned", render: (row: any) => row.assignedTo?.email || "Unassigned" },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row: any) => (
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => reply(row.id)}>Reply</AdminButton>
                  {["OPEN", "PENDING", "RESOLVED", "CLOSED"].map((status) => (
                    <AdminButton key={status} onClick={() => mutate(`/admin/support/${row.id}`, { method: "PATCH", body: JSON.stringify({ status }) })}>{status}</AdminButton>
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

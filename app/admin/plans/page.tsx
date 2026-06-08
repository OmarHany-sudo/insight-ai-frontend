"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminPlansPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/plans");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ code: "", name: "", priceMonthly: "", brandsLimit: "1", usersLimit: "1", promptsLimit: "5", aiRequestsLimit: "100", reportsLimit: "1" });

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/plans", { method: "POST", body: JSON.stringify(form) });
    setForm({ code: "", name: "", priceMonthly: "", brandsLimit: "1", usersLimit: "1", promptsLimit: "5", aiRequestsLimit: "100", reportsLimit: "1" });
  };

  return (
    <AdminPage title="Plans" subtitle="Create, edit, and disable plan limits for subscriptions.">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-9 gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        {[
          ["code", "Code"], ["name", "Name"], ["priceMonthly", "Monthly"], ["brandsLimit", "Brands"], ["usersLimit", "Users"], ["promptsLimit", "Prompts"], ["aiRequestsLimit", "AI Requests"], ["reportsLimit", "Reports"],
        ].map(([key, label]) => (
          <input key={key} required={key === "code" || key === "name"} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        ))}
        <button className="btn-premium px-4 py-2 text-sm">Create</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "plan", header: "Plan", render: (row: any) => <div><p className="font-bold">{row.name}</p><p className="text-xs text-foreground/40">{row.code}</p></div> },
            { key: "price", header: "Price", render: (row: any) => `${row.currency} ${row.priceMonthly}/mo` },
            { key: "limits", header: "Limits", render: (row: any) => `${row.brandsLimit} brands, ${row.usersLimit} users, ${row.promptsLimit} prompts` },
            { key: "ai", header: "AI / Reports", render: (row: any) => `${row.aiRequestsLimit} / ${row.reportsLimit}` },
            { key: "white", header: "White Label", render: (row: any) => <StatusPill value={row.whiteLabelAccess} /> },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.isActive} /> },
            { key: "actions", header: "Actions", render: (row: any) => <AdminButton tone="danger" onClick={() => mutate(`/admin/plans/${row.id}`, { method: "DELETE" })}>Disable</AdminButton> },
          ]}
        />
      )}
    </AdminPage>
  );
}

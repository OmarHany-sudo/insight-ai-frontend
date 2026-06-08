"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, StatusPill, useAdminData, useAdminMutation } from "../admin-ui";

const featureKeys = ["ai-assistant", "reports", "geo-recommendations", "arabic-language", "white-label", "competitor-tracking", "pdf-reports"];

export default function AdminFeaturesPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/features");
  const orgs = useAdminData<any[]>("/admin/organizations");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ organizationId: "", key: "ai-assistant", enabled: true });

  const upsert = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutate("/admin/features", { method: "POST", body: JSON.stringify(form) });
  };

  return (
    <AdminPage title="Feature Flags" subtitle="Enable or disable MVP features per organization.">
      <form onSubmit={upsert} className="grid grid-cols-1 md:grid-cols-[1fr_220px_140px_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <select required value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Organization</option>
          {orgs.data?.map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <select value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          {featureKeys.map((key) => <option key={key}>{key}</option>)}
        </select>
        <select value={String(form.enabled)} onChange={(e) => setForm({ ...form, enabled: e.target.value === "true" })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
        <button className="btn-premium px-4 py-2 text-sm">Save</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "org", header: "Organization", render: (row: any) => row.organization?.name || "Global" },
            { key: "key", header: "Feature", render: (row: any) => row.key },
            { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.enabled} /> },
            { key: "actions", header: "Actions", render: (row: any) => <AdminButton onClick={() => mutate(`/admin/features/${row.id}`, { method: "PATCH", body: JSON.stringify({ enabled: !row.enabled }) })}>{row.enabled ? "Disable" : "Enable"}</AdminButton> },
          ]}
        />
      )}
    </AdminPage>
  );
}

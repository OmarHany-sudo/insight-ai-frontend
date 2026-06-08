"use client";

import { useState } from "react";
import { AdminButton, AdminPage, AdminState, AdminTable, useAdminData, useAdminMutation } from "../admin-ui";

export default function AdminSettingsPage() {
  const { data, loading, error, reload, setError } = useAdminData<any[]>("/admin/settings");
  const orgs = useAdminData<any[]>("/admin/organizations");
  const mutate = useAdminMutation(reload, setError);
  const [form, setForm] = useState({ organizationId: "", logoUrl: "", brandColor: "", customDomain: "" });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.organizationId) return;
    await mutate(`/admin/settings/${form.organizationId}`, {
      method: "PATCH",
      body: JSON.stringify({
        logoUrl: form.logoUrl || undefined,
        brandColor: form.brandColor || undefined,
        customDomain: form.customDomain || undefined,
        reportBranding: { footer: "Powered by Insight AI" },
      }),
    });
  };

  return (
    <AdminPage title="White Label Settings" subtitle="Manage organization logo, colors, custom domains, and report branding.">
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_1fr_auto] gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface/30">
        <select required value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm">
          <option value="">Organization</option>
          {orgs.data?.map((org: any) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="Logo URL" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })} placeholder="#00f5d4" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <input value={form.customDomain} onChange={(e) => setForm({ ...form, customDomain: e.target.value })} placeholder="reports.customer.com" className="bg-brand-primary border border-brand-border rounded-lg p-2 text-sm" />
        <button className="btn-premium px-4 py-2 text-sm">Save</button>
      </form>
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "org", header: "Organization", render: (row: any) => row.organization?.name },
            { key: "logo", header: "Logo", render: (row: any) => row.logoUrl || "Not set" },
            { key: "color", header: "Color", render: (row: any) => row.brandColor || "Default" },
            { key: "domain", header: "Custom Domain", render: (row: any) => row.customDomain || "Not set" },
            { key: "updated", header: "Updated", render: (row: any) => new Date(row.updatedAt).toLocaleString() },
            { key: "actions", header: "Actions", render: (row: any) => <AdminButton onClick={() => setForm({ organizationId: row.organizationId, logoUrl: row.logoUrl || "", brandColor: row.brandColor || "", customDomain: row.customDomain || "" })}>Edit</AdminButton> },
          ]}
        />
      )}
    </AdminPage>
  );
}

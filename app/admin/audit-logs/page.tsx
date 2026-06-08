"use client";

import { AdminPage, AdminState, AdminTable, useAdminData } from "../admin-ui";

export default function AdminAuditLogsPage() {
  const { data, loading, error } = useAdminData<any[]>("/admin/audit-logs");
  return (
    <AdminPage title="Audit Logs" subtitle="Track login-as events, billing changes, user changes, feature changes, and support actions.">
      <AdminState loading={loading} error={error} empty={!loading && !data?.length} />
      {data && (
        <AdminTable
          rows={data}
          columns={[
            { key: "action", header: "Action", render: (row: any) => <span className="font-mono text-xs">{row.action}</span> },
            { key: "actor", header: "Actor", render: (row: any) => row.actor?.email || "System" },
            { key: "target", header: "Target", render: (row: any) => row.organization?.name || row.targetUser?.email || row.entityId || "N/A" },
            { key: "ip", header: "IP Address", render: (row: any) => row.ipAddress || "N/A" },
            { key: "time", header: "Timestamp", render: (row: any) => new Date(row.createdAt).toLocaleString() },
          ]}
        />
      )}
    </AdminPage>
  );
}

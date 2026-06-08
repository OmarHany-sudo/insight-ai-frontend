"use client";

import { AdminPage, AdminState, AdminTable, MetricGrid, StatusPill, useAdminData } from "../admin-ui";

export default function AdminAiMonitoringPage() {
  const { data, loading, error } = useAdminData<any>("/admin/ai-monitoring");
  return (
    <AdminPage title="AI Monitoring" subtitle="Provider usage, estimated tokens, failed requests, and cost signals.">
      <AdminState loading={loading} error={error} />
      {data && (
        <>
          <MetricGrid
            metrics={[
              { label: "Groq Requests", value: data.metrics.groqRequests },
              { label: "Gemini Requests", value: data.metrics.geminiRequests },
              { label: "Total Tokens", value: data.metrics.totalTokens },
              { label: "Failed Requests", value: data.metrics.failedRequests },
              { label: "Estimated Cost", value: `$${data.metrics.estimatedCost}` },
            ]}
          />
          <AdminTable
            rows={data.recent}
            columns={[
              { key: "provider", header: "Provider", render: (row: any) => row.provider },
              { key: "org", header: "Organization", render: (row: any) => row.organization },
              { key: "status", header: "Status", render: (row: any) => <StatusPill value={row.status} /> },
              { key: "tokens", header: "Token Estimate", render: (row: any) => row.tokensEstimate },
              { key: "date", header: "Date", render: (row: any) => new Date(row.capturedAt).toLocaleString() },
            ]}
          />
        </>
      )}
    </AdminPage>
  );
}

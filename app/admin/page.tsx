"use client";

import { AdminPage, AdminState, MetricGrid, useAdminData } from "./admin-ui";

export default function AdminOverviewPage() {
  const { data, loading, error } = useAdminData<any>("/admin/dashboard");
  const metrics = data?.metrics;

  return (
    <AdminPage title="Platform Overview" subtitle="Revenue, subscriptions, users, AI requests, and prompt-run health.">
      <AdminState loading={loading} error={error} />
      {metrics && (
        <>
          <MetricGrid
            metrics={[
              { label: "Organizations", value: metrics.totalOrganizations },
              { label: "Users", value: metrics.totalUsers },
              { label: "Brands", value: metrics.totalBrands },
              { label: "Active Subs", value: metrics.activeSubscriptions },
              { label: "Expired Subs", value: metrics.expiredSubscriptions },
              { label: "Monthly Revenue", value: `$${metrics.monthlyRevenue}` },
              { label: "Annual Revenue", value: `$${metrics.annualRevenue}` },
              { label: "AI Requests", value: metrics.aiRequestsCount },
              { label: "Reports", value: metrics.generatedReportsCount },
              { label: "Prompt Runs", value: metrics.totalPromptRuns },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(data.charts || {}).map(([key, values]: any) => (
              <div key={key} className="p-6 rounded-xl border border-brand-border bg-brand-surface/30">
                <h2 className="font-bold capitalize mb-4">{key.replace(/([A-Z])/g, " $1")}</h2>
                <div className="space-y-3">
                  {values.map((item: any) => {
                    const max = Math.max(1, ...values.map((value: any) => value.value));
                    return (
                      <div key={`${key}-${item.label}`} className="grid grid-cols-[60px_1fr_60px] gap-3 items-center text-xs">
                        <span className="text-foreground/40">{item.label}</span>
                        <div className="h-2 rounded-full bg-brand-border overflow-hidden">
                          <div className="h-full bg-brand-accent" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
                        </div>
                        <span className="text-right font-mono">{Number(item.value).toFixed(item.value % 1 ? 2 : 0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminPage>
  );
}

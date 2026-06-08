"use client";

import { AdminPage, AdminState, MetricGrid, useAdminData } from "../admin-ui";

export default function AdminRevenuePage() {
  const { data, loading, error } = useAdminData<any>("/admin/revenue");
  return (
    <AdminPage title="Revenue" subtitle="Manual billing revenue, customer health, ARPC, and plan/country breakdowns.">
      <AdminState loading={loading} error={error} />
      {data && (
        <>
          <MetricGrid
            metrics={[
              { label: "Monthly Revenue", value: `$${data.metrics.monthlyRevenue}` },
              { label: "Annual Revenue", value: `$${data.metrics.annualRevenue}` },
              { label: "Active Customers", value: data.metrics.activeCustomers },
              { label: "Churned Customers", value: data.metrics.churnedCustomers },
              { label: "ARPC", value: `$${data.metrics.averageRevenuePerCustomer}` },
              { label: "Revenue Growth", value: `${data.metrics.revenueGrowth}%` },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(data.charts).map(([key, values]: any) => (
              <div key={key} className="p-6 rounded-xl border border-brand-border bg-brand-surface/30">
                <h2 className="font-bold capitalize mb-4">{key.replace(/([A-Z])/g, " $1")}</h2>
                <div className="space-y-3">
                  {values.map((item: any) => (
                    <div key={`${key}-${item.label}`} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/50">{item.label}</span>
                      <span className="font-mono">${Number(item.value).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminPage>
  );
}

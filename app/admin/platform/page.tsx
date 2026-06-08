"use client";

import { AdminPage, AdminState, useAdminData } from "../admin-ui";

export default function AdminPlatformPage() {
  const { data, loading, error } = useAdminData<any>("/admin/platform");
  return (
    <AdminPage title="Platform Analytics" subtitle="Platform-wide growth, prompt runs, AI requests, reports, and recommendations.">
      <AdminState loading={loading} error={error} />
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(data).map(([key, values]: any) => (
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
                      <span className="text-right font-mono">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}

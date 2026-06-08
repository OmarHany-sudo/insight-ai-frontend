"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAdminData<T>(path: string) {
  const { token } = useAuthStore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setData(await apiFetch<T>(path, {}, token));
    } catch (err: any) {
      setError(err.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [path, token]);

  return { data, loading, error, reload: load, setData, setError };
}

export function AdminPage({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-foreground/40 mt-1">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AdminState({ loading, error, empty }: { loading?: boolean; error?: string; empty?: boolean }) {
  if (loading) {
    return (
      <div className="p-8 rounded-xl border border-brand-border bg-brand-surface/30 flex items-center gap-3 text-sm text-foreground/50">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading admin data...
      </div>
    );
  }
  if (error) {
    return <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>;
  }
  if (empty) {
    return <div className="p-8 rounded-xl border border-dashed border-brand-border bg-brand-surface/20 text-sm text-foreground/40">No records found.</div>;
  }
  return null;
}

export function MetricGrid({ metrics }: { metrics: { label: string; value: string | number }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="p-5 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold">{metric.label}</p>
          <p className="text-3xl font-bold mt-2">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminTable<T>({
  rows,
  columns,
}: {
  rows: T[];
  columns: { key: string; header: string; render: (row: T) => ReactNode }[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface/30">
      <table className="w-full text-sm">
        <thead className="bg-brand-border/20 text-xs uppercase tracking-widest text-foreground/40">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-left p-4 font-bold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id} className="border-t border-brand-border/60 align-top">
              {columns.map((column) => (
                <td key={column.key} className="p-4 text-foreground/70">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ value }: { value?: string | boolean }) {
  const text = typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value || "Unknown";
  const good = ["ACTIVE", "PAID", "OPEN", "Enabled", "TRIAL", "GENERATED"].includes(text);
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${good ? "bg-brand-accent/10 text-brand-accent" : "bg-red-500/10 text-red-300"}`}>
      {text}
    </span>
  );
}

export function AdminButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void | Promise<void>;
  tone?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
        tone === "danger"
          ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
          : "border-brand-border text-foreground/60 hover:text-brand-accent hover:border-brand-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

export function useAdminMutation(reload: () => Promise<void>, setError: (error: string) => void) {
  const { token } = useAuthStore();
  return async (path: string, options: RequestInit = {}) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(path, options, token);
      await reload();
    } catch (err: any) {
      setError(err.message || "Admin action failed");
    }
  };
}

"use client";

import { FileText, Download, Share2, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { API_BASE_URL, apiFetch } from "@/lib/api";

export default function ReportsPage() {
  const { t, locale } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId } = useDashboardStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    if (!token || !currentOrg) return;
    const data = await apiFetch<any[]>(`/reports?organizationId=${currentOrg.id}${activeBrandId ? `&brandId=${activeBrandId}` : ""}`, {}, token);
    setReports(data);
  };

  useEffect(() => {
    load().catch(() => setReports([]));
  }, [token, currentOrg, activeBrandId]);

  const createReport = async () => {
    if (!token || !currentOrg) return;
    setStatus(t.dashboard.reportGenerating);
    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({ organizationId: currentOrg.id, brandId: activeBrandId || undefined }),
      }, token);
      setStatus(t.dashboard.reportGenerated);
      await load();
    } catch (err: any) {
      setStatus(err.message || t.dashboard.reportFailed);
    }
  };

  const handleDownload = async (id: string) => {
    if (!token) return;
    setDownloadingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Download failed with ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "insight-ai-report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      setStatus(t.dashboard.reports.downloadStarted);
    } catch (err: any) {
      setStatus(err.message || t.dashboard.reports.downloadFailed);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = async (report: any) => {
    const message = `${report.title} - ${new Date(report.createdAt).toLocaleDateString(locale)}`;
    try {
      await navigator.clipboard.writeText(message);
      setStatus(t.dashboard.reports.summaryCopied);
    } catch {
      setStatus(message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.reports}</h1>
          <p className="text-foreground/40 text-sm mt-1">{t.dashboard.reports.subtitle}</p>
        </div>
        <button 
          onClick={createReport}
          className="px-4 py-2 bg-brand-accent text-brand-primary font-bold rounded-lg text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> {t.dashboard.generateReport}
        </button>
      </div>

      {status && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{status}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[t.dashboard.reports.executive, t.dashboard.reports.competitor, t.dashboard.reports.actionPlan].map((label) => (
          <div key={label} className="rounded-xl border border-brand-border bg-brand-surface/20 p-4 text-sm font-bold">
            {label}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-brand-accent/20 bg-brand-accent/5 px-4 py-3 text-sm text-foreground/60">
        {t.dashboard.reports.whiteLabel}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 && (
          <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">
            {t.dashboard.reports.empty}
          </div>
        )}
        {reports.map((report) => {
          const isDownloading = downloadingId === report.id;
          return (
            <div key={report.id} className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass group hover:border-brand-accent/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-border/30 flex items-center justify-center mb-6 group-hover:bg-brand-accent/10 transition-colors">
                <FileText className="w-6 h-6 text-foreground/40 group-hover:text-brand-accent transition-colors" />
              </div>
              <h3 className="font-bold mb-1">{report.title}</h3>
              <p className="text-xs text-foreground/40 mb-6">{new Date(report.createdAt).toLocaleDateString(locale)} • {report.type}</p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(report.id)}
                  disabled={isDownloading}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    isDownloading ? "bg-brand-accent/20 text-brand-accent cursor-not-allowed" : "bg-brand-border/30 hover:bg-brand-border/50"
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t.dashboard.reports.downloading}
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      {t.common.download}
                    </>
                  )}
                </button>
                <button onClick={() => handleShare(report)} className="p-2 rounded-lg border border-brand-border hover:bg-brand-border/50 transition-colors" aria-label={`Copy ${report.title} summary`}>
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

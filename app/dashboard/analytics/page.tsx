"use client";

import { BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { VisibilityTrendChart } from "@/components/dashboard/VisibilityTrendChart";
import { ShareOfVoiceChart } from "@/components/dashboard/ShareOfVoiceChart";

export default function AnalyticsPage() {
  const { t, locale } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [summary, setSummary] = useState<any>({});
  const [trend, setTrend] = useState<{ date: string; score: number }[]>([]);
  const [share, setShare] = useState<any>(null);
  const [citations, setCitations] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !currentOrg) return;
    const load = async () => {
      let brandId = activeBrandId;
      if (!brandId) {
        const brands = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
        brandId = brands[0]?.id;
        if (brandId) setActiveBrand(brandId);
      }
      if (!brandId) return;

      const [summaryData, trendData, shareData, citationData] = await Promise.all([
        apiFetch<any>(`/analytics/summary?brandId=${brandId}`, {}, token),
        apiFetch<any[]>(`/analytics/visibility-trend?brandId=${brandId}&days=30`, {}, token),
        apiFetch<any>(`/analytics/share-of-voice?brandId=${brandId}`, {}, token),
        apiFetch<any[]>(`/analytics/citations?brandId=${brandId}`, {}, token),
      ]);
      setSummary(summaryData);
      setTrend(trendData.map((item) => ({ date: new Date(item.snapshotDate).toLocaleDateString(locale, { month: "short", day: "numeric" }), score: item.geoScore || 0 })));
      setShare(shareData);
      setCitations(citationData);
    };

    load().catch(() => {
      setSummary({});
      setTrend([]);
      setShare(null);
      setCitations([]);
    });
  }, [token, currentOrg, activeBrandId, setActiveBrand]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.nav.analytics}</h1>
        <p className="text-foreground/40 text-sm mt-1">{t.dashboard.analytics.deepDive}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">{t.dashboard.analytics.totalImpressions}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{summary.responses || 0}</span>
            <span className="text-brand-accent text-xs font-bold mb-1">{t.common.stored}</span>
          </div>
        </div>
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">{t.dashboard.analytics.mentionRank}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{summary.totalMentions || 0}</span>
            <span className="text-brand-accent text-xs font-bold mb-1">{t.dashboard.analytics.mentions}</span>
          </div>
        </div>
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">{t.dashboard.analytics.citationVelocity}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{summary.totalCitations || 0}</span>
            <span className="text-brand-accent text-xs font-bold mb-1">{t.common.stored}</span>
          </div>
        </div>
      </div>

      {!activeBrandId ? (
        <div className="p-12 rounded-2xl border border-brand-border bg-brand-surface/20 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center mb-6">
            <BarChart3 className="w-8 h-8 text-brand-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t.dashboard.noBrandSelected}</h3>
          <p className="text-foreground/40 max-w-md mx-auto">{t.dashboard.selectBrandEmpty}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisibilityTrendChart title={t.dashboard.analytics.storedGeoTrend} data={trend} />
            <ShareOfVoiceChart
              title={t.dashboard.analytics.storedShare}
              data={share?.breakdown?.map((item: any, index: number) => ({
                name: item.name,
                value: item.mentions,
                color: index === 0 ? "#00f5d4" : ["#3b82f6", "#a855f7", "#64748b"][index % 3],
              }))}
            />
          </div>

          <div className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass">
            <h3 className="font-bold mb-4">{t.dashboard.analytics.storedCitations}</h3>
            {citations.length === 0 && <p className="text-sm text-foreground/40">{t.dashboard.analytics.noCitations}</p>}
            <div className="space-y-3">
              {citations.slice(0, 8).map((citation) => (
                <div key={citation.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-primary/40 border border-brand-border">
                  <div>
                    <p className="text-sm font-medium">{citation.domain || citation.url}</p>
                    <p className="text-xs text-foreground/40">{citation.url}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-foreground/30" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { GeoScoreWidget } from "@/components/dashboard/GeoScoreWidget";
import { ShareOfVoiceChart } from "@/components/dashboard/ShareOfVoiceChart";
import { VisibilityTrendChart } from "@/components/dashboard/VisibilityTrendChart";
import { ArrowUpRight, TrendingUp, Users, MessageSquare, Target, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardOverview() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ brands: 0, activePrompts: 0, responses: 0, totalMentions: 0, competitorMentions: 0, totalCitations: 0, avgGeoScore: 0, avgSentiment: 0, geoTrend: "flat" });
  const [trend, setTrend] = useState<{ date: string; score: number }[]>([]);
  const [share, setShare] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !currentOrg) return;

    const load = async () => {
      const brandList = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
      setBrands(brandList);
      const selectedBrandId = activeBrandId || brandList[0]?.id || null;
      if (!activeBrandId && selectedBrandId) setActiveBrand(selectedBrandId);

      const [summaryData, promptData] = await Promise.all([
        apiFetch<any>(`/analytics/summary?organizationId=${currentOrg.id}${selectedBrandId ? `&brandId=${selectedBrandId}` : ""}`, {}, token),
        apiFetch<any[]>(`/prompts?organizationId=${currentOrg.id}${selectedBrandId ? `&brandId=${selectedBrandId}` : ""}`, {}, token),
      ]);
      setSummary(summaryData);
      setPrompts(promptData);

      if (selectedBrandId) {
        const [trendData, shareData, recData] = await Promise.all([
          apiFetch<any[]>(`/analytics/visibility-trend?brandId=${selectedBrandId}&days=30`, {}, token),
          apiFetch<any>(`/analytics/share-of-voice?brandId=${selectedBrandId}`, {}, token),
          apiFetch<any[]>(`/analytics/recommendations?brandId=${selectedBrandId}`, {}, token),
        ]);
        setTrend(trendData.map((item) => ({ date: new Date(item.snapshotDate).toLocaleDateString(locale, { month: "short", day: "numeric" }), score: item.geoScore || 0 })));
        setShare(shareData);
        setRecommendations(recData);
      }
    };

    load().catch(() => {
      setBrands([]);
      setSummary({ brands: 0, activePrompts: 0, responses: 0, totalMentions: 0, competitorMentions: 0, totalCitations: 0, avgGeoScore: 0, avgSentiment: 0, geoTrend: "flat" });
    });
  }, [token, currentOrg, activeBrandId, setActiveBrand]);

  const createReport = async () => {
    if (!token || !currentOrg) return;
    setReportStatus(t.dashboard.reportGenerating);
    try {
      await apiFetch(
        "/reports",
        {
          method: "POST",
          body: JSON.stringify({
            organizationId: currentOrg.id,
            brandId: activeBrandId || brands[0]?.id,
            title: t.dashboard.visibilityTrend,
          }),
        },
        token
      );
      setReportStatus(t.dashboard.reportGenerated);
      router.push("/dashboard/reports");
    } catch (error) {
      setReportStatus(error instanceof Error ? error.message : t.dashboard.reportFailed);
    }
  };

  const STATS = [
    { label: t.dashboard.avgGeoScore, value: String(summary.avgGeoScore || 0), change: t.common.stored, icon: TrendingUp },
    { label: t.dashboard.shareOfVoice, value: `${share?.share || 0}%`, change: t.common.stored, icon: Users },
    { label: t.dashboard.citationCount, value: String(summary.totalCitations || 0), change: t.common.stored, icon: ArrowUpRight },
    { label: t.dashboard.brandMentions, value: String(summary.totalMentions || 0), change: t.common.stored, icon: MessageSquare },
    { label: t.dashboard.competitorMentions, value: String(summary.competitorMentions || 0), change: t.common.stored, icon: Users },
    { label: t.dashboard.sentimentScore, value: String(summary.avgSentiment || 0), change: t.common.stored, icon: Zap },
    { label: t.dashboard.geoTrend, value: summary.geoTrend === "up" ? t.dashboard.trendUp : summary.geoTrend === "down" ? t.dashboard.trendDown : t.dashboard.trendFlat, change: t.common.stored, icon: TrendingUp },
    { label: t.dashboard.activePrompts, value: String(summary.activePrompts || 0), change: t.common.stored, icon: Target },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.overview}</h1>
          <p className="text-foreground/40 text-sm mt-1">{t.dashboard.analytics.deepDive}</p>
        </div>
        <button
          onClick={createReport}
          disabled={!currentOrg || !token}
          className="px-4 py-2 bg-brand-accent text-brand-primary font-bold rounded-lg text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          {t.dashboard.generateReport} <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      {reportStatus && (
        <div className="rounded-lg border border-brand-border bg-brand-surface/40 px-4 py-3 text-sm text-foreground/60">
          {reportStatus}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-brand-border/30">
                <stat.icon className="w-5 h-5 text-brand-accent" />
              </div>
              <span className="text-xs font-bold text-foreground/30">
                {stat.change}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VisibilityTrendChart title={t.dashboard.visibilityTrend} data={trend} />
        </div>
        <div className="lg:col-span-1">
          <GeoScoreWidget score={summary.avgGeoScore || 0} label={t.dashboard.avgGeoScore} />
          <div className="mt-6">
            <ShareOfVoiceChart
              title={t.dashboard.shareOfVoice}
              data={share?.breakdown?.map((item: any, index: number) => ({
                name: item.name,
                value: item.mentions,
                color: index === 0 ? "#00f5d4" : ["#3b82f6", "#a855f7", "#64748b"][index % 3],
              }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <h3 className="text-sm font-medium text-foreground/60 mb-6">{t.dashboard.recentActivity}</h3>
          <div className="space-y-4">
            {prompts.length === 0 && (
              <div className="p-4 rounded-lg bg-brand-border/10 border border-brand-border/50 text-sm text-foreground/50">
                {t.dashboard.createBrandPromptEmpty}
              </div>
            )}
            {prompts.slice(0, 3).map((prompt) => (
              <div key={prompt.id} className="p-4 rounded-lg bg-brand-border/10 border border-brand-border/50 hover:border-brand-accent/30 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase">
                      {prompt.responses?.[0]?.engine?.name || t.dashboard.notRun}
                    </span>
                    <span className="text-[10px] text-foreground/40 font-mono">
                      {prompt.lastRunAt ? new Date(prompt.lastRunAt).toLocaleString(locale) : t.dashboard.noRunYet}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-foreground/20 group-hover:text-brand-accent transition-colors" />
                </div>
                <p className="text-sm font-medium line-clamp-1">"{prompt.queryText}"</p>
                <p className="text-xs text-foreground/40 mt-1 line-clamp-2">
                  {prompt.responses?.[0]?.status || t.dashboard.firstResponseWaiting}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass">
          <h3 className="text-sm font-medium text-foreground/60 mb-6">{t.dashboard.recommendationsTitle}</h3>
          <div className="space-y-4">
            {recommendations.length === 0 && (
              <div className="p-4 rounded-lg bg-brand-border/10 border border-brand-border/50 text-sm text-foreground/50">
                {t.dashboard.recommendationsEmpty}
              </div>
            )}
            {recommendations.slice(0, 2).map((rec) => (
              <div key={rec.id} className="flex gap-4 p-4 rounded-lg bg-brand-accent/5 border border-brand-accent/20">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold">{rec.title}</p>
                  <p className="text-xs text-foreground/60 mt-1">{rec.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

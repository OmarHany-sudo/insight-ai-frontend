"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeAlert, BarChart3, Download, FileSearch, Target, Trophy, TrendingDown, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function WhyNotRecommendedPage() {
  const { t } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<any>(null);

  const copy = t.dashboard.moneyPage;

  const scoreCards = useMemo(() => [
    ["GEO", data?.summary?.geoScore || 0],
    [copy.threats, data?.summary?.threatCount || 0],
    [copy.opportunities, data?.summary?.opportunityCount || 0],
    [copy.quickWins, data?.summary?.quickWinCount || 0],
  ], [data]);

  const load = async (nextBrandId?: string) => {
    if (!token || !currentOrg) return;
    setLoading(true);
    setError("");
    try {
      const brandList = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
      setBrands(brandList);
      const selected = nextBrandId || brandId || activeBrandId || brandList[0]?.id || "";
      setBrandId(selected);
      if (selected) {
        setActiveBrand(selected);
        setData(await apiFetch(`/geo-intelligence/brands/${selected}/money-page-v2`, {}, token));
      } else {
        setData(null);
      }
    } catch (err: any) {
      setError(err.message || copy.loadError);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, currentOrg?.id, activeBrandId]);

  const exportPdf = async () => {
    if (!token || !currentOrg || !brandId) return;
    setStatus("");
    setError("");
    try {
      const generated = await apiFetch("/reports/v2", {
        method: "POST",
        body: JSON.stringify({
          organizationId: currentOrg.id,
          brandId,
          title: `${data?.brand?.name || "Brand"} GEO Intelligence V2`,
        }),
      }, token);
      setReport(generated);
      setStatus(copy.reportQueued);
    } catch (err: any) {
      setError(err.message || t.dashboard.reportFailed);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-foreground/40 text-sm mt-1 max-w-4xl">{copy.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={brandId}
            onChange={(event) => load(event.target.value)}
            className="bg-brand-surface border border-brand-border rounded-lg p-3 text-sm min-w-[220px]"
          >
            <option value="">{copy.selectBrand}</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <button
            onClick={exportPdf}
            disabled={!data}
            className="btn-premium px-4 py-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> {copy.exportPdf}
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
      {status && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{status}</div>}
      {loading && <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">{t.common.loading}</div>}
      {!loading && !data && <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">{copy.empty}</div>}

      {data && (
        <>
          <section className="rounded-2xl border border-brand-accent/25 bg-brand-accent/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0">
                <BadgeAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">{copy.executiveFinding}</p>
                <h2 className="text-xl font-bold mt-2">{data.summary.headline}</h2>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {scoreCards.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-border bg-brand-surface/30 p-5">
                <p className="text-xs text-foreground/40">{label}</p>
                <p className="text-3xl font-bold mt-2">{Math.round(Number(value))}</p>
                <div className="mt-4 h-2 rounded-full bg-brand-border/30 overflow-hidden">
                  <div className="h-full bg-brand-accent" style={{ width: `${Math.max(0, Math.min(100, Number(value)))}%` }} />
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
          <Panel title={copy.competitorBattlecards} icon={Trophy}>
            <div className="space-y-4">
                <EngineEmpty engine={data.threats} label={copy.noData} />
                {completedRows(data.threats).slice(0, 4).map((card: any) => (
                  <div key={card.competitorId} className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{card.competitorName}</h3>
                      <span className="text-xs font-mono text-brand-accent">{card.threatLevel} · {card.threatScore}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/60">{card.whyWinning}</p>
                    <MetricLine items={[
                      `${copy.visibilityAdvantage}: ${card.visibilityAdvantage}`,
                      `${copy.citationAdvantage}: ${card.citationAdvantage}`,
                      `${copy.contentAdvantage}: ${card.contentAdvantage}`,
                      `${copy.geoAdvantage}: ${card.geoAdvantage}`,
                    ]} />
                    <MiniList label={copy.dominatedPrompts} items={card.promptsDominated} />
                    <MiniList label={copy.citedSources} items={card.citationsOwned} />
                    <Evidence items={card.evidence} />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title={copy.citationOpportunities} icon={FileSearch}>
              <div className="space-y-3">
                {empty(data.citationOpportunities, copy.noData)}
                {data.citationOpportunities?.slice(0, 8).map((item: any) => (
                  <div key={item.id || item.citationSource?.domain || item.domain} className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{item.citationSource?.domain || item.domain}</h3>
                      <span className="rounded-full bg-brand-accent/10 px-2 py-1 text-xs font-bold text-brand-accent">{item.opportunityScore}</span>
                    </div>
                    <p className="mt-2 text-xs text-foreground/45">{copy.competitorCitations}: {item.competitorCitations} · {copy.customerCitations}: {item.brandCitations}</p>
                    <p className="mt-2 text-sm text-foreground/60">{item.recommendedAction}</p>
                    <Evidence items={item.evidence} />
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel title={copy.visibilityOpportunities} icon={Target}>
              <div className="space-y-3">
                <EngineEmpty engine={data.opportunities} label={copy.noData} />
                {completedRows(data.opportunities, "all").slice(0, 6).map((item: any) => (
                  <Opportunity key={item.id || item.title} title={item.title} score={item.opportunityScore} body={item.recommendedAction} />
                ))}
              </div>
            </Panel>

            <Panel title={copy.lostRevenue} icon={TrendingDown}>
              <div className="space-y-3">
                <EngineEmpty engine={data.lostRevenue} label={copy.noData} />
                {data.lostRevenue?.status === "COMPLETED" && (
                  <div className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                    <MetricLine items={[
                      `${copy.missedVisibility}: ${data.lostRevenue.data.missedVisibilityPercent}%`,
                      `${copy.visibilityLeakage}: ${data.lostRevenue.data.visibilityLeakage}`,
                      `${copy.competitorCapture}: ${data.lostRevenue.data.competitorCaptureLevel}`,
                      `${copy.leadImpact}: ${data.lostRevenue.data.leadOpportunityImpact}`,
                    ]} />
                    <MiniList label={copy.assumptions} items={data.lostRevenue.data.assumptions} />
                    <Evidence items={data.lostRevenue.data.evidence} />
                  </div>
                )}
              </div>
            </Panel>

            <Panel title={copy.actionPlan} icon={Zap}>
              <div className="space-y-3">
                <EngineEmpty engine={data.quickWins} label={copy.noData} />
                {data.quickWins?.status === "COMPLETED" && (
                  <QuickWinList data={data.quickWins.data} copy={copy} />
                )}
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Panel title={copy.benchmarks} icon={BarChart3}>
              <EngineEmpty engine={data.benchmarks} label={copy.noData} />
              {data.benchmarks?.status === "COMPLETED" && (
                <div className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                  <MetricLine items={[
                    `${copy.industryPercentile}: ${data.benchmarks.data.industryPercentile}`,
                    `${copy.geoPercentile}: ${data.benchmarks.data.geoScorePercentile}`,
                    `${copy.citationPercentile}: ${data.benchmarks.data.citationPercentile}`,
                    `${copy.visibilityPercentile}: ${data.benchmarks.data.visibilityPercentile}`,
                    `${copy.sampleSize}: ${data.benchmarks.data.sampleSize}`,
                  ]} />
                  <Evidence items={data.benchmarks.data.evidence} />
                </div>
              )}
            </Panel>

            <Panel title={copy.reportsV2} icon={Download}>
              <div className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                <p className="text-sm text-foreground/60">{copy.reportsV2Body}</p>
                {report && (
                  <div className="mt-4 text-xs text-foreground/45">
                    <p>{report.title}</p>
                    <p>{report.fileName}</p>
                  </div>
                )}
              </div>
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-brand-border bg-brand-surface/30 glass p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-brand-accent" />
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniList({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/35">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.slice(0, 5).map((item) => <span key={item} className="rounded-lg border border-brand-border px-2 py-1 text-xs text-foreground/55">{item}</span>)}
      </div>
    </div>
  );
}

function MetricLine({ items }: { items: string[] }) {
  return <p className="mt-3 text-xs text-foreground/45">{items.join(" · ")}</p>;
}

function Evidence({ items }: { items?: any[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3 space-y-1">
      {items.slice(0, 3).map((item, index) => (
        <p key={`${item.claim}-${index}`} className="text-[11px] text-foreground/35">{item.claim || item}</p>
      ))}
    </div>
  );
}

function EngineEmpty({ engine, label }: { engine: any; label: string }) {
  if (!engine || engine.status !== "INSUFFICIENT_DATA") return null;
  return (
    <div className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-foreground/35">INSUFFICIENT_DATA</p>
      <p className="mt-2 text-sm text-foreground/55">{engine.reason || label}</p>
      <Evidence items={engine.evidence} />
    </div>
  );
}

function completedRows(engine: any, key?: string) {
  if (!engine || engine.status !== "COMPLETED") return [];
  return key ? engine.data?.[key] || [] : engine.data || [];
}

function Opportunity({ title, score, body }: { title: string; score: number; body: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <span className="rounded-full bg-brand-accent/10 px-2 py-1 text-xs font-bold text-brand-accent">{score}</span>
      </div>
      <p className="mt-2 text-sm text-foreground/60">{body}</p>
    </div>
  );
}

function QuickWinList({ data, copy }: { data: any; copy: any }) {
  const groups = [
    [copy.oneDayActions, data.oneDayActions],
    [copy.sevenDayActions, data.sevenDayActions],
    [copy.thirtyDayActions, data.thirtyDayActions],
  ];
  return (
    <>
      {groups.map(([label, rows]) => (
        <div key={label} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35">{label}</p>
          {empty(rows, copy.noData)}
          {rows?.map((item: any) => (
            <div key={`${label}-${item.title}`} className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-foreground/60">{item.why}</p>
              <p className="mt-3 text-xs text-foreground/40">{copy.expectedImpact}: {item.expectedGain} · {copy.difficulty}: {item.difficulty} · {copy.confidence}: {item.confidence}</p>
              <Evidence items={item.evidence} />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function empty(items: any[] | undefined, label: string) {
  return !items?.length ? <p className="text-sm text-foreground/40">{label}</p> : null;
}

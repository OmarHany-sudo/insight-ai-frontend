"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileSearch, Lightbulb, Network, Radar, Sparkles, Target, Trophy } from "lucide-react";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTranslation } from "@/hooks/useTranslation";

type Brand = {
  id: string;
  name: string;
  websiteUrl?: string | null;
  industry?: string | null;
  country?: string | null;
};

type SroAnalysis = {
  id: string;
  url: string;
  targetPrompt: string;
  status: string;
  sroScore: number;
  geoScore: number;
  citationReadiness: number;
  entityReadiness: number;
  selectionProbability: number;
  confidenceScore: number;
  pageTitle?: string | null;
  wordCount: number;
  checks?: Array<{ key: string; label: string; passed: boolean; value: number | string; evidence?: string }>;
  evidence?: Array<{ claim: string; source: string; url?: string | null; lastVerifiedAt: string }>;
  competitorComparison?: Array<any>;
  contentGaps?: Array<any>;
  improvementOpportunities?: Array<any>;
  competitorAnalyses?: Array<any>;
};

export default function SroPage() {
  const { t } = useTranslation();
  const copy = t.dashboard.sro;
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [url, setUrl] = useState("");
  const [targetPrompt, setTargetPrompt] = useState("Best cybersecurity company in Saudi Arabia");
  const [analyses, setAnalyses] = useState<SroAnalysis[]>([]);
  const [citationBriefs, setCitationBriefs] = useState<any[]>([]);
  const [promptStatus, setPromptStatus] = useState("");
  const [scorecardStatus, setScorecardStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const selectedBrand = brands.find((brand) => brand.id === brandId);
  const latest = analyses[0];

  const scores = useMemo(() => [
    [copy.sroScore, latest?.sroScore || 0],
    [copy.geoScore, latest?.geoScore || 0],
    [copy.selectionProbability, latest?.selectionProbability || 0],
    [copy.confidence, latest?.confidenceScore || 0],
  ], [copy, latest]);

  const load = async (nextBrandId?: string) => {
    if (!token || !currentOrg) return;
    setLoading(true);
    setError("");
    try {
      const brandList = await apiFetch<Brand[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
      setBrands(brandList);
      const selected = nextBrandId || brandId || activeBrandId || brandList[0]?.id || "";
      setBrandId(selected);
      if (selected) {
        setActiveBrand(selected);
        const brand = brandList.find((item) => item.id === selected);
        if (!url && brand?.websiteUrl) setUrl(brand.websiteUrl);
        const rows = await apiFetch<SroAnalysis[]>(`/sro/brands/${selected}/analyses`, {}, token);
        setAnalyses(rows);
      } else {
        setAnalyses([]);
      }
    } catch (err: any) {
      setError(err.message || copy.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, currentOrg?.id, activeBrandId]);

  const runSro = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !brandId || !url.trim() || !targetPrompt.trim()) return;
    setRunning(true);
    setError("");
    setScorecardStatus("");
    try {
      const result = await apiFetch<{ analysis: SroAnalysis }>("/sro/analyze", {
        method: "POST",
        body: JSON.stringify({
          brandId,
          url,
          targetPrompt,
          industry: selectedBrand?.industry || undefined,
          country: selectedBrand?.country || undefined,
        }),
      }, token);
      setAnalyses((items) => [result.analysis, ...items.filter((item) => item.id !== result.analysis.id)]);
    } catch (err: any) {
      setError(err.message || copy.runError);
    } finally {
      setRunning(false);
    }
  };

  const generatePersonaPrompts = async () => {
    if (!token || !brandId || !targetPrompt.trim()) return;
    setPromptStatus("");
    setError("");
    try {
      const result = await apiFetch<any>("/sro/persona-fanout", {
        method: "POST",
        body: JSON.stringify({ brandId, corePrompt: targetPrompt }),
      }, token);
      setPromptStatus(`${copy.personaGenerated}: ${result.generated}`);
    } catch (err: any) {
      setError(err.message || copy.promptError);
    }
  };

  const runNicheExplorer = async () => {
    if (!token || !brandId || !selectedBrand) return;
    setPromptStatus("");
    setError("");
    try {
      const result = await apiFetch<any>("/sro/niche-explorer", {
        method: "POST",
        body: JSON.stringify({
          brandId,
          industry: selectedBrand.industry || "Cybersecurity",
          country: selectedBrand.country || "Saudi Arabia",
        }),
      }, token);
      setPromptStatus(`${copy.nicheGenerated}: ${result.generated}`);
    } catch (err: any) {
      setError(err.message || copy.promptError);
    }
  };

  const loadCitationBriefs = async () => {
    if (!token || !brandId) return;
    setError("");
    try {
      const result = await apiFetch<any>(`/sro/brands/${brandId}/citation-outreach`, {}, token);
      setCitationBriefs(result.briefs || []);
      if (result.status === "INSUFFICIENT_DATA") setPromptStatus(result.reason);
    } catch (err: any) {
      setError(err.message || copy.citationError);
    }
  };

  const exportScorecard = async () => {
    if (!token || !brandId) return;
    setScorecardStatus("");
    setError("");
    try {
      const result = await apiFetch<any>("/sro/scorecard", {
        method: "POST",
        body: JSON.stringify({ brandId, title: `${selectedBrand?.name || "Brand"} Executive GEO Scorecard` }),
      }, token);
      if (result.status !== "COMPLETED") {
        setScorecardStatus(result.reason || copy.insufficientData);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/sro/scorecards/${result.report.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(copy.reportError);
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = result.report.fileName || "executive-geo-scorecard.pdf";
      link.click();
      URL.revokeObjectURL(href);
      setScorecardStatus(copy.reportGenerated);
    } catch (err: any) {
      setError(err.message || copy.reportError);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-foreground/40 text-sm mt-1 max-w-4xl">{copy.subtitle}</p>
        </div>
        <button
          onClick={exportScorecard}
          disabled={!latest}
          className="btn-premium px-4 py-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> {copy.exportScorecard}
        </button>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
      {promptStatus && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{promptStatus}</div>}
      {scorecardStatus && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{scorecardStatus}</div>}

      <form onSubmit={runSro} className="rounded-2xl border border-brand-border bg-brand-surface/30 glass p-6 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_1fr_auto] gap-3">
          <select
            value={brandId}
            onChange={(event) => load(event.target.value)}
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          >
            <option value="">{copy.selectBrand}</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://brand.com/page"
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          />
          <input
            value={targetPrompt}
            onChange={(event) => setTargetPrompt(event.target.value)}
            placeholder={copy.promptPlaceholder}
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          />
          <button disabled={running || !brandId || !url.trim() || !targetPrompt.trim()} className="btn-premium px-4 py-2 text-sm disabled:opacity-50">
            {running ? copy.running : copy.runAnalysis}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={generatePersonaPrompts} disabled={!brandId} className="rounded-lg border border-brand-border px-3 py-2 text-sm text-foreground/70 hover:bg-brand-border/30 disabled:opacity-50">
            {copy.personaFanout}
          </button>
          <button type="button" onClick={runNicheExplorer} disabled={!brandId} className="rounded-lg border border-brand-border px-3 py-2 text-sm text-foreground/70 hover:bg-brand-border/30 disabled:opacity-50">
            {copy.nicheExplorer}
          </button>
          <button type="button" onClick={loadCitationBriefs} disabled={!brandId} className="rounded-lg border border-brand-border px-3 py-2 text-sm text-foreground/70 hover:bg-brand-border/30 disabled:opacity-50">
            {copy.citationOutreach}
          </button>
        </div>
      </form>

      {loading && <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">{t.common.loading}</div>}
      {!loading && !latest && <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">{copy.empty}</div>}

      {latest && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {scores.map(([label, value]) => (
              <ScoreCard key={label} label={String(label)} value={Number(value)} />
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
            <Panel title={copy.pageDecision} icon={FileSearch}>
              <div className="space-y-3 text-sm text-foreground/60">
                <p><span className="text-foreground/35">{copy.pageTitle}:</span> {latest.pageTitle || t.common.noData}</p>
                <p><span className="text-foreground/35">{copy.url}:</span> {latest.url}</p>
                <p><span className="text-foreground/35">{copy.targetPrompt}:</span> {latest.targetPrompt}</p>
                <p><span className="text-foreground/35">{copy.wordCount}:</span> {latest.wordCount}</p>
              </div>
            </Panel>
            <Panel title={copy.evidence} icon={Radar}>
              <div className="space-y-3">
                {latest.evidence?.map((item, index) => (
                  <EvidenceRow key={`${item.source}-${index}`} item={item} />
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
            <Panel title={copy.competitorComparison} icon={Trophy}>
              <div className="space-y-4">
                {!latest.competitorComparison?.length && <p className="text-sm text-foreground/40">{copy.noCompetitors}</p>}
                {latest.competitorComparison?.map((item) => (
                  <div key={item.competitorId} className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{item.competitorName}</h3>
                      <span className="rounded-full bg-brand-accent/10 px-2 py-1 text-[11px] font-bold text-brand-accent">{item.threatLevel}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/60">{item.whyCompetitorWins}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-foreground/40">
                      <span>{copy.competitorScore}: {item.competitorScore}</span>
                      <span>{copy.scoreDelta}: {item.scoreDelta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title={copy.contentGaps} icon={Lightbulb}>
              <div className="space-y-4">
                {!latest.contentGaps?.length && <p className="text-sm text-foreground/40">{copy.noGaps}</p>}
                {latest.contentGaps?.slice(0, 8).map((gap, index) => (
                  <div key={`${gap.title}-${index}`} className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-4">
                    <h3 className="font-bold">{gap.title}</h3>
                    <p className="mt-2 text-sm text-foreground/60">{gap.recommendedAction}</p>
                    <p className="mt-2 text-xs text-brand-accent">{copy.expectedGain}: +{gap.expectedScoreIncrease}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
            <Panel title={copy.actionPlan} icon={Target}>
              <div className="space-y-4">
                {!latest.improvementOpportunities?.length && <p className="text-sm text-foreground/40">{copy.noActions}</p>}
                {latest.improvementOpportunities?.slice(0, 8).map((item) => (
                  <div key={`${item.priority}-${item.title}`} className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-lg bg-brand-accent/15 text-brand-accent text-xs font-bold flex items-center justify-center">{item.priority}</span>
                      <h3 className="font-bold">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-foreground/60">{item.recommendedAction}</p>
                    <p className="mt-2 text-xs text-brand-accent">{copy.expectedGain}: +{item.expectedScoreIncrease}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title={copy.citationOutreach} icon={Network}>
              <div className="space-y-4">
                {!citationBriefs.length && <p className="text-sm text-foreground/40">{copy.loadBriefsHint}</p>}
                {citationBriefs.slice(0, 8).map((brief) => (
                  <div key={brief.domain} className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{brief.domain}</h3>
                      <span className="rounded-full bg-brand-accent/10 px-2 py-1 text-[11px] font-bold text-brand-accent">{brief.opportunityScore}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/60">{brief.suggestedOutreachAngle}</p>
                    <p className="mt-2 text-xs text-foreground/35">{brief.whyAiTrustsThisSource}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface/30 p-5">
      <p className="text-xs text-foreground/40">{label}</p>
      <p className="text-3xl font-bold mt-2">{Math.round(value)}</p>
      <div className="mt-4 h-2 rounded-full bg-brand-border/30 overflow-hidden">
        <div className="h-full bg-brand-accent" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
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

function EvidenceRow({ item }: { item: { claim: string; source: string; url?: string | null; lastVerifiedAt: string } }) {
  return (
    <div className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-3">
      <div className="flex items-center gap-2 text-xs text-brand-accent">
        <Sparkles className="w-3 h-3" />
        {item.source}
      </div>
      <p className="mt-2 text-sm text-foreground/65">{item.claim}</p>
      <p className="mt-2 text-xs text-foreground/35">{new Date(item.lastVerifiedAt).toLocaleString()}</p>
    </div>
  );
}

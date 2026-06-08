"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Gauge, SearchCheck, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";

type Brand = {
  id: string;
  name: string;
  websiteUrl?: string;
};

type GeoAudit = {
  id: string;
  brandId?: string | null;
  url: string;
  status: string;
  geoScore: number;
  aeoScore: number;
  authorityScore: number;
  citationReadiness: number;
  schemaReadiness: number;
  faqCoverage: number;
  contentCoverage: number;
  targetKeywords: string[];
  pageTitle?: string | null;
  wordCount: number;
  checks?: Array<{ key: string; label: string; passed: boolean; value?: string | number | boolean; impact: string }>;
  recommendations?: Array<{ priority: number; title: string; action: string; expectedImpact: string; category: string; rationale: string }>;
  error?: string | null;
  createdAt: string;
  brand?: Brand | null;
};

export default function GeoAuditPage() {
  const { t } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [audits, setAudits] = useState<GeoAudit[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId);
  const latestAudit = audits[0];
  const scoreLabels = t.dashboard.geoAudit;

  const scoreCards = useMemo(() => {
    const audit = latestAudit;
    return [
      [scoreLabels.geoScore, audit?.geoScore],
      [scoreLabels.aeoScore, audit?.aeoScore],
      [scoreLabels.authorityScore, audit?.authorityScore],
      [scoreLabels.citationReadiness, audit?.citationReadiness],
      [scoreLabels.schemaReadiness, audit?.schemaReadiness],
      [scoreLabels.faqCoverage, audit?.faqCoverage],
      [scoreLabels.contentCoverage, audit?.contentCoverage],
    ] as Array<[string, number | undefined]>;
  }, [latestAudit, scoreLabels]);

  const load = async () => {
    if (!token || !currentOrg) return;
    setLoading(true);
    setError("");
    try {
      const brandList = await apiFetch<Brand[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
      setBrands(brandList);
      const nextBrandId = selectedBrandId || activeBrandId || brandList[0]?.id || "";
      if (nextBrandId && nextBrandId !== activeBrandId) setActiveBrand(nextBrandId);
      setSelectedBrandId(nextBrandId);
      const query = nextBrandId ? `brandId=${nextBrandId}` : `organizationId=${currentOrg.id}`;
      const auditList = await apiFetch<GeoAudit[]>(`/geo-audits?${query}`, {}, token);
      setAudits(auditList);
      const nextUrl = brandList.find((brand) => brand.id === nextBrandId)?.websiteUrl || auditList[0]?.url || "";
      if (!url && nextUrl) setUrl(nextUrl);
    } catch (err: any) {
      setError(err.message || t.dashboard.geoAudit.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, currentOrg, activeBrandId]);

  const runAudit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !currentOrg || !url.trim()) return;
    setRunning(true);
    setError("");
    setStatus("");
    try {
      const targetKeywords = keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const audit = await apiFetch<GeoAudit>("/geo-audits", {
        method: "POST",
        body: JSON.stringify({
          organizationId: currentOrg.id,
          brandId: selectedBrandId || undefined,
          url,
          targetKeywords,
        }),
      }, token);
      setAudits((items) => [audit, ...items.filter((item) => item.id !== audit.id)]);
      setStatus(t.dashboard.geoAudit.auditStored);
    } catch (err: any) {
      setError(err.message || t.dashboard.geoAudit.runError);
    } finally {
      setRunning(false);
    }
  };

  const handleBrandChange = async (brandId: string) => {
    setSelectedBrandId(brandId);
    if (brandId) {
      setActiveBrand(brandId);
      const brand = brands.find((item) => item.id === brandId);
      if (brand?.websiteUrl) setUrl(brand.websiteUrl);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.geoAudit.title}</h1>
          <p className="text-foreground/40 text-sm mt-1 max-w-3xl">{t.dashboard.geoAudit.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface/30 px-3 py-2 text-sm text-foreground/50">
          <SearchCheck className="w-4 h-4 text-brand-accent" />
          {latestAudit ? t.dashboard.geoAudit.latestAudit : t.dashboard.geoAudit.noAudits}
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
      {status && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{status}</div>}

      <form onSubmit={runAudit} className="rounded-2xl border border-brand-border bg-brand-surface/30 glass p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr_auto] gap-3">
          <select
            value={selectedBrandId}
            onChange={(event) => handleBrandChange(event.target.value)}
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          >
            <option value="">{t.dashboard.geoAudit.noBrand}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t.dashboard.geoAudit.websitePlaceholder}
            aria-label={t.dashboard.geoAudit.websiteUrl}
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          />
          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder={t.dashboard.geoAudit.keywordsPlaceholder}
            aria-label={t.dashboard.geoAudit.keywords}
            className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
          />
          <button disabled={running || !url.trim()} className="btn-premium px-4 py-2 text-sm disabled:opacity-50">
            {running ? t.dashboard.geoAudit.running : t.dashboard.geoAudit.runAudit}
          </button>
        </div>
        {selectedBrand && <p className="text-xs text-foreground/35">{t.dashboard.geoAudit.brand}: {selectedBrand.name}</p>}
      </form>

      {loading && <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">{t.common.loading}</div>}

      {!loading && !latestAudit && (
        <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">
          {t.dashboard.geoAudit.noAudits}
        </div>
      )}

      {latestAudit && (
        <>
          {latestAudit.status === "FAILED" && latestAudit.error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300">{latestAudit.error}</div>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-brand-accent" />
              <h2 className="text-lg font-bold">{t.dashboard.geoAudit.scoreBreakdown}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {scoreCards.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-brand-border bg-brand-surface/30 p-5">
                  <p className="text-xs text-foreground/40">{label}</p>
                  <p className="text-3xl font-bold mt-2">{Math.round(value || 0)}</p>
                  <div className="mt-4 h-2 rounded-full bg-brand-border/30 overflow-hidden">
                    <div className="h-full bg-brand-accent" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-foreground/50">
              <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-4">{t.dashboard.geoAudit.websiteUrl}: {latestAudit.url}</div>
              <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-4">{t.dashboard.geoAudit.wordCount}: {latestAudit.wordCount}</div>
              <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-4">{t.dashboard.geoAudit.pageTitle}: {latestAudit.pageTitle || t.common.noData}</div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
            <div className="rounded-2xl border border-brand-border bg-brand-surface/30 glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <ClipboardList className="w-5 h-5 text-brand-accent" />
                <h2 className="font-bold">{t.dashboard.geoAudit.readinessChecks}</h2>
              </div>
              <div className="space-y-3">
                {!latestAudit.checks?.length && <p className="text-sm text-foreground/40">{t.dashboard.geoAudit.noChecks}</p>}
                {latestAudit.checks?.map((check) => (
                  <div key={check.key} className="flex items-start justify-between gap-4 rounded-xl border border-brand-border/70 bg-brand-primary/30 p-3">
                    <div>
                      <p className="text-sm font-medium">{check.label}</p>
                      <p className="text-xs text-foreground/35 mt-1">{String(check.value ?? "")}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${check.passed ? "bg-brand-accent/10 text-brand-accent" : "bg-red-500/10 text-red-300"}`}>
                      {check.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {check.passed ? t.dashboard.geoAudit.passed : t.dashboard.geoAudit.needsWork}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-surface/30 glass p-6">
              <h2 className="font-bold mb-5">{t.dashboard.geoAudit.priorityPlan}</h2>
              <div className="space-y-4">
                {!latestAudit.recommendations?.length && <p className="text-sm text-foreground/40">{t.dashboard.geoAudit.noRecommendations}</p>}
                {latestAudit.recommendations?.map((rec) => (
                  <div key={`${rec.priority}-${rec.title}`} className="rounded-xl border border-brand-border/70 bg-brand-primary/30 p-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="h-7 w-7 rounded-lg bg-brand-accent/15 text-brand-accent text-xs font-bold flex items-center justify-center">{rec.priority}</span>
                      <h3 className="font-bold">{rec.title}</h3>
                      <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[11px] font-bold text-blue-300">{rec.category}</span>
                    </div>
                    <p className="text-sm text-foreground/65">{rec.action}</p>
                    <p className="mt-3 text-xs text-brand-accent font-bold">{t.dashboard.geoAudit.expectedImpact}: {rec.expectedImpact}</p>
                    <p className="mt-2 text-xs text-foreground/35">{rec.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-border bg-brand-surface/20 p-6">
            <h2 className="font-bold mb-4">{t.dashboard.geoAudit.history}</h2>
            <div className="space-y-2">
              {audits.map((audit) => (
                <button
                  key={audit.id}
                  type="button"
                  onClick={() => setAudits((items) => [audit, ...items.filter((item) => item.id !== audit.id)])}
                  className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 rounded-xl border border-brand-border bg-brand-primary/30 p-3 text-left text-sm hover:border-brand-accent/40 transition-colors"
                >
                  <span className="truncate">{audit.brand?.name || currentOrg?.name} · {audit.url}</span>
                  <span className="text-foreground/40">{new Date(audit.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono text-brand-accent">{Math.round(audit.geoScore)} GEO</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

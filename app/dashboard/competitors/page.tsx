"use client";

import { ShieldCheck, TrendingUp, Users, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CompetitorsPage() {
  const { t } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [brands, setBrands] = useState<any[]>([]);
  const [share, setShare] = useState<any>(null);
  const [brandForm, setBrandForm] = useState({ name: "", websiteUrl: "", industry: "", country: "" });
  const [competitorForm, setCompetitorForm] = useState({ name: "", websiteUrl: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const selectedBrand = brands.find((brand) => brand.id === activeBrandId) || brands[0];

  const load = async () => {
    if (!token || !currentOrg) return;
    const brandList = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
    setBrands(brandList);
    const brandId = activeBrandId || brandList[0]?.id;
    if (!activeBrandId && brandId) setActiveBrand(brandId);
    if (brandId) {
      const shareData = await apiFetch<any>(`/analytics/share-of-voice?brandId=${brandId}`, {}, token);
      setShare(shareData);
    }
  };

  useEffect(() => {
    load().catch((err) => setError(err.message || t.dashboard.competitors.loadError));
  }, [token, currentOrg, activeBrandId]);

  const createBrand = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !currentOrg) return;
    setError("");
    setStatus("");
    try {
      const brand = await apiFetch<any>("/brands", {
        method: "POST",
        body: JSON.stringify({ ...brandForm, organizationId: currentOrg.id }),
      }, token);
      setBrandForm({ name: "", websiteUrl: "", industry: "", country: "" });
      setActiveBrand(brand.id);
      setStatus(`${brand.name} ${t.dashboard.competitors.created}`);
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.competitors.createError);
    }
  };

  const addCompetitor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !selectedBrand) return;
    setError("");
    setStatus("");
    try {
      await apiFetch(`/brands/${selectedBrand.id}/competitors`, {
        method: "POST",
        body: JSON.stringify(competitorForm),
      }, token);
      setStatus(`${competitorForm.name} ${t.dashboard.competitors.added}`);
      setCompetitorForm({ name: "", websiteUrl: "" });
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.competitors.addError);
    }
  };

  const removeCompetitor = async (competitorId: string) => {
    if (!token || !selectedBrand) return;
    setError("");
    setStatus("");
    try {
      await apiFetch(`/brands/${selectedBrand.id}/competitors/${competitorId}`, { method: "DELETE" }, token);
      setStatus(t.dashboard.competitors.removed);
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.competitors.removeError);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.competitors}</h1>
          <p className="text-foreground/40 text-sm mt-1">{t.dashboard.competitors.subtitle}</p>
        </div>
        <button
          disabled={!selectedBrand || !competitorForm.name}
          onClick={() => document.getElementById("competitor-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
          className="px-4 py-2 border border-brand-border bg-brand-surface/50 text-foreground font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-brand-border/80 transition-all"
        >
          <Users className="w-4 h-4" /> {t.dashboard.competitors.addCompetitor}
        </button>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
      {status && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{status}</div>}

      <form onSubmit={createBrand} className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass space-y-4">
        <h2 className="font-bold">{t.dashboard.competitors.brandManagement}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} placeholder={t.dashboard.competitors.brandName} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
          <input type="url" value={brandForm.websiteUrl} onChange={(e) => setBrandForm({ ...brandForm, websiteUrl: e.target.value })} placeholder={t.dashboard.competitors.website} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
          <input value={brandForm.industry} onChange={(e) => setBrandForm({ ...brandForm, industry: e.target.value })} placeholder={t.dashboard.competitors.industry} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
          <input value={brandForm.country} onChange={(e) => setBrandForm({ ...brandForm, country: e.target.value })} placeholder={t.dashboard.competitors.country} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
        </div>
        <button disabled={!brandForm.name || !brandForm.websiteUrl || !brandForm.industry || !brandForm.country} className="btn-premium px-4 py-2 text-sm disabled:opacity-50">{t.dashboard.competitors.createBrand}</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => setActiveBrand(brand.id)}
            className={`px-3 py-2 rounded-lg border text-sm ${selectedBrand?.id === brand.id ? "border-brand-accent text-brand-accent bg-brand-accent/10" : "border-brand-border text-foreground/60"}`}
          >
            {brand.name}
          </button>
        ))}
      </div>

      <form id="competitor-form" onSubmit={addCompetitor} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <input value={competitorForm.name} onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })} placeholder={t.dashboard.competitors.competitorName} className="bg-brand-surface/50 border border-brand-border rounded-lg p-3 text-sm" />
        <input type="url" value={competitorForm.websiteUrl} onChange={(e) => setCompetitorForm({ ...competitorForm, websiteUrl: e.target.value })} placeholder={t.dashboard.competitors.competitorWebsite} className="bg-brand-surface/50 border border-brand-border rounded-lg p-3 text-sm" />
        <button disabled={!selectedBrand || !competitorForm.name} className="px-4 py-2 rounded-lg bg-brand-border/40 font-bold text-sm disabled:opacity-50">{t.common.add}</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/30 glass">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-accent" />
            {t.dashboard.competitors.shareComparison}
          </h3>
          <div className="space-y-6">
            {(share?.breakdown || [{ name: selectedBrand?.name || t.dashboard.noBrandSelected, mentions: 0, type: "brand" }]).map((comp: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={i === 0 ? "font-bold text-brand-accent" : "text-foreground/60"}>{comp.name}</span>
                  <span className="font-mono">{comp.mentions} {t.common.mentions}</span>
                </div>
                <div className="w-full h-2 bg-brand-border/30 rounded-full overflow-hidden">
                  <div className={`h-full ${i === 0 ? "bg-brand-accent" : "bg-blue-500"} transition-all duration-1000 ease-out`} style={{ width: `${share?.totalMentions ? (comp.mentions / share.totalMentions) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/30 glass">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-accent" />
            {t.dashboard.competitors.competitorVelocity}
          </h3>
          <p className="text-foreground/40 text-sm mb-6">{t.dashboard.competitors.storedFor} {selectedBrand?.name || t.dashboard.competitors.selectedBrand}.</p>
          <div className="space-y-3">
            {!selectedBrand?.competitors?.length && <p className="text-sm text-foreground/40">{t.dashboard.competitors.noCompetitors}</p>}
            {selectedBrand?.competitors?.map((competitor: any) => (
              <div key={competitor.id} className="flex items-center justify-between p-3 rounded-lg border border-brand-border bg-brand-primary/40">
                <div>
                  <p className="text-sm font-bold">{competitor.name}</p>
                  <p className="text-xs text-foreground/40">{competitor.websiteUrl || t.dashboard.competitors.noWebsite}</p>
                </div>
                <button onClick={() => removeCompetitor(competitor.id)} className="p-2 text-foreground/30 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

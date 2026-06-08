"use client";

import { Target, Plus, Search, Trash2, Play } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { apiFetch } from "@/lib/api";

export default function PromptsPage() {
  const { t } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [queryText, setQueryText] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectedBrandId = activeBrandId || brands[0]?.id;

  const load = async () => {
    if (!token || !currentOrg) return;
    const brandList = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
    setBrands(brandList);
    const brandId = activeBrandId || brandList[0]?.id;
    if (!activeBrandId && brandId) setActiveBrand(brandId);
    const promptList = await apiFetch<any[]>(`/prompts?organizationId=${currentOrg.id}${brandId ? `&brandId=${brandId}` : ""}`, {}, token);
    setPrompts(promptList);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message || t.dashboard.prompts.loadError));
  }, [token, currentOrg, activeBrandId]);

  const createPrompt = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBrandId || !queryText.trim() || !token) return;
    setError("");
    await apiFetch("/prompts", {
      method: "POST",
      body: JSON.stringify({ brandId: selectedBrandId, queryText, frequency: "weekly" }),
    }, token);
    setQueryText("");
    await load();
  };

  const runPrompt = async (id: string) => {
    if (!token) return;
    setLoadingId(id);
    setError("");
    try {
      await apiFetch(`/prompts/${id}/run`, { method: "POST", body: JSON.stringify({}) }, token);
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.prompts.runError);
      await load();
    } finally {
      setLoadingId(null);
    }
  };

  const deletePrompt = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/prompts/${id}`, { method: "DELETE" }, token);
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.prompts.deleteError);
    }
  };

  const filteredPrompts = prompts.filter((p) => p.queryText.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.prompts}</h1>
          <p className="text-foreground/40 text-sm mt-1">{t.dashboard.prompts.manage}</p>
        </div>
        <button
          disabled={!selectedBrandId || !queryText.trim()}
          onClick={() => document.getElementById("create-prompt-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
          className="px-4 py-2 bg-brand-accent text-brand-primary font-bold rounded-lg text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> {t.dashboard.prompts.addPrompt}
        </button>
      </div>

      <form id="create-prompt-form" onSubmit={createPrompt} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3">
        <select
          value={selectedBrandId || ""}
          onChange={(e) => setActiveBrand(e.target.value)}
          className="bg-brand-surface/50 border border-brand-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          {brands.length === 0 && <option value="">{t.dashboard.prompts.createBrandFirst}</option>}
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={t.dashboard.prompts.placeholder}
          className="bg-brand-surface/50 border border-brand-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent"
        />
      </form>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.dashboard.prompts.filterPrompts}
          className="w-full bg-brand-surface/50 border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredPrompts.length === 0 && (
          <div className="p-8 rounded-xl border border-brand-border bg-brand-surface/20 text-foreground/40 text-sm">
            {t.dashboard.prompts.empty}
          </div>
        )}
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="group p-6 rounded-xl border border-brand-border bg-brand-surface/30 glass flex items-center justify-between hover:border-brand-accent/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{prompt.queryText}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">{t.dashboard.prompts.activeTracking}</p>
                  <span className="w-1 h-1 rounded-full bg-brand-border" />
                  <span className="text-[10px] text-green-500 font-bold uppercase">
                    {prompt.responses?.[0]?.status || t.dashboard.notRun}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => runPrompt(prompt.id)}
                disabled={loadingId === prompt.id}
                className="p-2 rounded-lg hover:bg-brand-accent/10 text-brand-accent transition-colors disabled:opacity-50"
                title={t.dashboard.prompts.runNow}
              >
                <Play className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deletePrompt(prompt.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

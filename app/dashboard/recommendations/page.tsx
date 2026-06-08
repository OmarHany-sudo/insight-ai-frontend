"use client";

import { Zap, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { apiFetch } from "@/lib/api";

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const { token, currentOrg } = useAuthStore();
  const { activeBrandId, setActiveBrand } = useDashboardStore();
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState<any>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const hasSelectedBrand = Boolean(activeBrandId || recommendations.length);

  const load = async () => {
    if (!token || !currentOrg) return;
    let brandId = activeBrandId;
    if (!brandId) {
      const brands = await apiFetch<any[]>(`/brands?organizationId=${currentOrg.id}`, {}, token);
      brandId = brands[0]?.id;
      if (brandId) setActiveBrand(brandId);
    }
    if (!brandId) return;
    const data = await apiFetch<any[]>(`/analytics/recommendations?brandId=${brandId}`, {}, token);
    setRecommendations(data);
    setResolvedIds(data.filter((rec) => rec.isActioned).map((rec) => rec.id));
    if (!question) setQuestion(t.dashboard.recommendations.examples[2]);
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err.message || t.dashboard.recommendations.loadError);
      setRecommendations([]);
    });
  }, [token, currentOrg, activeBrandId, setActiveBrand]);

  const handleResolve = async (id: string) => {
    if (resolvedIds.includes(id)) return;
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/analytics/recommendations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActioned: true }),
      }, token);
      await load();
    } catch (err: any) {
      setError(err.message || t.dashboard.recommendations.updateError);
    }
  };

  const askAssistant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !activeBrandId || !question.trim()) return;
    setError("");
    setAssistantLoading(true);
    try {
      const data = await apiFetch<any>("/assistant/ask", {
        method: "POST",
        body: JSON.stringify({ brandId: activeBrandId, question }),
      }, token);
      setAssistantAnswer(data);
    } catch (err: any) {
      setError(err.message || t.dashboard.recommendations.askError);
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.nav.recommendations}</h1>
        <p className="text-foreground/40 text-sm mt-1">{t.dashboard.recommendations.subtitle}</p>
      </div>

      <div className="space-y-4">
        {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
        <form onSubmit={askAssistant} className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass space-y-4">
          <div>
            <h2 className="font-bold">{t.dashboard.recommendations.assistantTitle}</h2>
            <p className="text-xs text-foreground/40 mt-1">{t.dashboard.recommendations.assistantSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t.dashboard.recommendations.examples[1]}
              className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm"
            />
            <button
              disabled={!activeBrandId || !question.trim() || assistantLoading}
              className="btn-premium px-4 py-2 text-sm disabled:opacity-50"
            >
              {assistantLoading ? t.dashboard.recommendations.asking : t.dashboard.recommendations.ask}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.dashboard.recommendations.examples.map((item: string) => (
              <button
                type="button"
                key={item}
                onClick={() => setQuestion(item)}
                className="px-3 py-1.5 rounded-lg border border-brand-border text-xs text-foreground/60 hover:text-brand-accent hover:border-brand-accent/40 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          {assistantAnswer && (
            <div className="rounded-xl border border-brand-border bg-brand-primary/50 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">{t.dashboard.recommendations.provider}: {assistantAnswer.providerName || assistantAnswer.provider}</p>
                <p className="text-[10px] text-foreground/30">{t.dashboard.recommendations.liveResponse}</p>
              </div>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{assistantAnswer.answer}</p>
            </div>
          )}
        </form>
        {!hasSelectedBrand && (
          <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">
            {t.dashboard.recommendations.selectBrand}
          </div>
        )}
        {activeBrandId && recommendations.length === 0 && (
          <div className="p-8 rounded-2xl border border-brand-border bg-brand-surface/20 text-sm text-foreground/40">
            {t.dashboard.recommendations.empty}
          </div>
        )}
        {recommendations.map((rec) => {
          const isResolved = resolvedIds.includes(rec.id);
          return (
            <div 
              key={rec.id} 
              className={`p-6 rounded-2xl border transition-all duration-500 flex items-start justify-between gap-6 group ${
                isResolved 
                  ? "bg-brand-surface/10 border-brand-border/20 opacity-50 grayscale" 
                  : "border-brand-border bg-brand-surface/30 glass hover:border-brand-accent/30"
              }`}
            >
              <div className="flex gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isResolved ? 'bg-brand-border/20 text-foreground/20' : rec.priority === 'high' ? 'bg-brand-accent/20 text-brand-accent' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold transition-all ${isResolved ? 'line-through text-foreground/40' : ''}`}>{rec.title}</h3>
                    {!isResolved && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.priority === 'high' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-blue-500/10 text-blue-500'}`}>
                        {rec.priority} {t.dashboard.recommendations.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/35 mb-1">{t.dashboard.recommendations.actionPlan}</p>
                  <p className="text-foreground/60 text-sm max-w-2xl">{rec.content}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">{t.dashboard.recommendations.engine}: {rec.snapshot?.engine?.name || t.dashboard.recommendations.stored}</span>
                    {!isResolved && (
                      <button className="text-brand-accent text-xs font-bold flex items-center gap-1 hover:underline">
                        {t.dashboard.recommendations.viewGuide} <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleResolve(rec.id)}
                disabled={isResolved}
                className={`p-3 rounded-full border transition-all ${
                  isResolved 
                    ? "bg-brand-accent/20 border-brand-accent text-brand-accent scale-90" 
                    : "border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

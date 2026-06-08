"use client";

import { CreditCard, Check, Zap, Shield, Crown, Gauge } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button, Card } from "@/components/ui";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";

const PLAN_ICONS = [Zap, Shield, Gauge, Crown, Crown];

export function BillingSettings() {
  const { currentOrg, token } = useAuthStore();
  const { t } = useTranslation();
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadBilling = async () => {
    if (!token || !currentOrg) return;
    setLoading(true);
    const [planData, subscriptionData] = await Promise.all([
      apiFetch<any[]>("/billing/plans", {}, token),
      apiFetch<any>(`/billing/subscription?organizationId=${currentOrg.id}`, {}, token),
    ]);
    setPlans(planData);
    setSubscription(subscriptionData);
    setLoading(false);
  };

  useEffect(() => {
    loadBilling().catch((error) => {
      setBillingNotice(error instanceof Error ? error.message : t.billing.portalDeferred);
      setLoading(false);
    });
  }, [token, currentOrg?.id]);

  const handleCheckout = async (planId: string) => {
    if (!token || !currentOrg) return;
    const response = await apiFetch<any>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ organizationId: currentOrg.id, planId }),
    }, token);
    if (response.url) window.location.href = response.url;
    setBillingNotice(response.message || t.billing.stripeDeferred);
  };

  const handlePortal = async () => {
    if (!token || !currentOrg) return;
    const response = await apiFetch<any>(`/billing/portal?organizationId=${currentOrg.id}`, {}, token);
    if (response.url) window.location.href = response.url;
    setBillingNotice(response.message || t.billing.portalDeferred);
  };

  const usageItems = [
    ["brands", t.billing.brands],
    ["competitors", t.billing.competitors],
    ["users", t.billing.users],
    ["prompts", t.billing.prompts],
    ["aiRequests", t.billing.aiRequests],
    ["reports", t.billing.reports],
  ];

  const formatLimit = (value: number) => value >= 999999 ? t.common.unlimited : String(value);
  const currentPlanCode = subscription?.planCode;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t.billing.title}</h2>
        <p className="text-foreground/40 text-sm mt-1">{t.billing.subtitle}</p>
      </div>

      <Card className="p-6 flex items-center justify-between border-brand-accent/20 bg-brand-accent/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {t.billing.currentPlan}: <span className="text-brand-accent font-bold">{subscription?.planName || currentOrg?.billingPlan || t.billing.plans.starter}</span>
            </p>
            <p className="text-xs text-foreground/40">
              {t.billing.renewalDate}: {subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : t.common.noData}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handlePortal}>{t.billing.manageBilling}</Button>
      </Card>

      {billingNotice && (
        <div className="rounded-lg border border-brand-border bg-brand-surface/40 px-4 py-3 text-sm text-foreground/60">
          {billingNotice}
        </div>
      )}

      <Card className="p-6">
        <h3 className="font-bold mb-4">{t.billing.usage}</h3>
        {loading && <p className="text-sm text-foreground/40">{t.common.loading}</p>}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usageItems.map(([key, label]) => {
              const used = subscription?.usage?.[key] || 0;
              const limit = subscription?.limits?.[key] ?? 0;
              const percent = limit >= 999999 || limit === 0 ? 0 : Math.min(100, (used / limit) * 100);
              return (
                <div key={key} className="rounded-xl border border-brand-border bg-brand-primary/40 p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-foreground/50">{used} / {formatLimit(limit)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-border/40 overflow-hidden">
                    <div className="h-full bg-brand-accent" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {plans.map((plan, index) => {
          const Icon = PLAN_ICONS[index] || Shield;
          const current = currentPlanCode === plan.code;
          const featured = plan.code === "premium";
          return (
          <Card 
            key={plan.id}
            className={`p-6 flex flex-col ${featured ? 'border-brand-accent shadow-[0_0_20px_-10px_rgba(0,245,212,0.5)]' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${featured ? 'bg-brand-accent/20' : 'bg-brand-border/30'}`}>
                <Icon className={`w-5 h-5 ${featured ? 'text-brand-accent' : 'text-foreground/40'}`} />
              </div>
              {featured && <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">{t.billing.recommended}</span>}
            </div>
            
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{plan.code === "enterprise" ? t.common.custom : `$${plan.priceMonthly}`}</span>
              {plan.code !== "enterprise" && <span className="text-foreground/40 text-sm">{t.common.perMonth}</span>}
            </div>

            <ul className="mt-8 space-y-4 flex-1">
              {[
                `${t.billing.brands}: ${formatLimit(plan.brandsLimit)}`,
                `${t.billing.competitors}: ${formatLimit(plan.competitorsLimit)}`,
                `${t.billing.prompts}: ${formatLimit(plan.promptsLimit)}`,
                `${t.billing.aiRequests}: ${formatLimit(plan.aiRequestsLimit)}`,
                `${t.billing.reports}: ${formatLimit(plan.reportsLimit)}`,
                `${t.billing.support}: ${plan.supportLevel}`,
                `${t.billing.whiteLabel}: ${plan.whiteLabelAccess ? t.billing.included : t.billing.notIncluded}`,
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-foreground/60">
                  <Check className="w-4 h-4 text-brand-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="mt-8 w-full" 
              variant={featured ? "primary" : "secondary"}
              disabled={current}
              onClick={() => handleCheckout(plan.id)}
            >
              {current ? t.billing.currentPlanButton : plan.code === "enterprise" ? t.billing.contactSales : t.billing.upgradePlan}
            </Button>
          </Card>
        );})}
      </div>

      <div className="rounded-xl border border-brand-border p-6 bg-brand-surface/20">
        <h4 className="text-sm font-bold mb-2">{t.billing.currentPlan}</h4>
        <p className="text-sm text-foreground/50">
          {t.billing.stripeDeferred}
        </p>
      </div>
    </div>
  );
}

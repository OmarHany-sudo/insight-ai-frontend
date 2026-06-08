"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export function Pricing() {
  const { t } = useTranslation();
  const plans = [
    {
      code: "starter",
      name: t.billing.plans.starter,
      price: "$0",
      description: t.pricing.descriptions.free,
      features: [`1 ${t.billing.brands}`, `3 ${t.billing.competitors}`, `10 ${t.billing.prompts}`, `20 ${t.billing.aiRequests}`, t.pricing.basicDashboard],
      cta: t.pricing.plans.free,
      featured: false,
    },
    {
      code: "pro",
      name: t.billing.plans.pro,
      price: "$39",
      description: t.pricing.descriptions.pro,
      features: [`3 ${t.billing.brands}`, `15 ${t.billing.competitors}`, `200 ${t.billing.prompts}`, `500 ${t.billing.aiRequests}`, t.billing.reports, t.dashboard.recommendationsTitle],
      cta: t.pricing.plans.getStarted,
      featured: true,
    },
    {
      code: "premium",
      name: t.billing.plans.premium,
      price: "$79",
      description: t.pricing.descriptions.premium,
      features: [`10 ${t.billing.brands}`, `50 ${t.billing.competitors}`, `1000 ${t.billing.prompts}`, `3000 ${t.billing.aiRequests}`, t.pricing.historicalAnalytics],
      cta: t.pricing.plans.getStarted,
      featured: false,
    },
    {
      code: "agency",
      name: t.billing.plans.agency,
      price: "$149",
      description: t.pricing.descriptions.agency,
      features: [t.common.unlimited, t.dashboard.settings.teamMembers, t.billing.whiteLabel, t.pricing.clientWorkspaces, t.billing.support],
      cta: t.pricing.plans.getStarted,
      featured: false,
    },
    {
      code: "enterprise",
      name: t.billing.plans.enterprise,
      price: "Custom",
      description: t.pricing.descriptions.enterprise,
      features: [t.pricing.customLimits, t.billing.apiAccess, t.billing.whiteLabel, t.pricing.dedicatedSupport],
      cta: t.pricing.plans.contactSales,
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-foreground/60 text-lg">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                plan.featured
                  ? "border-brand-accent bg-brand-accent/5 shadow-[0_0_40px_-15px_rgba(0,245,212,0.3)]"
                  : "border-brand-border bg-brand-surface/30 glass hover:border-brand-border/80"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price === "Custom" ? t.common.custom : plan.price}</span>
                {plan.price !== "Custom" && <span className="text-foreground/40 ml-2">{t.common.perMonth}</span>}
              </div>
              <p className="text-sm text-foreground/60 mb-8 min-h-[40px]">
                {plan.description}
              </p>

              <Link
                href={`/register?plan=${plan.code}`}
                className={`w-full py-4 rounded-xl font-bold mb-8 transition-all flex items-center justify-center ${
                  plan.featured
                    ? "bg-brand-accent text-brand-primary hover:brightness-110"
                    : "bg-brand-surface border border-brand-border hover:bg-brand-border/50"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-brand-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-brand-surface border-t border-brand-border py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-primary rounded-sm" />
            </div>
            Insight AI
          </Link>
          <p className="text-foreground/40 text-sm leading-relaxed">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-brand-accent">{t.common.product}</h4>
          <ul className="space-y-4">
            <li><Link href="/#features" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.features}</Link></li>
            <li><Link href="/dashboard" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.dashboard}</Link></li>
            <li><Link href="/pricing" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.pricing}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-brand-accent">{t.common.company}</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.about}</Link></li>
            <li><Link href="/blog" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.blog}</Link></li>
            <li><Link href="/careers" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.careers}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-brand-accent">{t.common.legal}</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.privacy}</Link></li>
            <li><Link href="/terms" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.terms}</Link></li>
            <li><Link href="/security" className="text-foreground/60 hover:text-foreground text-sm transition-colors">{t.common.security}</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-foreground/30 text-xs">
          © 2026 Insight AI Inc. {t.common.allRightsReserved}
        </p>
        <div className="flex items-center gap-6">
          <Link href="https://twitter.com/insight-ai" className="text-foreground/30 hover:text-foreground transition-colors text-xs">{t.common.socialTwitter}</Link>
          <Link href="https://linkedin.com/company/insight-ai" className="text-foreground/30 hover:text-foreground transition-colors text-xs">{t.common.socialLinkedIn}</Link>
          <Link href="https://github.com/insight-ai" className="text-foreground/30 hover:text-foreground transition-colors text-xs">{t.common.socialGitHub}</Link>
        </div>
      </div>
    </footer>
  );
}

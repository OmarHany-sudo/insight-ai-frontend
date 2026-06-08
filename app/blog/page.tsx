"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";
import { useTranslation } from "@/hooks/useTranslation";

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-brand-primary">
      <Navigation />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient">
              {t.marketing.blog.title}
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              {t.marketing.blog.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((post) => (
              <article key={post} className="group cursor-pointer">
                <div className="aspect-video rounded-2xl bg-brand-surface border border-brand-border overflow-hidden mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-widest mb-3">
                  <span>{t.marketing.blog.category}</span>
                  <span className="w-1 h-1 rounded-full bg-brand-border" />
                  <span>{t.marketing.blog.readTime}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-brand-accent transition-colors line-clamp-2">
                  {t.marketing.blog.postTitle}
                </h3>
                <p className="text-foreground/50 text-sm line-clamp-3">
                  {t.marketing.blog.postExcerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

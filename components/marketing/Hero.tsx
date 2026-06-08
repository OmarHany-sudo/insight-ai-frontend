"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useTranslation } from "@/hooks/useTranslation";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        delay: 0.2,
      })
      .from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
      }, "-=0.8")
      .from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      }, "-=0.6");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border bg-brand-surface/50 text-brand-accent text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
          </span>
          {t.hero.badge}
        </div>

        <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] text-gradient">
          {t.hero.title}
        </h1>

        <p ref={subtitleRef} className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-12">
          {t.hero.subtitle}
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-premium">
            {t.hero.ctaPrimary}
          </Link>
          <Link href="/dashboard" className="px-8 py-4 bg-brand-surface border border-brand-border text-foreground font-bold rounded-lg hover:bg-brand-border/50 transition-colors">
            {t.hero.ctaSecondary}
          </Link>
        </div>
      </div>

      {/* Hero Visual Mockup */}
      <div className="relative mt-24 w-full max-w-6xl mx-auto aspect-video rounded-2xl border border-brand-border bg-brand-surface/30 overflow-hidden shadow-2xl glass group">
         {/* Decorative Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f5d410_1px,transparent_1px),linear-gradient(to_bottom,#00f5d410_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
         
         {/* Mock Dashboard Layout */}
         <div className="relative p-8 h-full flex gap-8">
            {/* Mock Sidebar */}
            <div className="w-48 h-full space-y-4 hidden md:block">
               <div className="w-full h-8 bg-brand-accent/20 rounded-lg animate-pulse" />
               <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-full h-6 bg-brand-border/30 rounded-md" style={{ opacity: 1 - i * 0.1 }} />
                  ))}
               </div>
            </div>
            
            {/* Mock Content */}
            <div className="flex-1 space-y-8">
               <div className="flex justify-between">
                  <div className="w-48 h-10 bg-brand-border/40 rounded-xl" />
                  <div className="w-24 h-10 bg-brand-accent/20 rounded-xl" />
               </div>
               
               <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3">
                       <div className="w-1/2 h-2 bg-brand-border/40 rounded" />
                       <div className="w-3/4 h-6 bg-brand-accent/10 rounded" />
                    </div>
                  ))}
               </div>

               <div className="flex-1 bg-brand-surface border border-brand-border rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent animate-scan" />
                  <div className="space-y-4">
                     <div className="w-1/4 h-4 bg-brand-border/40 rounded" />
                     <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-full h-4 bg-brand-border/20 rounded" />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Center Label (Visible on hover) */}
         <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="px-6 py-3 rounded-full bg-brand-accent text-brand-primary font-bold shadow-glow">
               {t.hero.previewLabel}
            </span>
         </div>
      </div>
    </section>
  );
}

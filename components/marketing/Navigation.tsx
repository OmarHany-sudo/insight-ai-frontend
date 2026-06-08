"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? "bg-brand-primary/95 backdrop-blur-md py-4 border-b border-brand-border" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground flex items-center gap-2 relative z-50">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-primary rounded-sm" />
          </div>
          Insight AI
        </Link>

        {/* Desktop Nav */}
        <div className={`hidden md:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/#features" className="text-sm font-medium text-foreground/60 hover:text-brand-accent transition-colors">{t.common.features}</Link>
          <Link href="/pricing" className="text-sm font-medium text-foreground/60 hover:text-brand-accent transition-colors">{t.common.pricing}</Link>
          <Link href="/dashboard" className="text-sm font-medium text-foreground/60 hover:text-brand-accent transition-colors">{t.common.dashboard}</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
             <LanguageSwitcher />
          </div>
          <Link href="/login" className="hidden md:block text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">{t.common.login}</Link>
          <Link href="/register" className="hidden md:flex btn-premium !px-5 !py-2 !text-sm items-center justify-center">
            {t.common.getStarted}
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground/60 hover:text-foreground transition-colors relative z-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-brand-primary z-40 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col items-center justify-center h-full gap-8 p-6 text-center">
            <Link 
              href="/#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold hover:text-brand-accent transition-colors"
            >
              {t.common.features}
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold hover:text-brand-accent transition-colors"
            >
              {t.common.pricing}
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-bold hover:text-brand-accent transition-colors"
            >
              {t.common.dashboard}
            </Link>
            
            <div className="w-full h-[1px] bg-brand-border my-4" />
            
            <LanguageSwitcher />
            
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-medium text-foreground/60"
            >
              {t.common.login}
            </Link>
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-premium py-4 flex items-center justify-center text-lg"
            >
              {t.common.getStarted}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

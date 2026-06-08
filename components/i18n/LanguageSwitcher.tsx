"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Globe } from "lucide-react";
import { useState } from "react";

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface/50 hover:bg-brand-border/80 transition-all group"
      >
        <Globe className="w-4 h-4 text-foreground/40 group-hover:text-brand-accent transition-colors" />
        <span className="text-xs font-bold uppercase tracking-wider">
          {locale === 'en' ? 'EN' : 'AR'}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full mt-2 w-32 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isRTL ? 'left-0' : 'right-0'}`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code as 'en' | 'ar');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-brand-accent/10 transition-colors ${locale === lang.code ? 'text-brand-accent bg-brand-accent/5' : 'text-foreground/60'}`}
              >
                <span>{lang.label}</span>
                <span>{lang.flag}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

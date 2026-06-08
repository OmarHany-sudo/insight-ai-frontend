"use client";

import { useI18nStore } from '@/store/i18nStore';
import { translations } from '@/lib/translations';

export function useTranslation() {
  const { locale, setLocale, isRTL } = useI18nStore();
  
  const t = translations[locale];

  return { t, locale, setLocale, isRTL };
}

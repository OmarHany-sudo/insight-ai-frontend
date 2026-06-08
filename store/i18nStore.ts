import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ar';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      isRTL: false,
      setLocale: (locale) => set({ 
        locale, 
        isRTL: locale === 'ar' 
      }),
    }),
    {
      name: 'i18n-storage',
    }
  )
);

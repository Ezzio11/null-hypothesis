'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language metadata
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' as const },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' as const },
} as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'ar'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  // Fetch translations when language changes
  useEffect(() => {
    async function loadTranslations() {
      setIsLoading(true);

      try {
        // Fetch ALL rows (we'll extract the right column based on language)
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value_en, value_ar');

        if (error) {
          console.error('Error fetching translations:', error);
          setTranslations({});
        } else if (data) {
          // Convert to key-value object, selecting the right language column
          const languageColumn = `value_${language}` as 'value_en' | 'value_ar';

          const translationsMap = data.reduce((acc, item) => {
            // Use the language-specific column, fallback to English if null
            acc[item.key] = item[languageColumn] || item.value_en;
            return acc;
          }, {} as Record<string, string>);

          setTranslations(translationsMap);
        }
      } catch (err) {
        console.error('Failed to load translations:', err);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }

      // Update document direction
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const specialRoutes = ['/showcase', '/gift', '/polymath'];
        const isSpecialRoute = specialRoutes.some(route => pathname.startsWith(route));

        if (!isSpecialRoute) {
          document.documentElement.dir = LANGUAGES[language].dir;
          document.documentElement.lang = language;
        } else {
          document.documentElement.dir = 'ltr';
        }
      }
    }

    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        t,
        isLoading,
        dir: LANGUAGES[language].dir
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
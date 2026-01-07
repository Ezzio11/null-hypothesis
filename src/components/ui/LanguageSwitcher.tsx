// src/components/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-2 bg-card border border-ink/10 rounded-xl hover:border-ink/30 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <Languages className="w-4 h-4 text-ink/60 group-hover:text-accent transition-colors" />
        <span className="font-mono text-xs uppercase tracking-wider text-ink">
          {(LANGUAGES[language as keyof typeof LANGUAGES] || LANGUAGES.en).code.toUpperCase()}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-ink/40 text-xs"
        >
          ▼
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-paper border border-ink/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-ink/5 bg-ink/5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                  Select Language
                </span>
              </div>

              {/* Options */}
              <div className="py-2">
                {(Object.entries(LANGUAGES) as [keyof typeof LANGUAGES, typeof LANGUAGES[keyof typeof LANGUAGES]][]).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between
                      transition-all duration-200
                      ${language === code
                        ? 'bg-accent/10 text-accent'
                        : 'text-ink hover:bg-ink/5'
                      }
                    `}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-serif text-sm font-medium">
                        {lang.nativeName}
                      </span>
                      <span className="font-mono text-[10px] text-ink/50 uppercase tracking-wider">
                        {lang.name}
                      </span>
                    </div>

                    {language === code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-accent" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
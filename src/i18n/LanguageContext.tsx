import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type TranslationDict } from './translations';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (l: Language) => void;
  setLanguage: (l: Language) => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  language: 'id',
  setLang: () => {},
  setLanguage: () => {},
  t: translations.id,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aemeth_lang') as Language;
      if (saved === 'id' || saved === 'en') return saved;
      
      // Check browser language
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('en')) return 'en';
      return 'id'; // default fallback is Indonesian
    } catch {
      return 'id';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('aemeth_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, setLanguage: setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

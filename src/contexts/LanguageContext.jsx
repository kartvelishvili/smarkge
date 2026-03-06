import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { translations as staticTranslations } from '@/lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [dbTranslations, setDbTranslations] = useState({});

  const fetchTranslations = async () => {
    try {
      const { data } = await supabase.from('app_translations').select('*');
      if (data) {
        const transMap = {};
        data.forEach(item => {
          transMap[item.key] = {
            en: item.en,
            ka: item.ka
          };
        });
        setDbTranslations(transMap);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  const fetchDefaultLanguage = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'default_language')
        .maybeSingle();
      
      return data?.value || 'en';
    } catch (error) {
      console.error('Error fetching default language:', error);
      return 'en';
    }
  };

  // Helper to get nested translation
  const t = (path) => {
    // 1. Check DB translations first
    // The key in the DB might directly match 'path' or be a flattened version (e.g., 'about_us.title' -> 'about_us_title')
    // We'll prioritize exact match, then try a flattened version if an exact match isn't found.
    
    if (dbTranslations[path]) {
      return dbTranslations[path][language] || path;
    }
    
    // Fallback for flattened keys (if used in the DB directly, though in this case we're using exact paths)
    const dbKeyFlattened = path.replace(/\./g, '_'); 
    if (dbTranslations[dbKeyFlattened]) {
        return dbTranslations[dbKeyFlattened][language] || path;
    }

    // 2. Fallback to static translations
    const keys = path.split('.');
    let current = staticTranslations[language];
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) return path;
      current = current[key];
    }
    return current;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const init = async () => {
      await fetchTranslations();
      
      // Check localStorage first
      const savedLang = localStorage.getItem('language');
      
      if (savedLang) {
        changeLanguage(savedLang);
      } else {
        // If no local storage, check admin default setting
        const defaultLang = await fetchDefaultLanguage();
        changeLanguage(defaultLang);
      }
      
      setIsLoading(false);
    };

    init();

    // Subscribe to translation updates
    const channel = supabase
      .channel('app_translations_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_translations' }, () => {
        fetchTranslations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
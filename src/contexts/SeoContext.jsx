import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const SeoContext = createContext();

export const SeoProvider = ({ children }) => {
  const [seoSettings, setSeoSettings] = useState({
    global_seo: {},
    per_page_seo: [],
    homepage_seo_content: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchSeoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSeoSettings({
            ...data,
            global_seo: data.global_seo || {},
            per_page_seo: Array.isArray(data.per_page_seo) ? data.per_page_seo : [],
            homepage_seo_content: data.homepage_seo_content || {}
        });
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('seo_settings_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_settings' }, () => {
        fetchSeoSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeoForPage = (slug) => {
    // Normalize slug (remove trailing slash if not root)
    const normalizedSlug = slug === '/' ? '/' : slug.replace(/\/$/, '');
    return seoSettings.per_page_seo.find(p => p.slug === normalizedSlug) || null;
  };

  return (
    <SeoContext.Provider value={{ seoSettings, getSeoForPage, loading }}>
      {children}
    </SeoContext.Provider>
  );
};

export const useSeo = () => useContext(SeoContext);
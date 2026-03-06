import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook to fetch page content from Supabase `page_content` table.
 * Merges DB content over provided defaults (deep merge).
 * 
 * @param {string} pageKey - Unique key for this page (e.g. 'services', 'industry_healthcare')
 * @param {object} defaults - Default content object (current hardcoded values)
 * @returns {{ content: object, loading: boolean, error: string|null }}
 */
export function usePageContent(pageKey, defaults = {}) {
  const [dbContent, setDbContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('page_content')
        .select('content')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (fetchError) {
        // Table might not exist yet — fail silently with defaults
        console.warn(`[usePageContent] Could not fetch "${pageKey}":`, fetchError.message);
        setError(fetchError.message);
        return;
      }

      if (data?.content) {
        setDbContent(data.content);
      }
    } catch (err) {
      console.warn(`[usePageContent] Error for "${pageKey}":`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchContent();

    const channel = supabase
      .channel(`page_content_${pageKey}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'page_content',
        filter: `page_key=eq.${pageKey}`
      }, (payload) => {
        if (payload.new?.content) {
          setDbContent(payload.new.content);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageKey, fetchContent]);

  // Deep merge: DB content overrides defaults
  const content = deepMerge(defaults, dbContent || {});

  return { content, loading, error };
}

/**
 * Deep merge two objects. Source values override target values.
 * Arrays are replaced, not merged.
 */
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;
  if (Array.isArray(source)) return source;

  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}

export default usePageContent;

import { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const HeadManager = () => {
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*');
        if (!data) return;

        const settings = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        // 1. Favicon Injection
        if (settings.favicon_url) {
          // Remove existing favicons to ensure clean state
          const existingFavicons = document.querySelectorAll("link[rel*='icon']");
          existingFavicons.forEach(el => el.remove());

          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/x-icon';
          link.href = settings.favicon_url;
          document.head.appendChild(link);
        }

        // 2. Google Analytics ID Injection (Standard GA4)
        if (settings.google_analytics_id && !document.getElementById('ga-script-base')) {
            const gaId = settings.google_analytics_id;
            
            const scriptBase = document.createElement('script');
            scriptBase.id = 'ga-script-base';
            scriptBase.async = true;
            scriptBase.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(scriptBase);

            const scriptInline = document.createElement('script');
            scriptInline.id = 'ga-script-inline';
            scriptInline.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `;
            document.head.appendChild(scriptInline);
        }

        // 3. Custom GTM / Script Injection
        if (settings.google_tag_code && !document.getElementById('gtm-custom-script')) {
           const code = settings.google_tag_code;
           
           // Create a temporary container to parse the HTML string
           const div = document.createElement('div');
           div.innerHTML = code;
           
           const scriptNodes = div.querySelectorAll('script');
           
           if (scriptNodes.length > 0) {
             // If input contains script tags, inject them properly
             scriptNodes.forEach((node, index) => {
               const newScript = document.createElement('script');
               newScript.id = `gtm-custom-script-${index}`;
               if (node.src) {
                 newScript.src = node.src;
                 newScript.async = true;
               } else {
                 newScript.innerHTML = node.innerHTML;
               }
               // Copy attributes
               Array.from(node.attributes).forEach(attr => {
                 if (attr.name !== 'src' && attr.name !== 'innerHTML') {
                   newScript.setAttribute(attr.name, attr.value);
                 }
               });
               document.head.appendChild(newScript);
             });
           } else if (code.trim().length > 0) {
             // If raw JS code is provided without script tags
             const script = document.createElement('script');
             script.id = 'gtm-custom-script-raw';
             script.innerHTML = code;
             document.head.appendChild(script);
           }
           
           // Handle non-script tags (like <noscript> for GTM body)
           // Note: This only injects into head. Body injection is harder with this component structure.
        }
      } catch (err) {
        console.error("Failed to load head settings:", err);
      }
    };

    loadSettings();
  }, []);

  return null;
};

export default HeadManager;
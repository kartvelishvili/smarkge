import React from 'react';
import { Helmet } from 'react-helmet';
import { useSeo } from '@/contexts/SeoContext';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  slug, 
  fallbackTitle, 
  fallbackDescription, 
  fallbackImage,
  overrideTitle, // For dynamic pages like blog post detail
  overrideDescription,
  overrideImage
}) => {
  const { seoSettings, getSeoForPage } = useSeo();
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;
  
  // 1. Get Settings for this specific page slug
  const pageSeo = getSeoForPage(slug || location.pathname);
  
  // 2. Global Defaults
  const globalSeo = seoSettings.global_seo || {};
  
  // 3. Determine Final Values (Priority: Override > Page Specific > Global > Fallback > Default Hardcoded)
  
  // Title Logic
  const title = overrideTitle || 
                pageSeo?.meta_title || 
                globalSeo?.default_meta_title || 
                fallbackTitle || 
                'Digital Agency';

  // Description Logic
  const description = overrideDescription || 
                      pageSeo?.meta_description || 
                      globalSeo?.default_meta_description || 
                      fallbackDescription || 
                      'Professional Digital Services';

  // Image Logic
  const image = overrideImage || 
                pageSeo?.og_image || 
                globalSeo?.default_og_image || 
                fallbackImage;

  // OG Title (optional in page settings, fallback to main title)
  const ogTitle = pageSeo?.og_title || title;
  
  // OG Description (optional in page settings, fallback to main description)
  const ogDescription = pageSeo?.og_description || description;

  return (
    <Helmet>
      {/* Standard Meta */}
      <html lang="ka" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card (uses OG data mostly, but good to have) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
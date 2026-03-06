import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Brands from '@/components/Brands';
import CoreServices from '@/components/CoreServices';
import SocialMediaServices from '@/components/SocialMediaServices';
import HowWeWork from '@/components/HowWeWork';
import Portfolio from '@/components/Portfolio';
import Pricing from '@/components/Pricing';
import Industries from '@/components/Industries';
import Blog from '@/components/Blog';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import SeoContent from '@/components/SeoContent';
import AnimatedSection from '@/components/AnimatedSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeo } from '@/contexts/SeoContext';
import { supabase } from '@/lib/customSupabaseClient';

// Component Mapping
const SECTION_COMPONENTS = {
  hero: Hero,
  brands: Brands,
  core_services: CoreServices,
  social_media_services: SocialMediaServices,
  how_we_work: HowWeWork,
  portfolio: Portfolio,
  pricing: Pricing,
  industries: Industries,
  blog: Blog,
  faq: FAQ,
  testimonials: Testimonials,
  contact_form: ContactForm
};

const HomePage = () => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { getSeoForPage } = useSeo();
  
  // SEO H1 optimized for keywords
  const seoH1 = "ვებ-გვერდების დამზადება და სოციალური მედია კამპანიები საქართველოში";
  
  // Default sections to ensure page renders even if fetch fails
  const [sections, setSections] = useState([
    { section_key: 'hero', visible: true, order_index: 0 },
    { section_key: 'brands', visible: true, order_index: 1 },
    { section_key: 'core_services', visible: true, order_index: 2 },
    { section_key: 'social_media_services', visible: true, order_index: 3 },
    { section_key: 'how_we_work', visible: true, order_index: 4 },
    { section_key: 'portfolio', visible: true, order_index: 5 },
    { section_key: 'pricing', visible: true, order_index: 6 },
    { section_key: 'industries', visible: true, order_index: 7 },
    { section_key: 'blog', visible: true, order_index: 8 },
    { section_key: 'faq', visible: true, order_index: 9 },
    { section_key: 'testimonials', visible: true, order_index: 10 },
    { section_key: 'contact_form', visible: true, order_index: 11 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Sections
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) {
            console.warn('Using default homepage sections due to fetch error:', error.message);
            return;
        }

        if (data && data.length > 0) {
          setSections(data);
        }
      } catch (error) {
        console.warn('Error fetching sections, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();

    // Subscribe to section updates
    const channel = supabase
      .channel('homepage_sections_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'homepage_sections' }, 
        () => {
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeSections = useMemo(() => {
    return sections.filter(s => s.visible).sort((a, b) => a.order_index - b.order_index);
  }, [sections]);

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${darkMode ? 'dark bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug="/" 
        fallbackTitle="ვებ-გვერდების დამზადება & სოციალური მედია კამპანიები | Smarketer" 
        fallbackDescription="პროფესიონალური ვებ-გვერდების დამზადება, SEO ოპტიმიზაცია და სოციალური მედია კამპანიები საქართველოში. შედეგზე ორიენტირებული ციფრული სერვისები." 
      />
      
      <Header />
      
      <main>
        {activeSections.map((section, index) => {
          const Component = SECTION_COMPONENTS[section.section_key];
          if (!Component) return null;
          // Pass seoH1 only to Hero component
          const props = section.section_key === 'hero' ? { darkMode, seoH1 } : { darkMode };
          
          return (
            <AnimatedSection key={section.section_key} delay={0.1}>
              <Component {...props} />
            </AnimatedSection>
          );
        })}
        
        {/* Render SEO Content Block at the bottom of main content */}
        <AnimatedSection delay={0.2}>
          <SeoContent darkMode={darkMode} />
        </AnimatedSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';

// Dummy logos for demonstration if none are provided
const defaultBrands = [
  { id: 1, name: 'Brand A', logo_url: 'https://placehold.co/200x80/png?text=Brand+A', link: '#' },
  { id: 2, name: 'Brand B', logo_url: 'https://placehold.co/200x80/png?text=Brand+B', link: '#' },
  { id: 3, name: 'Brand C', logo_url: 'https://placehold.co/200x80/png?text=Brand+C', link: '#' },
  { id: 4, name: 'Brand D', logo_url: 'https://placehold.co/200x80/png?text=Brand+D', link: '#' },
  { id: 5, name: 'Brand E', logo_url: 'https://placehold.co/200x80/png?text=Brand+E', link: '#' },
];

const Brands = ({ darkMode }) => {
  const { language } = useLanguage();
  const [partnersConfig, setPartnersConfig] = useState({
    show_title: true,
    title_en: 'Brands we\'ve worked with',
    title_ka: 'ბრენდები, რომლებთანაც ვთანამშრომლობთ',
    display_style: 'logos_scroll',
    background_style: 'grid_pattern',
    partners: defaultBrands,
    section_height: 300,
    animation_speed: 5
  });

  useEffect(() => {
    fetchPartnersSettings();

    const channel = supabase
      .channel('partners_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'partners_settings' }, 
        (payload) => {
          if (payload.new) {
            setPartnersConfig(prev => ({ ...prev, ...payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPartnersSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('partners_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setPartnersConfig({
          ...data,
          title_en: data.title_en || 'Brands we\'ve worked with',
          title_ka: data.title_ka || 'ბრენდები, რომლებთანაც ვთანამშრომლობთ',
          section_height: data.section_height || 300,
          animation_speed: data.animation_speed || 5,
          partners: (data.partners && data.partners.length > 0) ? data.partners : defaultBrands
        });
      }
    } catch (error) {
      console.error('Error fetching partners settings:', error);
    }
  };

  const isStatic = partnersConfig.display_style === 'static_banners';
  const isMovingColors = partnersConfig.display_style === 'moving_colors';
  const isLogosScroll = partnersConfig.display_style === 'logos_scroll';

  // For infinite scroll, we duplicate the list enough times to fill width
  const infinitePartners = [
    ...(partnersConfig.partners || []), 
    ...(partnersConfig.partners || []),
    ...(partnersConfig.partners || []),
    ...(partnersConfig.partners || [])
  ];

  // Background Styles Logic
  const getBackgroundClass = () => {
    switch(partnersConfig.background_style) {
      case 'gray_solid':
        return darkMode ? 'bg-[#0F1629]' : 'bg-gray-100';
      case 'grid_pattern':
        return darkMode 
          ? 'bg-[#0A0F1C] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]' 
          : 'bg-[#F4F7FF] bg-[radial-gradient(#00000033_1px,transparent_1px)] [background-size:20px_20px]';
      case 'gradient_mesh':
        return darkMode 
          ? 'bg-gradient-to-br from-[#0A0F1C] via-[#1a1f35] to-[#0A0F1C]' 
          : 'bg-gradient-to-br from-[#F4F7FF] via-[#E0E7FF] to-[#F4F7FF]';
      default: // 'default'
        return darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]';
    }
  };

  // Calculate Duration based on Speed (1-10)
  // Higher speed value (10) means faster movement -> lower duration
  // Base duration 120s / speed. At speed 5 -> 24s. At speed 10 -> 12s.
  const speed = partnersConfig.animation_speed || 5;
  const scrollDuration = Math.max(5, 120 / speed);

  const displayTitle = language === 'ka' ? partnersConfig.title_ka : partnersConfig.title_en;

  return (
    <section 
      className={`border-b overflow-hidden relative flex flex-col justify-center ${darkMode ? 'border-white/5' : 'border-gray-200'} ${getBackgroundClass()}`}
      style={{ minHeight: `${partnersConfig.section_height}px` }}
    >
      <div className="container mx-auto px-4 lg:px-8 relative z-10 w-full">
        
        {/* Title Section (Conditionally Rendered) */}
        {partnersConfig.show_title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className={`text-center text-sm font-medium mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {displayTitle}
            </p>
          </motion.div>
        )}

        {/* Style 1: Static Partners with Banners */}
        {isStatic && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 lg:gap-16"
          >
            {(partnersConfig.partners || []).map((brand, index) => (
              <motion.div
                key={brand.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className={`px-8 py-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white'} shadow-lg min-w-[120px] text-center`}
              >
                <span className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {brand.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Style 2: Moving Version with Colors (Text/Simple) */}
      {isMovingColors && (
        <div className="relative w-full overflow-hidden">
          <div className={`absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[${darkMode ? '#0A0F1C' : '#F4F7FF'}] to-transparent pointer-events-none`} />
          <div className={`absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[${darkMode ? '#0A0F1C' : '#F4F7FF'}] to-transparent pointer-events-none`} />
          
          <motion.div
            key={partnersConfig.animation_speed}
            className="flex items-center gap-16 min-w-max"
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: scrollDuration,
                ease: "linear",
              },
            }}
          >
            {infinitePartners.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`}
                className="group relative cursor-pointer px-4 py-2"
              >
                <span 
                  className={`text-2xl font-bold transition-all duration-300 filter grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 group-hover:scale-110 block`}
                  style={{ 
                    color: brand.color || (darkMode ? '#ffffff' : '#000000') 
                  }}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Style 3: Logos Scroll (Grayscale to Color, No Scale) */}
      {isLogosScroll && (
        <div className="relative w-full overflow-hidden">
           {/* Fade edges to match background */}
           <div className="absolute inset-y-0 left-0 w-20 md:w-32 z-20 pointer-events-none" 
                style={{ background: `linear-gradient(to right, ${darkMode ? '#0A0F1C' : '#F4F7FF'} 0%, transparent 100%)` }} 
           />
           <div className="absolute inset-y-0 right-0 w-20 md:w-32 z-20 pointer-events-none"
                style={{ background: `linear-gradient(to left, ${darkMode ? '#0A0F1C' : '#F4F7FF'} 0%, transparent 100%)` }}
           />
          
          <motion.div
            key={partnersConfig.animation_speed}
            className="flex items-center gap-12 md:gap-24 min-w-max py-4"
            animate={{ x: [0, -2000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: scrollDuration * 2,
                ease: "linear",
              },
            }}
          >
            {infinitePartners.map((brand, index) => {
               const Wrapper = brand.link ? 'a' : 'div';
               const wrapperProps = brand.link ? { href: brand.link, target: '_blank', rel: 'noopener noreferrer' } : {};

               return (
                <Wrapper 
                  key={`${brand.id}-${index}`}
                  {...wrapperProps}
                  className={`relative flex items-center justify-center h-20 w-auto min-w-[120px] ${brand.link ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {(brand.logo_url || brand.logo) ? (
                     <img 
                       src={brand.logo_url || brand.logo} 
                       alt={brand.name} 
                       loading="lazy"
                       className="h-12 md:h-16 w-auto object-contain transition-all duration-500 filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                       style={{ maxWidth: '200px' }}
                     />
                  ) : (
                     <span className={`text-xl font-bold transition-all duration-500 filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 ${darkMode ? 'text-white' : 'text-black'}`}>
                       {brand.name}
                     </span>
                  )}
                </Wrapper>
               );
            })}
          </motion.div>
        </div>
      )}

    </section>
  );
};

export default Brands;
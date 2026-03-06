import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, ArrowRight, Globe, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveIcon } from '@/lib/iconMap';

// --- Chaos Comet Component ---
const ChaosComet = ({ bounds, styleType, color }) => {
  const motionParams = useMemo(() => {
    const randomDuration = 15 + Math.random() * 15;
    const pathPoints = Array.from({ length: 6 }).map(() => ({
      x: (Math.random() - 0.5) * bounds.width * 1.5,
      y: (Math.random() - 0.5) * bounds.height * 1.5,
      scale: 0.5 + Math.random(),
    }));

    return { duration: randomDuration, path: pathPoints };
  }, [bounds]);

  // Determine comet appearance based on styleType
  const isShadowComet = styleType === 'shadow_comet' || !styleType; 
  const isBlueComet = styleType === 'blue_comet'; 
  const isOnlyComet = styleType === 'only_comet'; 
  const isChaotic = styleType === 'chaotic'; // New crazy style

  const cometColor = color || '#ffffff';

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: motionParams.path.map(p => p.x),
        y: motionParams.path.map(p => p.y),
        opacity: [0, 1, 0.5, 1, 0],
        scale: motionParams.path.map(p => p.scale),
      }}
      transition={{
        duration: motionParams.duration,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeatType: "mirror"
      }}
      className="absolute top-1/2 left-1/2 pointer-events-none z-0"
    >
       {/* Shadow Comet */}
       {isShadowComet && (
        <div className="relative">
          <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-full w-24 h-1 bg-gradient-to-r from-white/0 via-white/40 to-white/0 blur-sm origin-right" />
        </div>
      )}

      {/* Blue Comet */}
      {isBlueComet && (
        <div className="relative">
          <div className="w-4 h-4 bg-[#5367e5] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-full w-20 h-1.5 bg-gradient-to-r from-[#5367e5]/0 via-[#5367e5] to-[#5367e5]/0 origin-right opacity-80" />
        </div>
      )}

      {/* Only Comet */}
      {isOnlyComet && (
        <div className="relative">
          <div 
            className="w-4 h-4 rounded-full bg-white shadow-[0_0_20px_2px_rgba(255,255,255,0.5)]" 
          />
        </div>
      )}

       {/* Chaotic Style - Multi-color crazy */}
       {isChaotic && (
        <div className="relative">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-full w-32 h-2 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-pink-500/0 blur-md origin-right" />
        </div>
      )}
    </motion.div>
  );
};

// --- Orbiting Icons Component ---
const OrbitingIcons = ({ icons, chaotic }) => {
  if (!icons || icons.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      {/* Central glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 opacity-20 animate-spin-slow" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 opacity-30 animate-spin-reverse-slow" />
      
      {icons.map((iconName, index) => {
        const Icon = resolveIcon(iconName) || Circle;
        const angle = (index / icons.length) * 360;
        const radius = 300 + (index % 2) * 100; // Alternating radius 300 and 400
        const duration = 20 + (index % 3) * 5; // Varying speeds
        
        // Chaotic additional movement
        const chaoticVariants = {
            animate: {
                x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                rotate: 360
            }
        };

        return (
          <motion.div
            key={index}
            className="absolute"
            animate={chaotic ? chaoticVariants.animate : { rotate: 360 }}
            transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
            style={{ width: radius * 2, height: radius * 2 }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `rotate(-${angle}deg)` }} 
            >
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                <Icon className="w-6 h-6 text-[#5468E7] opacity-80" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const WebsiteServices = ({ darkMode }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchWebContent();

    const channel = supabase
      .channel('web_settings_update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'web_settings' }, () => {
        fetchWebContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWebContent = async () => {
    try {
      const { data, error } = await supabase.from('web_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching web content:', error);
    }
  };

  // Helper to map font value to class
  const getFontClass = (obj, field) => {
    if (!obj) return 'font-sans';
    const fontKey = language === 'ka' ? `${field}_ka_font` : `${field}_en_font`;
    return obj[fontKey] || 'font-sans';
  };

  const getLocalizedText = (obj, field) => {
    if (!obj) return '';
    return language === 'ka' ? obj[`${field}_ka`] : obj[`${field}_en`];
  };

  const displayTitle = getLocalizedText(content, 'title') || (language === 'ka' ? 'ვებ-გვერდების დამზადება' : 'Website Design & Development');
  const displayDescription = getLocalizedText(content, 'description') || (language === 'ka' ? 'ჩვენ ვქმნით თანამედროვე, სწრაფ და ეფექტურ ვებ-გვერდებს თქვენი ბიზნესისთვის.' : 'We create modern, fast, and effective websites for your business.');
  
  // Button Content
  const buttonText = getLocalizedText(content, 'services_button_text');
  const buttonLink = content?.services_button_link || '#contact';

  // Default Fallbacks
  const defaultCards = [
    { id: '1', icon: "Layout", title_en: "Landing Page", title_ka: "ერთგვერდიანი საიტი" },
    { id: '2', icon: "Building2", title_en: "Corporate Website", title_ka: "კორპორატიული საიტი" },
    { id: '3', icon: "ShoppingBag", title_en: "E-commerce", title_ka: "ონლაინ მაღაზია" },
    { id: '4', icon: "Code2", title_en: "Web App", title_ka: "ვებ აპლიკაცია" }
  ];

  const cards = (content?.cards && content.cards.length > 0) ? content.cards : defaultCards;

  // Collect icons for orbiting animation
  const activeIcons = cards.map(c => c.icon).filter(Boolean);

  // Header Background Styles
  const getHeaderBgClasses = () => {
     const style = content?.header_bg_style || 'gradient_blue';
     if (darkMode) {
        switch(style) {
           case 'gradient_dark': return 'bg-gradient-to-b from-[#0D1126] to-[#0A0F1C]';
           case 'solid_blue': return 'bg-[#1a237e]';
           case 'pattern_grid': return 'bg-[#0D1126] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]';
           case 'pattern_dots': return 'bg-[#0D1126] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[size:20px_20px]';
           case 'gradient_blue':
           default: return 'bg-[#0D1126]'; // Default base, decoration handles gradient
        }
     } else {
        switch(style) {
           case 'gradient_dark': return 'bg-gradient-to-b from-gray-900 to-gray-800 text-white';
           case 'solid_blue': return 'bg-[#5468E7] text-white';
           case 'pattern_grid': return 'bg-white bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]';
           case 'pattern_dots': return 'bg-white bg-[radial-gradient(#00000033_1px,transparent_1px)] bg-[size:20px_20px]';
           case 'gradient_blue':
           default: return 'bg-white border-b border-gray-100';
        }
     }
  };

  // Header Height Classes
  const getHeaderHeightClass = () => {
     const size = content?.header_height || 'medium';
     switch(size) {
        case 'small': return 'py-16';
        case 'large': return 'py-32';
        case 'medium': 
        default: return 'py-24';
     }
  };

  // Button Style
  const getButtonStyle = () => {
    switch(content?.services_button_style) {
        case 'solid': return 'bg-[#5468E7] hover:bg-[#4555d1] text-white shadow-lg';
        case 'outline': return 'bg-transparent border-2 border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7]/10';
        case 'ghost': return 'bg-transparent text-[#5468E7] hover:bg-[#5468E7]/10 hover:text-[#5468E7]';
        case 'gradient':
        default: return 'bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] hover:opacity-90 text-white shadow-lg';
    }
  };

  return (
    // 1. Distinct Header Section - now the root element
    <div className={`relative overflow-hidden transition-all duration-300 ${getHeaderBgClasses()} ${getHeaderHeightClass()}`}>
        
        {/* Background Decoration (Conditional) */}
        {(content?.header_bg_style === 'gradient_blue' || !content?.header_bg_style) && (
            <>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5468E7]/5 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5468E7]/5 rounded-full blur-3xl pointer-events-none" />
            </>
        )}

        {/* --- ORBITING ICONS ANIMATION --- */}
        {content?.orbiting_icons_enabled && (
            <OrbitingIcons icons={activeIcons} chaotic={content?.orbiting_icons_chaotic} />
        )}

        {/* --- CHAOTIC COMETS ANIMATION --- */}
        {content?.comets_enabled && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                <ChaosComet bounds={{ width: 1200, height: 600 }} styleType={content?.comet_style} />
                <ChaosComet bounds={{ width: 1000, height: 800 }} styleType={content?.comet_style} />
                <ChaosComet bounds={{ width: 1400, height: 500 }} styleType={content?.comet_style} />
            </div>
        )}
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5468E7]/10 text-[#5468E7] mb-8 font-semibold tracking-wide text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'ka' ? 'ჩვენი სერვისები' : 'Web Services'}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl lg:text-6xl font-extrabold mb-6 leading-tight max-w-4xl mx-auto ${darkMode || content?.header_bg_style === 'solid_blue' || content?.header_bg_style === 'gradient_dark' ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass(content, 'title')}`}
            >
              {displayTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-8 ${darkMode || content?.header_bg_style === 'solid_blue' || content?.header_bg_style === 'gradient_dark' ? 'text-gray-300' : 'text-gray-600'} ${getFontClass(content, 'description')}`}
            >
              {displayDescription}
            </motion.p>
            
            {/* Conditional Button Render */}
            {buttonText && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
               >
                   <Button asChild className={`${getButtonStyle()} px-8 py-6 rounded-full text-lg font-medium transition-transform hover:scale-105`}>
                      <a href={buttonLink}>
                         {buttonText}
                         <ArrowRight className="ml-2 w-5 h-5" />
                      </a>
                   </Button>
               </motion.div>
            )}
        </div>
    </div>
  );
};

export default WebsiteServices;
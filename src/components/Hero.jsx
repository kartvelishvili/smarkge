import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';

// --- Reusable Sub-Components ---
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

  const isShadowComet = styleType === 'shadow_comet';
  const isBlueComet = styleType === 'blue_comet';
  const isOnlyComet = styleType === 'only_comet';
  const isSimple = styleType === 'simple' || !styleType;
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
      {(isShadowComet || isSimple) && (
        <div className="relative">
          <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-full w-24 h-1 bg-gradient-to-r from-white/0 via-white/40 to-white/0 blur-sm origin-right" />
        </div>
      )}
      {isBlueComet && (
        <div className="relative">
          <div className="w-4 h-4 bg-[#5367e5] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-full w-20 h-1.5 bg-gradient-to-r from-[#5367e5]/0 via-[#5367e5] to-[#5367e5]/0 origin-right opacity-80" />
        </div>
      )}
      {isOnlyComet && (
        <div className="relative">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cometColor, boxShadow: `0 0 20px 2px ${cometColor}80` }} />
        </div>
      )}
    </motion.div>
  );
};

// Helper for rendering buttons to keep styles consistent
const HeroButtons = ({ buttons, language }) => {
  if (!buttons || buttons.length === 0) return null;

  const getLocalizedText = (obj, field) => {
    if (!obj) return '';
    return language === 'ka' ? (obj[`${field}_ka`] || obj[`${field}_en`]) : obj[`${field}_en`];
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8">
      {buttons.filter(b => b.visible).map((btn, idx) => (
        <Button
          key={idx}
          asChild
          variant={btn.variant === 'ghost' ? 'ghost' : (btn.variant === 'outline' ? 'outline' : 'default')}
          className={`
            ${btn.font || 'font-sans'}
            ${btn.variant === 'outline' 
              ? `px-8 py-6 rounded-lg font-medium text-lg transition-all hover:scale-105 border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7]/10`
              : btn.variant === 'ghost' 
                ? `px-6 py-6 rounded-lg font-medium text-lg transition-all hover:scale-105 text-[#5468E7] hover:bg-[#5468E7]/10`
                : "bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] hover:from-[#3A4BCF] hover:to-[#5468E7] text-white px-8 py-6 rounded-lg font-medium text-lg transition-all hover:scale-105 shadow-lg"
            }
          `}
        >
          <Link to={btn.link} draggable="false">
            {getLocalizedText(btn, 'text')}
          </Link>
        </Button>
      ))}
    </div>
  );
};

const Hero = ({ darkMode, seoH1 }) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoplayRef = useRef(null);
  
  const [heroData, setHeroData] = useState({
    slides: [],
    settings: {
      design_style: "split_layout",
      animation_style: "fade",
      autoplay_speed: 5000,
      background_effect: true,
      comet_style: "simple",
      title_size: "text-4xl lg:text-6xl",
      desc_size: "text-lg lg:text-xl"
    }
  });

  useEffect(() => {
    fetchHeroSettings();

    const channel = supabase
      .channel('hero_settings_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hero_settings' }, 
        (payload) => {
          if (payload.new) {
            setHeroData(payload.new);
            if (currentSlide >= (payload.new.slides?.length || 0)) {
              setCurrentSlide(0);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSlide]);

  useEffect(() => {
    if (!heroData.slides || heroData.slides.length <= 1) return;

    const speed = heroData.settings?.autoplay_speed || 5000;
    
    if (autoplayRef.current) clearInterval(autoplayRef.current);

    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, speed);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [currentSlide, heroData.slides, heroData.settings?.autoplay_speed]);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setHeroData(data);
      }
    } catch (error) {
      console.warn('Using default hero settings due to fetch error:', error.message);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroData.slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroData.slides.length) % heroData.slides.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        const speed = heroData.settings?.autoplay_speed || 5000;
        autoplayRef.current = setInterval(nextSlide, speed);
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -50) nextSlide();
    else if (info.offset.x > 50) prevSlide();
  };

  const getLocalizedText = (obj, field) => {
    if (!obj) return '';
    return language === 'ka' ? (obj[`${field}_ka`] || obj[`${field}_en`]) : obj[`${field}_en`];
  };

  const getFontClass = (fontName) => {
     if (!fontName) return 'font-sans';
     return fontName;
  };

  // SEO Alt Text helper
  const getAltText = (slide, type) => {
      const baseTitle = getLocalizedText(slide, 'title') || 'Smarketer';
      const keywords = language === 'ka' 
        ? 'ვებ-გვერდების დამზადება და SEO ოპტიმიზაცია' 
        : 'Web Development and SEO Optimization';
      return `${baseTitle} - ${keywords} - ${type}`;
  };

  // Safe fallback if no slides
  if (!heroData.slides || heroData.slides.length === 0) return null;

  const slide = heroData.slides[currentSlide];
  const designStyle = heroData.settings?.design_style || 'split_layout';
  const animationStyle = heroData.settings?.animation_style || 'fade';
  const cometStyle = heroData.settings?.comet_style || 'simple';
  const bgEffect = heroData.settings?.background_effect !== false;

  // Shared Animation Variants
  const variants = {
    slide_horizontal: {
      enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
      center: { zIndex: 1, x: 0, opacity: 1 },
      exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
    },
    slide_vertical: {
      enter: (direction) => ({ y: direction > 0 ? 1000 : -1000, opacity: 0 }),
      center: { zIndex: 1, y: 0, opacity: 1 },
      exit: (direction) => ({ zIndex: 0, y: direction < 0 ? 1000 : -1000, opacity: 0 })
    },
    fade: {
      enter: { opacity: 0 },
      center: { zIndex: 1, opacity: 1 },
      exit: { zIndex: 0, opacity: 0 }
    },
    zoom: {
        enter: { opacity: 0, scale: 0.9 },
        center: { zIndex: 1, opacity: 1, scale: 1 },
        exit: { zIndex: 0, opacity: 0, scale: 1.1 }
    }
  };

  // --- RENDER STYLES ---

  // 1. MINIMAL MODERN (Centered)
  if (designStyle === 'minimal_modern') {
    return (
      <section className={`relative pt-32 pb-20 min-h-[600px] flex items-center justify-center overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#5468E7]/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#3A4BCF]/10 rounded-full blur-[100px]" />
        </div>
        
        {bgEffect && (
           <div className="absolute inset-0 pointer-events-none">
              <ChaosComet bounds={{ width: 1000, height: 600 }} styleType={cometStyle} />
           </div>
        )}

        <div className="container mx-auto px-4 relative z-10 text-center">
           <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={variants[animationStyle]}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                     className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border ${darkMode ? 'border-white/10 bg-white/5 text-gray-300' : 'border-gray-200 bg-white text-gray-600'} ${getFontClass(slide.badge_font)}`}
                  >
                     <Sparkles className="w-3.5 h-3.5 text-[#5468E7]" />
                     <span className="text-sm font-medium">{getLocalizedText(slide, 'badge')}</span>
                  </motion.div>

                  {seoH1 && currentSlide === 0 ? (
                      <h1 className={`font-bold leading-tight mb-6 ${heroData.settings?.title_size || 'text-4xl lg:text-6xl'} ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass(slide.title_font)}`}>
                          {seoH1}
                      </h1>
                  ) : (
                      <div className={`font-bold leading-tight mb-6 ${heroData.settings?.title_size || 'text-4xl lg:text-6xl'} ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass(slide.title_font)}`}>
                          {getLocalizedText(slide, 'title')}
                      </div>
                  )}

                  <p className={`text-lg lg:text-xl max-w-2xl mx-auto mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${getFontClass(slide.subtitle_font)}`}>
                     {getLocalizedText(slide, 'subtitle')}
                  </p>

                  <div className="flex justify-center">
                     <HeroButtons buttons={slide.buttons} language={language} />
                  </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </section>
    );
  }

  // 2. FULL BACKGROUND (Immersive)
  if (designStyle === 'full_background') {
    return (
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentSlide}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
               className="absolute inset-0 z-0"
            >
               <img 
                 src={slide.image_main || "https://images.unsplash.com/photo-1451187580459-43490279c0fa"} 
                 className="w-full h-full object-cover opacity-60" 
                 alt={getAltText(slide, 'Background Visual')}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </motion.div>
         </AnimatePresence>

         <div className="container mx-auto px-4 relative z-10 text-center">
             <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={variants[animationStyle]}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6 }}
                  className="max-w-5xl mx-auto"
                >
                   <span className={`text-[#5468E7] font-bold tracking-widest uppercase mb-4 block ${getFontClass(slide.badge_font)}`}>
                      {getLocalizedText(slide, 'badge')}
                   </span>

                   {seoH1 && currentSlide === 0 ? (
                      <h1 className={`text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight ${getFontClass(slide.title_font)}`}>
                          {seoH1}
                      </h1>
                  ) : (
                      <div className={`text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight ${getFontClass(slide.title_font)}`}>
                          {getLocalizedText(slide, 'title')}
                      </div>
                  )}

                   <p className={`text-xl text-gray-200 max-w-2xl mx-auto mb-10 ${getFontClass(slide.subtitle_font)}`}>
                      {getLocalizedText(slide, 'subtitle')}
                   </p>
                   
                   <div className="flex justify-center">
                      <HeroButtons buttons={slide.buttons} language={language} />
                   </div>
                </motion.div>
             </AnimatePresence>
         </div>

         {/* Navigation Dots */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {heroData.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-[#5468E7] scale-125' : 'bg-white/30 hover:bg-white/50'}`}
              />
            ))}
         </div>
      </section>
    );
  }

  // 3. GRADIENT MESH (Trendy)
  if (designStyle === 'gradient_mesh') {
    return (
      <section className={`relative pt-32 pb-20 min-h-[700px] flex items-center overflow-hidden ${darkMode ? 'bg-[#050505]' : 'bg-white'}`}>
         {/* Animated Mesh Background */}
         <div className="absolute inset-0 opacity-40 pointer-events-none">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1], 
                 rotate: [0, 45, 0],
                 x: [0, 100, 0] 
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#5468E7] to-[#8A2387] rounded-full blur-[120px] opacity-30 mix-blend-screen" 
             />
             <motion.div 
               animate={{ 
                 scale: [1, 1.3, 1], 
                 x: [0, -100, 0],
                 y: [0, 50, 0]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#3A4BCF] to-[#F27121] rounded-full blur-[100px] opacity-30 mix-blend-screen" 
             />
         </div>

         <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
               <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={variants.fade}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="order-2 lg:order-1"
                  >
                     <div className={`flex items-center gap-2 mb-6 text-[#5468E7] font-bold uppercase tracking-wider ${getFontClass(slide.badge_font)}`}>
                        <div className="w-8 h-[2px] bg-[#5468E7]"></div>
                        {getLocalizedText(slide, 'badge')}
                     </div>

                     {seoH1 && currentSlide === 0 ? (
                        <h1 className={`font-black leading-tight mb-6 ${heroData.settings?.title_size || 'text-5xl lg:text-7xl'} ${darkMode ? 'text-white' : 'text-black'} ${getFontClass(slide.title_font)}`}>
                            {seoH1}
                        </h1>
                     ) : (
                        <div className={`font-black leading-tight mb-6 ${heroData.settings?.title_size || 'text-5xl lg:text-7xl'} ${darkMode ? 'text-white' : 'text-black'} ${getFontClass(slide.title_font)}`}>
                            {getLocalizedText(slide, 'title')}
                        </div>
                     )}

                     <p className={`text-xl mb-8 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${getFontClass(slide.subtitle_font)}`}>
                        {getLocalizedText(slide, 'subtitle')}
                     </p>
                     
                     <HeroButtons buttons={slide.buttons} language={language} />
                  </motion.div>
               </AnimatePresence>

               {/* Right Side Visual */}
               <div className="order-1 lg:order-2 relative h-[400px] lg:h-[500px]">
                   <AnimatePresence mode="wait">
                       <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5 }}
                          className="w-full h-full relative z-10"
                       >
                           {/* Main Image with floating effect */}
                           <motion.div 
                              animate={{ y: [0, -20, 0] }}
                              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                           >
                               <img 
                                 src={slide.image_main} 
                                 className="w-full h-full object-cover" 
                                 alt={getAltText(slide, 'Main Visual')}
                               />
                               <div className="absolute inset-0 bg-gradient-to-tr from-[#5468E7]/20 to-transparent" />
                           </motion.div>
                           
                           {/* Floating secondary elements */}
                           {slide.image_secondary && (
                               <motion.div 
                                  animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                  className="absolute -bottom-10 -left-10 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-black z-20"
                               >
                                  <img 
                                    src={slide.image_secondary} 
                                    className="w-full h-full object-cover" 
                                    alt={getAltText(slide, 'Secondary Visual')} 
                                  />
                               </motion.div>
                           )}
                       </motion.div>
                   </AnimatePresence>
               </div>
            </div>
         </div>
      </section>
    );
  }

  // 4. CARD STYLE (Boxed)
  if (designStyle === 'card_style') {
    return (
      <section className={`py-28 lg:py-36 min-h-[800px] flex items-center ${darkMode ? 'bg-[#050505]' : 'bg-gray-100'}`}>
         <div className="container mx-auto px-4">
            <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl relative ${darkMode ? 'bg-[#0D1126] border border-white/5' : 'bg-white'}`}>
                
                {bgEffect && (
                   <div className="absolute inset-0 overflow-hidden pointer-events-none">
                       <ChaosComet bounds={{ width: 1200, height: 600 }} styleType={cometStyle} />
                   </div>
                )}

                <div className="grid lg:grid-cols-2 min-h-[500px]">
                    {/* Content Side */}
                    <div className="p-8 lg:p-16 flex flex-col justify-center relative z-10">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentSlide}
                                custom={direction}
                                variants={variants[animationStyle]}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <span className={`inline-block py-1 px-3 rounded bg-[#5468E7]/10 text-[#5468E7] font-bold text-xs uppercase mb-6 ${getFontClass(slide.badge_font)}`}>
                                    {getLocalizedText(slide, 'badge')}
                                </span>

                                {seoH1 && currentSlide === 0 ? (
                                    <h1 className={`font-bold mb-6 leading-tight ${heroData.settings?.title_size || 'text-4xl lg:text-5xl'} ${darkMode ? 'text-white' : 'text-gray-900'} ${getFontClass(slide.title_font)}`}>
                                        {seoH1}
                                    </h1>
                                ) : (
                                    <div className={`font-bold mb-6 leading-tight ${heroData.settings?.title_size || 'text-4xl lg:text-5xl'} ${darkMode ? 'text-white' : 'text-gray-900'} ${getFontClass(slide.title_font)}`}>
                                        {getLocalizedText(slide, 'title')}
                                    </div>
                                )}

                                <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${getFontClass(slide.subtitle_font)}`}>
                                    {getLocalizedText(slide, 'subtitle')}
                                </p>

                                <HeroButtons buttons={slide.buttons} language={language} />
                            </motion.div>
                        </AnimatePresence>

                         {/* Navigation Dots (Inside Card) */}
                         <div className="flex gap-2 mt-12">
                            {heroData.slides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-[#5468E7] w-6' : darkMode ? 'bg-white/20' : 'bg-black/20'}`}
                              />
                            ))}
                         </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative h-[400px] lg:h-auto bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img 
                               key={currentSlide}
                               initial={{ opacity: 0, scale: 1.1 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0 }}
                               transition={{ duration: 0.7 }}
                               src={slide.image_main}
                               className="absolute inset-0 w-full h-full object-cover"
                               alt={getAltText(slide, 'Featured Image')}
                            />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10 dark:to-[#0D1126]/50 lg:bg-gradient-to-r" />
                    </div>
                </div>
            </div>
         </div>
      </section>
    );
  }

  // DEFAULT: 5. SPLIT LAYOUT (Classic) - matches original design
  return (
    <section className={`relative pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-[800px] flex items-center z-20 overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#5468E7]/20 to-[#3A4BCF]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: [360, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-[#7A88F5]/20 to-[#5468E7]/20 rounded-full blur-3xl"
        />
      </div>

      {bgEffect && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <ChaosComet bounds={{ width: 1200, height: 800 }} styleType={cometStyle} />
          <ChaosComet bounds={{ width: 1000, height: 1000 }} styleType={cometStyle} />
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants[animationStyle]}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                y: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full touch-pan-y"
            >
              {/* Text Content */}
              <div className="space-y-8 select-none">
                <div className="space-y-6">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5468E7]/20 to-[#3A4BCF]/20 border border-[#5468E7]/30 ${getFontClass(slide.badge_font)}`}
                  >
                    <Sparkles className="w-4 h-4 text-[#5468E7]" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                      {getLocalizedText(slide, 'badge')}
                    </span>
                  </motion.div>

                  {/* Title */}
                  {seoH1 && currentSlide === 0 ? (
                    <h1 className={`font-bold leading-tight ${heroData.settings?.title_size || 'text-4xl lg:text-6xl'} ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass(slide.title_font)}`}>
                        {seoH1}
                    </h1>
                  ) : (
                    <div className={`font-bold leading-tight ${heroData.settings?.title_size || 'text-4xl lg:text-6xl'} ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass(slide.title_font)}`}>
                        {getLocalizedText(slide, 'title')}
                    </div>
                  )}

                  {/* Subtitle */}
                  <p className={`${heroData.settings?.desc_size || 'text-lg lg:text-xl'} ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${getFontClass(slide.subtitle_font)}`}>
                    {getLocalizedText(slide, 'subtitle')}
                  </p>
                </div>

                {/* Buttons */}
                <HeroButtons buttons={slide.buttons} language={language} />
              </div>

              {/* Image Content */}
              <div className="relative select-none pointer-events-none">
                <div className="relative z-10">
                  <div className="relative group">
                    {slide.image_main ? (
                      <img 
                        alt={getAltText(slide, 'Main Illustration')}
                        className="w-full rounded-2xl shadow-2xl object-cover h-[300px] lg:h-[400px] transition-transform duration-700 group-hover:scale-[1.02]" 
                        src={slide.image_main} 
                      />
                    ) : (
                      <div className="w-full h-[300px] lg:h-[400px] bg-gray-800 rounded-2xl flex items-center justify-center border border-white/10">
                        <p className="text-gray-500">No Main Image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#5468E7]/20 to-transparent rounded-2xl" />
                  </div>

                  {slide.image_secondary && (
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-8 -right-8 w-48 lg:w-64 h-auto z-20 hidden sm:block"
                    >
                        <img 
                          alt={getAltText(slide, 'Secondary Graphic')}
                          className="w-full rounded-xl shadow-2xl border-4 border-white dark:border-[#0A0F1C]" 
                          src={slide.image_secondary} 
                        />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          {heroData.slides.length > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12 lg:mt-20 z-20 relative">
              {heroData.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx 
                      ? 'bg-[#5468E7] w-8 h-2' 
                      : darkMode ? 'bg-white/20 w-2 h-2 hover:bg-white/40' : 'bg-black/20 w-2 h-2 hover:bg-black/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
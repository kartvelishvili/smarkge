import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';

const Testimonials = ({ darkMode }) => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({
    title_en: 'Client Feedback',
    title_ka: 'გამოხმაურებები',
    animation_speed: 180 // Default slower speed as requested
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // Subscribe to changes in both tables
    const projectChannel = supabase
      .channel('public:portfolio_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_projects' }, () => fetchData())
      .subscribe();

    const settingsChannel = supabase
      .channel('public:testimonials_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials_settings' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [language]);

  const fetchData = async () => {
    try {
      // Fetch Settings
      const { data: settingsData } = await supabase
        .from('testimonials_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      let speed = 180;
      if (settingsData) {
        setSettings(settingsData);
        speed = settingsData.animation_speed || 180;
      } else {
        setSettings(prev => ({...prev, animation_speed: 180}));
      }

      // Fetch Projects with Testimonial Data
      const { data: projectsData, error } = await supabase
        .from('portfolio_projects')
        .select('id, title_en, title_ka, logo_border_color, testimonial_data, testimonial_visible')
        .eq('visible', true)
        .not('testimonial_data', 'is', null)
        .or('testimonial_visible.is.null,testimonial_visible.eq.true'); 

      if (error) throw error;

      // Filter and normalize data
      const validTestimonials = (projectsData || []).filter(item => {
        if (item.testimonial_visible === false) return false;
        const td = item.testimonial_data;
        const hasName = td?.name || td?.name_en || td?.name_ka;
        const hasText = td?.quote_en || td?.quote_ka || td?.text_en || td?.text_ka;
        return hasName && hasText;
      });

      setTestimonials(validTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-12 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
        <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-[#5468E7] animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  // Split testimonials into two groups for the two rows
  const mid = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.length > 2 ? testimonials.slice(0, mid) : testimonials;
  const row2 = testimonials.length > 2 ? testimonials.slice(mid) : testimonials;
  
  // Ensure enough items for smooth loop by duplicating arrays significantly
  // Increase duplication if speed is very slow to ensure visual continuity
  const extendedRow1 = Array(12).fill(row1).flat();
  const extendedRow2 = Array(12).fill(row2).flat();

  // Use dynamic title
  const sectionTitle = language === 'ka' 
    ? (settings.title_ka || 'გამოხმაურებები') 
    : (settings.title_en || 'Client Feedback');

  // Use the speed from database directly
  const animDuration = settings.animation_speed || 180;

  const TestimonialCard = ({ item }) => {
    const tData = item.testimonial_data || {};
    
    // Resolve Bilingual Fields
    const tName = language === 'ka' 
        ? (tData.name_ka || tData.name_en || tData.name) 
        : (tData.name_en || tData.name_ka || tData.name);
        
    const tRole = language === 'ka' 
        ? (tData.position_ka || tData.position_en || tData.role) 
        : (tData.position_en || tData.position_ka || tData.role);
        
    const tText = language === 'ka' 
        ? (tData.text_ka || tData.quote_ka || tData.text_en || tData.quote_en) 
        : (tData.text_en || tData.quote_en || tData.text_ka || tData.quote_ka);
        
    const tImage = tData.image_url || tData.logo_url || tData.client_logo;

    if (!tName || !tText) return null;
    
    const cardBgColor = '#5468E7';

    return (
      <div 
        className="flex-shrink-0 w-[280px] md:w-[360px] mx-3 relative rounded-xl p-4 md:p-5 shadow-md overflow-hidden flex flex-col justify-center h-[140px] md:h-[170px]"
        style={{ backgroundColor: cardBgColor }}
      >
        <Quote className="absolute top-3 right-5 w-10 h-10 md:w-16 md:h-16 text-white/10" />
        
        <div className="relative z-10 flex items-center gap-3 mb-2 md:mb-4">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white p-0.5 flex-shrink-0 shadow-sm border-2 border-white/20">
              {tImage ? (
                 <img src={tImage} alt={tName} loading="lazy" className="w-full h-full object-cover rounded-full" />
              ) : (
                 <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-base">
                    {tName ? tName.charAt(0) : '?'}
                 </div>
              )}
           </div>
           <div className="overflow-hidden">
              <h4 className="font-bold text-xs md:text-sm text-white truncate pr-2">
                 {tName}
              </h4>
              <p className="text-[10px] md:text-xs text-white/80 truncate pr-2">
                 {tRole}
              </p>
           </div>
        </div>
        
        <p className="relative z-10 text-white font-medium text-[11px] md:text-xs italic leading-relaxed line-clamp-3">
           "{tText}"
        </p>
      </div>
    );
  };

  return (
    <section className={`py-10 lg:py-16 overflow-hidden relative ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      
      {/* Visual Divider */}
      <div className={`absolute top-0 left-0 right-0 h-px ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />
      
      <div className="container mx-auto px-4 lg:px-8 mb-6 lg:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className={`text-2xl lg:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
             {sectionTitle}
          </h2>
          <p className={`text-sm lg:text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'ka' 
              ? 'ნახეთ რას ამბობენ ჩვენი კლიენტები ჩვენთან მუშაობის შესახებ.' 
              : "See what our clients are saying about their experience working with us."}
          </p>
        </motion.div>
      </div>

      <div className="relative w-full space-y-4 md:space-y-5">
        {/* Gradient Masks */}
        <div className={`absolute left-0 top-0 bottom-0 w-16 md:w-32 z-20 bg-gradient-to-r ${darkMode ? 'from-[#0A0F1C] to-transparent' : 'from-[#F4F7FF] to-transparent'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-32 md:w-64 z-20 bg-gradient-to-l ${darkMode ? 'from-[#0A0F1C] via-[#0A0F1C]/80 to-transparent' : 'from-[#F4F7FF] via-[#F4F7FF]/80 to-transparent'}`} />

        {/* Row 1: Right to Left */}
        <div className="flex overflow-hidden">
           <motion.div 
             className="flex"
             animate={{ x: ["0%", "-50%"] }}
             transition={{ 
               repeat: Infinity, 
               ease: "linear", 
               duration: animDuration 
             }}
           >
              {extendedRow1.map((item, idx) => (
                 <TestimonialCard key={`row1-${item.id}-${idx}`} item={item} />
              ))}
           </motion.div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="flex overflow-hidden">
           <motion.div 
             className="flex"
             animate={{ x: ["-50%", "0%"] }}
             transition={{ 
               repeat: Infinity, 
               ease: "linear", 
               duration: animDuration * 1.2 
             }}
           >
              {extendedRow2.map((item, idx) => (
                 <TestimonialCard key={`row2-${item.id}-${idx}`} item={item} />
              ))}
           </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
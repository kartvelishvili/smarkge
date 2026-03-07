import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Monitor, Smartphone, Zap, Search, Layout } from 'lucide-react';

const WebServices = ({ darkMode }) => {
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
  const getFontClass = (field) => {
    if (!content) return 'font-sans';
    const fontKey = language === 'ka' ? `${field}_ka_font` : `${field}_en_font`;
    return content[fontKey] || 'font-sans';
  };

  const displayTitle = content ? (language === 'ka' ? content.title_ka : content.title_en) : '';
  const displayDescription = content ? (language === 'ka' ? content.description_ka : content.description_en) : '';

  const features = [
    { icon: Monitor, title_en: "Responsive Design", title_ka: "რესპონსიული დიზაინი", desc_en: "Perfect on every screen", desc_ka: "იდეალურია ყველა ეკრანზე" },
    { icon: Zap, title_en: "High Performance", title_ka: "მაღალი სისწრაფე", desc_en: "Lightning fast loading speeds", desc_ka: "ელვისებური სისწრაფე" },
    { icon: Search, title_en: "SEO Optimized", title_ka: "SEO ოპტიმიზაცია", desc_en: "Rank higher on Google", desc_ka: "მაღალი პოზიციები Google-ში" },
    { icon: Layout, title_en: "Modern UI/UX", title_ka: "თანამედროვე UI/UX", desc_en: "Intuitive user experience", desc_ka: "ინტუიციური გამოცდილება" }
  ];

  return (
    <section className={`py-20 lg:py-32 relative ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5468E7]/10 text-[#5468E7] mb-6">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Web Development</span>
            </div>
            
            <h2 className={`text-3xl lg:text-5xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass('title')}`}>
              {displayTitle}
            </h2>
            
            <p className={`text-lg mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${getFontClass('description')}`}>
              {displayDescription}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'bg-[#0D1126] border-white/10' : 'bg-white border-gray-100'} hover:border-[#5468E7]/50 transition-colors`}>
                  <feature.icon className="w-8 h-8 text-[#5468E7] mb-3" />
                  <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${getFontClass('title')}`}>
                    {language === 'ka' ? feature.title_ka : feature.title_en}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${getFontClass('description')}`}>
                    {language === 'ka' ? feature.desc_ka : feature.desc_en}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
               <img alt="Modern web development interface" loading="lazy" className="w-full h-auto" 
                 src="https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=800" 
                 srcSet="https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=400 400w, https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=800 800w, https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=1200 1200w"
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-transparent opacity-60"></div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5468E7] rounded-full blur-[80px] opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3A4BCF] rounded-full blur-[80px] opacity-20"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WebServices;
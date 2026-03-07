import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { resolveIcon } from '@/lib/iconMap';

// Enhanced Industry Themes & Data
const INDUSTRY_DATA = {
  healthcare: {
    id: 'healthcare',
    gradient: "from-[#0ea5e9] to-[#22d3ee]", // Sky to Cyan
    route: "/industry/healthcare",
    image: "https://i.postimg.cc/fR5PpdT6/k'linik'ebi.png",
    icon: "HeartPulse"
  },
  real_estate: {
    id: 'real_estate',
    gradient: "from-[#10b981] to-[#34d399]", // Emerald to Teal
    route: "/industry/real-estate",
    image: "https://i.postimg.cc/ZYBLpMBJ/samsheneblo.png",
    icon: "Building2"
  },
  ecommerce: {
    id: 'ecommerce',
    gradient: "from-[#8b5cf6] to-[#d946ef]", // Violet to Fuchsia
    route: "/industry/ecommerce",
    image: "https://i.postimg.cc/qMpz4tdx/online-shop.png",
    icon: "ShoppingBag"
  },
  education: {
    id: 'education',
    gradient: "from-[#f59e0b] to-[#fbbf24]", // Amber to Yellow
    route: "/industry/education",
    image: "https://i.postimg.cc/dVbFQXyG/university.png",
    icon: "GraduationCap"
  },
  tourism: {
    id: 'tourism',
    gradient: "from-[#06b6d4] to-[#38bdf8]", // Cyan to Sky
    route: "/industry/tourism",
    image: "https://i.postimg.cc/9FHNMh85/traveler.png",
    icon: "Plane"
  },
  b2b: {
    id: 'b2b',
    gradient: "from-[#6366f1] to-[#818cf8]", // Indigo
    route: "/industry/b2b",
    image: "https://i.postimg.cc/fTXn2CFn/b2b.png",
    icon: "Briefcase"
  },
  default: {
    id: 'default',
    gradient: "from-gray-500 to-slate-500",
    route: "/contact",
    image: null,
    icon: "Layers"
  }
};

const getIndustryData = (title) => {
  const t = title?.toLowerCase() || '';
  if (t.includes('health') || t.includes('samedicino') || t.includes('klink')) return INDUSTRY_DATA.healthcare;
  if (t.includes('estate') || t.includes('udzravi') || t.includes('samsheneblo')) return INDUSTRY_DATA.real_estate;
  if (t.includes('commerce') || t.includes('shop') || t.includes('online')) return INDUSTRY_DATA.ecommerce;
  if (t.includes('education') || t.includes('ganatleba') || t.includes('university')) return INDUSTRY_DATA.education;
  if (t.includes('tour') || t.includes('mogzauroba') || t.includes('travel')) return INDUSTRY_DATA.tourism;
  if (t.includes('b2b') || t.includes('business')) return INDUSTRY_DATA.b2b;
  return INDUSTRY_DATA.default;
};

const Industries = ({ darkMode }) => {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: settings } = await supabase
          .from('industries_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
          
        if (settings) setData(settings);
      } catch (error) {
        console.error('Error fetching industries:', error);
      }
    };

    fetchData();

    const channel = supabase
      .channel('industries_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'industries_settings' }, (payload) => setData(payload.new))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const defaultTitle = language === 'ka' ? 'ინდუსტრიები, რომლებთანაც ვმუშაობთ' : 'Industries We Work With';
  const defaultDesc = language === 'ka' 
    ? 'ჩვენ გთავაზობთ სპეციალიზებულ გამოცდილებას სხვადასხვა ინდუსტრიისთვის.' 
    : 'We bring specialized expertise to diverse industries.';

  const title = data ? (language === 'ka' ? data.title_ka : data.title_en) : defaultTitle;
  const description = data ? (language === 'ka' ? data.description_ka : data.description_en) : defaultDesc;
  const industries = data?.industries?.filter(i => i.visible !== false) || [];

  return (
    <section className={`py-20 relative overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F8FAFC]'}`}>
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border ${darkMode ? 'border-white/10 bg-white/5 text-blue-400' : 'border-blue-100 bg-blue-50 text-blue-600'}`}>
            {language === 'ka' ? 'გამოცდილება' : 'Expertise'}
          </span>
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {title}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </motion.div>

        {/* Grid Layout: 2 cols mobile, 3 cols tablet, 6 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((industry, index) => {
            const industryData = getIndustryData(industry.title_en);
            const Icon = resolveIcon(industryData.icon) || resolveIcon(industry.icon) || Briefcase;
            const name = language === 'ka' ? industry.title_ka : industry.title_en;
            const cardImage = industryData.image || industry.image_url;

            return (
              <motion.div
                key={industry.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(industryData.route)}
                className="group relative h-[380px] rounded-2xl cursor-pointer perspective-1000 overflow-hidden"
              >
                {/* Card Container */}
                <div className={`
                  relative w-full h-full flex flex-col transition-all duration-500
                  ${darkMode ? 'bg-[#121629]' : 'bg-white'}
                `}>
                  
                  {/* Full Background Image - Grayscale by default, Color on hover */}
                  {cardImage && (
                     <div className="absolute inset-0 z-0">
                        <img 
                           src={cardImage} 
                           alt={name} 
                           loading="lazy"
                           className="w-full h-full object-cover transition-all duration-500 filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-110"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 opacity-90 transition-opacity duration-300`} />
                     </div>
                  )}

                  {/* Content Container */}
                  <div className="relative z-10 p-6 h-full flex flex-col">
                    
                    {/* Title & Arrow at Top */}
                    <div className="flex justify-between items-start mb-auto">
                        <h3 className="text-lg font-bold text-white drop-shadow-md leading-tight">
                            {name}
                        </h3>
                        
                        {/* Arrow (Rotates/Shows on Hover) */}
                        <div className={`
                            opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300
                            w-6 h-6 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm text-white
                        `}>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Icon at Bottom - Colorful & Prominent */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mt-auto shadow-lg
                      bg-gradient-to-br ${industryData.gradient} transition-transform duration-300 group-hover:scale-110
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
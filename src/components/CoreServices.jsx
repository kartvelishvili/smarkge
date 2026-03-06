import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code, TrendingUp, Facebook, Instagram, Linkedin, Youtube, Figma, Database, Globe, Smartphone, Laptop, LayoutTemplate, Check, Sparkles, Zap, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';

const TikTokIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const ReactIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="-11.5 -10.23174 23 20.46348"
    className={className}
    fill="currentColor"
  >
    <circle cx="0" cy="0" r="2.05" opacity="1"/>
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

// --- Animation Components ---

const OrbitingIcons = ({ icons, radius = 250, duration = 30, reverse = false, darkMode }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 w-0 h-0 flex items-center justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ width: radius * 2, height: radius * 2 }}
        animate={{ rotate: reverse ? -360 : 360 }}
      >
        <motion.div 
          className="absolute inset-0"
          animate={{ rotate: reverse ? -360 : 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {icons.map((item, index) => {
            const angleStep = 360 / icons.length;
            const angle = index * angleStep;
            
            return (
              <div
                key={index}
                className="absolute left-1/2 top-1/2 -ml-8 -mt-8"
                style={{
                  transform: `rotate(${angle}deg) translate(${radius}px)`,
                }}
              >
                <motion.div
                  animate={{ rotate: reverse ? 360 : -360 }}
                  transition={{ duration, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div
                    className={`w-16 h-16 rounded-full ${
                      darkMode 
                        ? 'bg-[#1a1f35] border border-white/10 shadow-[0_0_20px_rgba(84,104,231,0.2)]' 
                        : 'bg-white border border-gray-100 shadow-xl'
                    } flex items-center justify-center cursor-pointer pointer-events-auto transition-all duration-300`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2, 
                      boxShadow: darkMode ? "0 0 25px rgba(84, 104, 231, 0.6)" : "0 0 25px rgba(84, 104, 231, 0.4)",
                      borderColor: "#5468E7"
                    }}
                  >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

const ChaoticIcons = ({ icons, darkMode }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((item, index) => {
        // Generate random initial positions and destinations
        const r1 = Math.random();
        const r2 = Math.random();
        
        return (
          <motion.div
            key={index}
            className={`absolute w-12 h-12 rounded-full ${
               darkMode 
                 ? 'bg-[#1a1f35]/80 border border-white/10' 
                 : 'bg-white/80 border border-gray-100'
             } flex items-center justify-center shadow-lg backdrop-blur-sm`}
            initial={{ 
              x: Math.random() * 800 - 400, 
              y: Math.random() * 400 - 200,
              opacity: 0 
            }}
            whileInView={{ opacity: 0.8 }}
            animate={{
              x: [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400],
              y: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{
              left: '50%',
              top: '50%'
            }}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
};

const ScatteredCometIcons = ({ icons, darkMode, reverse = false }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((item, index) => {
        const delay = index * 1.5;
        const duration = 10 + Math.random() * 5;
        const startY = Math.random() * 100; // Random start Y percentage
        
        return (
          <motion.div
            key={index}
            className={`absolute w-10 h-10 rounded-full ${
               darkMode 
                 ? 'bg-[#1a1f35]/60 border border-white/5' 
                 : 'bg-white/60 border border-gray-100'
             } flex items-center justify-center shadow-sm backdrop-blur-sm`}
            initial={{ 
              x: "-20%", 
              y: `${startY}%`, 
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              x: "120%",
              y: [`${startY}%`, `${startY + (Math.random() * 20 - 10)}%`], // slight waver
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
};

const CoreServices = ({ darkMode }) => {
  const { language } = useLanguage();
  const [content, setContent] = useState(null);

  // Default fallback data to ensure the specific card requested is always present
  const defaultServices = [
    {
      id: 'web-dev-default',
      icon: 'Code',
      title_en: 'Web Development & SEO',
      title_ka: 'საიტების დამზადება და SEO ოპტიმიზაცია',
      description_en: 'We create high-performance websites and offer full SEO optimization for search engines.',
      description_ka: 'გთავაზობთ პროფესიონალურ საიტის დამზადებას, SEO ოპტიმიზაციას და ვებ-აპლიკაციებს, რომლებიც ზრდის თქვენს გაყიდვებს.',
      features_ka: ['საიტის დამზადება', 'SEO ოპტიმიზაცია', 'საძიებო სისტემებში ოპტიმიზაცია', 'ონლაინ მაღაზიები', 'ვებ აპლიკაციები', 'ტექნიკური მხარდაჭერა'],
      features_en: ['Website Creation', 'SEO Optimization', 'Search Engine Optimization', 'E-commerce', 'Web Apps', 'Technical Support'],
      chips_ka: ['სწრაფი', 'SEO მზა', 'ადაპტიური'],
      chips_en: ['Fast', 'SEO Ready', 'Responsive']
    },
    {
      id: 'social-media-default',
      icon: 'TrendingUp',
      title_en: 'Social Media & Branding',
      title_ka: 'სოციალური მედია და ბრენდინგი',
      description_en: 'Grow your brand with strategic social media campaigns and professional branding services.',
      description_ka: 'მართეთ სოციალური მედია კამპანიები ეფექტურად. ჩვენ გთავაზობთ Facebook გვერდის მართვას, ლოგოს დამზადებას და სრულ ბრენდინგს.',
      features_ka: ['სოციალური მედია კამპანიები', 'Facebook გვერდის მართვა', 'ლოგოს დამზადება', 'ბრენდინგი', 'ქოფიარაითინგი', 'დიზაინი'],
      features_en: ['Social Media Campaigns', 'Facebook Management', 'Logo Design', 'Branding', 'Copywriting', 'Design'],
      chips_ka: ['Facebook', 'Instagram', 'LinkedIn'],
      chips_en: ['Facebook', 'Instagram', 'LinkedIn']
    }
  ];

  useEffect(() => {
    fetchServicesContent();
    const channel = supabase
      .channel('services_settings_update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_settings' }, () => {
        fetchServicesContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchServicesContent = async () => {
    try {
      const { data, error } = await supabase.from('services_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching services content:', error);
    }
  };

  const socialIcons = [
    { icon: Facebook, color: 'text-blue-600' },
    { icon: Instagram, color: 'text-pink-600' },
    { icon: TikTokIcon, color: 'text-black dark:text-white' },
    { icon: Linkedin, color: 'text-blue-700' },
    { icon: Youtube, color: 'text-red-600' }
  ];

  const webIcons = [
    { icon: ReactIcon, color: 'text-cyan-400' },
    { icon: Figma, color: 'text-purple-400' },
    { icon: Database, color: 'text-emerald-500' },
    { icon: Globe, color: 'text-blue-500' },
    { icon: LayoutTemplate, color: 'text-indigo-500' },
    { icon: Smartphone, color: 'text-orange-500' },
    { icon: Laptop, color: 'text-gray-500' }
  ];

  const allIcons = useMemo(() => [...webIcons, ...socialIcons], []);

  const getIconComponent = (iconNameOrUrl) => {
    if (iconNameOrUrl?.startsWith('http') || iconNameOrUrl?.startsWith('/')) {
      return ({ className }) => <img src={iconNameOrUrl} alt="Service Icon - საიტის დამზადება და SEO" className={`${className} object-contain`} />;
    }
    if (iconNameOrUrl === 'Code') return Code;
    if (iconNameOrUrl === 'TrendingUp') return TrendingUp;
    return Code;
  };

  const animationStyle = content?.animation_style || 'orbit';
  const animationSpeed = content?.animation_speed || 30;

  const getFontClass = (obj, field) => {
    if (!obj) return 'font-sans';
    const fontKey = language === 'ka' ? `${field}_ka_font` : `${field}_en_font`;
    return obj[fontKey] || 'font-sans';
  };

  // SEO Optimized Default Titles
  const defaultTitleKa = 'ციფრული სერვისები: საიტების დამზადება და ბრენდინგი';
  const defaultTitleEn = 'Digital Services: Website Creation & Branding';
  const defaultSubtitleKa = 'სრული ციფრული მომსახურება: ვებ-გვერდების დამზადება, ლოგოს დიზაინი და ბრენდინგი თქვენი ბიზნესის წარმატებისთვის.';
  const defaultSubtitleEn = 'Full digital services: website creation, logo design, and branding for your business success.';

  const displayTitle = content ? (language === 'ka' ? content.title_ka : content.title_en) : (language === 'ka' ? defaultTitleKa : defaultTitleEn);
  const displaySubtitle = content ? (language === 'ka' ? content.subtitle_ka : content.subtitle_en) : (language === 'ka' ? defaultSubtitleKa : defaultSubtitleEn);
  
  const titleFontClass = content ? getFontClass(content, 'title') : 'font-sans';
  const subtitleFontClass = content ? getFontClass(content, 'subtitle') : 'font-sans';

  // Use DB content if available, otherwise use defaultServices
  const servicesList = (content?.services && content.services.length > 0) ? content.services : defaultServices;

  const services = servicesList.map(s => ({
    ...s,
    title: language === 'ka' ? s.title_ka : s.title_en,
    titleFont: getFontClass(s, 'title'),
    description: language === 'ka' ? s.description_ka : s.description_en,
    descriptionFont: getFontClass(s, 'description'),
    features: language === 'ka' ? s.features_ka : s.features_en,
    chips: language === 'ka' ? s.chips_ka : s.chips_en,
    iconComp: getIconComponent(s.icon)
  }));

  const renderAnimation = (type, icons, reverse) => {
    switch(type) {
      case 'chaotic': return <ChaoticIcons icons={icons} darkMode={darkMode} />;
      case 'comet': return <ScatteredCometIcons icons={icons} darkMode={darkMode} reverse={reverse} />;
      case 'orbit': default: return <OrbitingIcons icons={icons} radius={280} duration={animationSpeed} darkMode={darkMode} reverse={reverse} />;
    }
  };

  return (
    <section className={`py-20 lg:py-32 relative ${darkMode ? 'bg-[#0D1126]' : 'bg-white'} overflow-hidden`}>
      
      {/* Top Animation Container */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${darkMode ? 'from-[#0D1126]/50 via-[#0D1126]/80 to-[#0D1126]' : 'from-white/50 via-white/80 to-white'} z-10`} />
        {renderAnimation(animationStyle, allIcons, false)}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-30 pt-10"
        >
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'} ${titleFontClass}`}>
            {displayTitle}
          </h2>
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${subtitleFontClass}`}>
            {displaySubtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 relative max-w-6xl mx-auto">
          {services.map((service, index) => {
            // Determine theme based on index for variety
            const theme = index === 0 ? 'blue' : 'purple';
            const gradientFrom = theme === 'blue' ? 'from-blue-600' : 'from-purple-600';
            const gradientTo = theme === 'blue' ? 'to-cyan-400' : 'to-pink-500';
            const shadowColor = theme === 'blue' ? 'shadow-blue-500/20' : 'shadow-purple-500/20';
            const chipBg = theme === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400';
            const checkColor = theme === 'blue' ? 'text-cyan-400' : 'text-pink-400';

            return (
              <motion.div
                key={service.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative h-full"
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 -z-10 ${
                    theme === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                }`} />

                {/* Main Card Container */}
                <div className={`
                    relative h-full flex flex-col p-8 lg:p-10 rounded-3xl border transition-all duration-300
                    ${darkMode 
                        ? 'bg-[#15192b] border-white/5 hover:border-white/10' 
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl'
                    }
                `}>
                    
                    {/* Header: Icon & Title */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                        <motion.div 
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className={`
                                relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0
                                bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg ${shadowColor}
                            `}
                        >
                             <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <service.iconComp className="w-8 h-8 text-white relative z-10" />
                        </motion.div>

                        <div>
                            <h3 className={`text-2xl lg:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} ${service.titleFont}`}>
                                {service.title}
                            </h3>
                            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
                        </div>
                    </div>

                    {/* Description */}
                    <p className={`text-lg mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${service.descriptionFont}`}>
                        {service.description}
                    </p>

                    {/* Features List */}
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6 mb-8 flex-1">
                        {service.features?.map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.05) }}
                                className="flex items-center gap-3"
                            >
                                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white/5 ${checkColor}`}>
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${service.descriptionFont}`}>
                                    {feature}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chips / Tags */}
                    <div className="flex flex-wrap gap-2 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800">
                        {service.chips?.map((chip, idx) => (
                            <motion.span
                                key={idx}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase
                                    ${darkMode ? chipBg : `bg-gray-100 text-gray-600 hover:${chipBg}`}
                                    transition-colors cursor-default
                                    ${service.descriptionFont}
                                `}
                            >
                                {chip}
                            </motion.span>
                        ))}
                    </div>

                    {/* Decorative Corner Gradient */}
                    <div className={`
                        absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientFrom} ${gradientTo} 
                        opacity-5 blur-[60px] rounded-full pointer-events-none
                    `} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreServices;
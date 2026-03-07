import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowRight, Facebook, Instagram, Linkedin, 
  Youtube, Twitter, Mail, Target, BarChart, TrendingUp, Lightbulb, 
  Palette, Rocket, RefreshCw, Heart, Calendar, Clock, Send, FileText,
  MousePointer2, Search, Camera, ChevronRight, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PortfolioCard from '@/components/PortfolioCard';

// --- Animated Counter Component ---
const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  
  // Extract number from string (e.g., "6.3M" -> 6.3)
  const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;
  const isFloat = value.toString().includes('.');

  useEffect(() => {
    if (inView) {
      let startTime;
      const startValue = 0;
      
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const current = startValue + (numericValue - startValue) * easeOutQuart;
        
        setDisplayValue(isFloat ? current.toFixed(1) : Math.floor(current));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [inView, numericValue, duration, isFloat]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
};

// --- Animated Sphere Component ---
const AnimatedSphere = ({ bounds, size = 'medium', color }) => {
  const motionParams = useMemo(() => {
    const randomDuration = 15 + Math.random() * 20; // Slower, smoother animation
    const pathPoints = Array.from({ length: 5 }).map(() => ({
      x: (Math.random() - 0.5) * bounds.width * 1.2,
      y: (Math.random() - 0.5) * bounds.height * 1.2,
      scale: 0.8 + Math.random() * 0.4,
    }));

    return { duration: randomDuration, path: pathPoints };
  }, [bounds]);

  // Size configuration
  let sizeClass = 'w-4 h-4';
  if (size === 'small') sizeClass = 'w-2 h-2';
  if (size === 'large') sizeClass = 'w-12 h-12'; // Larger spheres as requested

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: motionParams.path.map(p => p.x),
        y: motionParams.path.map(p => p.y),
        opacity: [0, 0.8, 0.4, 0.9, 0],
        scale: motionParams.path.map(p => p.scale),
      }}
      transition={{
        duration: motionParams.duration,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeatType: "mirror"
      }}
      className={`absolute top-1/2 left-1/2 rounded-full pointer-events-none z-0 ${sizeClass}`}
      style={{ backgroundColor: color }}
    />
  );
};

// --- Orbiting Icons Component ---
const OrbitingIcons = ({ icons }) => {
  if (!icons || icons.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      <div className="absolute w-[600px] h-[600px] rounded-full border border-current opacity-5 animate-spin-slow" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-current opacity-10 animate-spin-reverse-slow" />
      
      {icons.map((Icon, index) => {
        const angle = (index / icons.length) * 360;
        const radius = 300 + (index % 2) * 100; 
        const duration = 20 + (index % 3) * 5; 
        
        return (
          <motion.div
            key={index}
            className="absolute"
            animate={{ rotate: 360 }}
            transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
            style={{ width: radius * 2, height: radius * 2 }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `rotate(-${angle}deg)` }} 
            >
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                <Icon className="w-6 h-6 opacity-80" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const SocialMediaPage = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [industriesMap, setIndustriesMap] = useState({});

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data: industriesData, error: indError } = await supabase.from('industries_settings').select('industries').limit(1).maybeSingle();
      
      if (indError) {
          console.warn("Could not fetch industries settings:", indError.message);
      } else if (industriesData && industriesData.industries) {
          const map = {};
          industriesData.industries.forEach(ind => { map[ind.id] = ind; });
          setIndustriesMap(map);
      }

      const { data: projectsData, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('visible', true)
        .or('project_type.eq.social_media,category_en.ilike.%Social media%,category_ka.ilike.%სოციალური მედია%')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (projectsData) setPortfolioProjects(projectsData);
    } catch (error) {
      console.error('Error fetching social media portfolio:', error);
    }
  };

  const SERVICES = [
    {
      id: 1,
      icon: Facebook,
      title_en: "Facebook Marketing", 
      title_ka: "Facebook გვერდის მართვა",
      desc_en: "Professional Facebook page management to grow your audience and run effective ad campaigns.",
      desc_ka: "Facebook გვერდის პროფესიონალური მართვა, აუდიტორიის ზრდა და ეფექტური სარეკლამო კამპანიები.",
      features_en: ["Targeted ads", "Audience building", "Engagement"],
      features_ka: ["მიზნობრივი რეკლამა", "აუდიტორიის ზრდა", "ჩართულობა"],
      color: "from-blue-600 to-blue-400"
    },
    {
      id: 2,
      icon: Instagram,
      title_en: "Instagram Marketing", 
      title_ka: "Instagram გვერდის მართვა",
      desc_en: "Visual storytelling strategy for Instagram that increases brand awareness and engagement.",
      desc_ka: "Instagram გვერდის მართვა ვიზუალური სტრატეგიით, რომელიც ზრდის ბრენდის ცნობადობას და ჩართულობას.",
      features_en: ["Content creation", "Influencers", "Stories"],
      features_ka: ["კონტენტის შექმნა", "ინფლუენსერები", "სთორები"],
      color: "from-pink-600 to-purple-500"
    },
    {
      id: 3,
      icon: Linkedin,
      title_en: "LinkedIn Marketing", 
      title_ka: "LinkedIn გვერდის მართვა",
      desc_en: "Professional networking and B2B lead generation via LinkedIn management.",
      desc_ka: "LinkedIn გვერდის მართვა B2B სექტორისთვის, პროფესიული ნეთვორქინგი და ლიდების გენერაცია.",
      features_en: ["B2B campaigns", "Lead generation", "Networking"],
      features_ka: ["B2B კამპანიები", "ლიდების გენერაცია", "ნეთვორქინგი"],
      color: "from-blue-700 to-blue-500"
    },
    {
      id: 4,
      icon: Youtube,
      title_en: "YouTube Marketing", 
      title_ka: "YouTube არხის მართვა",
      desc_en: "YouTube channel management and video marketing strategy for maximum reach.",
      desc_ka: "YouTube არხის მართვა და ვიდეო მარკეტინგის სტრატეგია მაქსიმალური წვდომისთვის.",
      features_en: ["Video ads", "Channel growth", "Engagement"],
      features_ka: ["ვიდეო რეკლამა", "არხის ზრდა", "ჩართულობა"],
      color: "from-red-600 to-red-400"
    },
    {
      id: 5,
      icon: Search,
      title_en: "Google Ads", 
      title_ka: "Google რეკლამა (Google Ads)",
      desc_en: "Search engine advertising and Google Ads campaign management with precise targeting.",
      desc_ka: "საძიებო სისტემის რეკლამა და Google Ads კამპანიების მართვა ზუსტი ტარგეტირებით.",
      features_en: ["Search ads", "Display network", "Conversion"],
      features_ka: ["საძიებო რეკლამა", "დისფლეი ქსელი", "კონვერსია"],
      color: "from-green-600 to-emerald-400"
    },
    {
      id: 6,
      icon: Mail,
      title_en: "Email Marketing", 
      title_ka: "Email მარკეტინგი",
      desc_en: "Email marketing strategy and automation for direct customer communication.",
      desc_ka: "Email მარკეტინგის სტრატეგია და ავტომატიზაცია მომხმარებელთან პირდაპირი კომუნიკაციისთვის.",
      features_en: ["Newsletters", "Automation", "Personalization"],
      features_ka: ["სიახლეები", "ავტომატიზაცია", "პერსონალიზაცია"],
      color: "from-yellow-500 to-amber-400"
    },
    {
      id: 7,
      icon: MousePointer2,
      title_en: "TikTok Marketing", 
      title_ka: "TikTok გვერდის მართვა",
      desc_en: "TikTok page management and viral content creation for the next generation audience.",
      desc_ka: "TikTok გვერდის მართვა და ვირუსული კონტენტის შექმნა ახალი თაობის აუდიტორიისთვის.",
      features_en: ["Viral content", "Trend optimization", "Youth targeting"],
      features_ka: ["ვირუსული კონტენტი", "ტრენდები", "ახალგაზრდები"],
      color: "from-gray-900 to-black"
    },
    {
      id: 8,
      icon: Camera,
      title_en: "Photo & Video Production", 
      title_ka: "ფოტო/ვიდეო გადაღება",
      desc_en: "Professional photo and video production for social media content planning.",
      desc_ka: "პროფესიონალური ფოტო და ვიდეო გადაღება სოციალური მედია კონტენტის დასაგეგმად.",
      features_en: ["Photography", "Video production", "Product shoots", "Commercials"],
      features_ka: ["ფოტოგრაფია", "ვიდეო პროდაქშენი", "პროდუქტის გადაღება", "კომერციული"],
      color: "from-teal-500 to-emerald-500"
    }
  ];

  const STATS = [
    {
      id: 1,
      number: "6.3",
      suffix: "M+",
      prefix: "$",
      label_en: "Advertising Budget Managed",
      label_ka: "მართული რეკლამის ბიუჯეტი",
      icon: BarChart,
      color: "text-green-500"
    },
    {
      id: 2,
      number: "500",
      suffix: "+",
      label_en: "Successful Campaigns",
      label_ka: "წარმატებული კამპანია",
      icon: Target,
      color: "text-blue-500"
    },
    {
      id: 3,
      number: "30",
      suffix: "M+",
      label_en: "Products Sold",
      label_ka: "გაყიდული პროდუქცია",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      id: 4,
      number: "98",
      suffix: "%",
      label_en: "Client Satisfaction Rate",
      label_ka: "კლიენტის კმაყოფილება",
      icon: Heart,
      color: "text-red-500"
    }
  ];

  const PROCESS_STEPS = [
    {
      id: 1,
      icon: Lightbulb,
      title_en: "Strategy & Planning", 
      title_ka: "სტრატეგია და დაგეგმვა",
      desc_en: "Social media service begins with business analysis and detailed strategy development.",
      desc_ka: "სოციალური მედია მომსახურება იწყება ბიზნესის ანალიზით და დეტალური სტრატეგიის შემუშავებით.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "სოციალური მედია სტრატეგიის დაგეგმვა და გუნდური განხილვა" : "Social media strategy planning and team meeting"} src="https://images.unsplash.com/photo-1690191886622-fd8d6cda73bd" />
    },
    {
      id: 2,
      icon: Palette,
      title_en: "Content Creation", 
      title_ka: "კონტენტის დაგეგმვა და შექმნა",
      desc_en: "We create high-quality visuals and copy, crucial for Facebook and Instagram page management.",
      desc_ka: "ვქმნით მაღალი ხარისხის ვიზუალებს და ტექსტებს, რაც გადამწყვეტია Facebook და Instagram გვერდის მართვისას.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "კონტენტის დაგეგმვა და დიზაინის შექმნა Facebook და Instagram-ისთვის" : "Content planning and design creation for Facebook and Instagram"} src="https://images.unsplash.com/photo-1675119715594-30fde4bd3dbc" />
    },
    {
      id: 3,
      icon: Rocket,
      title_en: "Campaign Launch", 
      title_ka: "სარეკლამო კამპანიის გაშვება",
      desc_en: "Social media advertising: Launching targeted campaigns on Facebook, Instagram, and other platforms.",
      desc_ka: "რეკლამა სოციალურ მედიაში: მიზნობრივი კამპანიების გაშვება Facebook, Instagram და სხვა პლატფორმებზე.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "რეკლამა სოციალურ მედიაში - კამპანიის წარმატებული გაშვება" : "Social media advertising - successful campaign launch"} src="https://images.unsplash.com/photo-1700508317396-e343a69ac72f" />
    },
    {
      id: 4,
      icon: BarChart,
      title_en: "Monitoring & Optimization", 
      title_ka: "მონიტორინგი და ოპტიმიზაცია",
      desc_en: "Constant monitoring and optimization of campaigns for maximum results.",
      desc_ka: "კამპანიების მუდმივი მონიტორინგი და ოპტიმიზაცია მაქსიმალური შედეგისთვის.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "სოციალური მედია კამპანიების მონიტორინგი და ანალიტიკა" : "Social media campaign monitoring and analytics"} src="https://images.unsplash.com/photo-1625296276703-3fbc924f07b5" />
    },
    {
      id: 5,
      icon: FileText,
      title_en: "Reporting & Analysis", 
      title_ka: "რეპორტინგი და ანალიზი",
      desc_en: "Detailed reporting on social media campaign results and future recommendations.",
      desc_ka: "დეტალური რეპორტინგი სოციალური მედია კამპანიების შედეგებზე და სამომავლო რეკომენდაციები.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "Facebook გვერდის მართვის რეპორტინგი და შედეგების ანალიზი" : "Facebook page management reporting and results analysis"} src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd" />
    },
    {
      id: 6,
      icon: RefreshCw,
      title_en: "Continuous Improvement", 
      title_ka: "მუდმივი გაუმჯობესება",
      desc_en: "Continuous growth of social media service quality through testing and innovation.",
      desc_ka: "სოციალური მედია მომსახურების ხარისხის მუდმივი ზრდა ტესტირებისა და ინოვაციების გზით.",
      imgComp: <img loading="lazy" alt={language === 'ka' ? "სოციალური მედია მომსახურების გაუმჯობესება და ზრდა" : "Improvement and growth of social media services"} src="https://images.unsplash.com/photo-1691405167344-c3bbc9710ad2" />
    }
  ];

  const WORKFLOW_ITEMS = [
    { icon: Calendar, label_en: "Content Planning", label_ka: "დაგეგმვა" },
    { icon: Palette, label_en: "Content Creation", label_ka: "შექმნა" },
    { icon: Clock, label_en: "Scheduling", label_ka: "განრიგი" },
    { icon: Send, label_en: "Publishing", label_ka: "გამოქვეყნება" },
    { icon: Heart, label_en: "Engagement", label_ka: "ჩართულობა" },
    { icon: BarChart, label_en: "Analytics", label_ka: "ანალიტიკა" },
    { icon: FileText, label_en: "Reporting", label_ka: "რეპორტინგი" },
  ];

  const orbitIcons = [Facebook, Instagram, Linkedin, Youtube, Twitter, Mail, Target];

  // Define colors based on theme
  const sphereColor1 = darkMode ? '#FFFFFF' : '#5468E7'; // White in dark mode, Brand Blue in light
  const sphereColor2 = darkMode ? '#A5B4FC' : '#8B5CF6'; // Light Indigo in dark, Purple in light
  const sphereColor3 = darkMode ? '#E0E7FF' : '#3B82F6'; // Very Light Indigo in dark, Blue in light

  const heroBgClass = darkMode 
    ? 'bg-[#0A0F1C]' 
    : 'bg-gradient-to-b from-[#EFF6FF] via-[#F5F3FF] to-[#FFFFFF]';

  const heroTextClass = darkMode ? 'text-white' : 'text-[#0A0F1C]';
  const heroSubtextClass = darkMode ? 'text-gray-300' : 'text-slate-600';
  const iconColorClass = darkMode ? 'text-white' : 'text-[#5468E7]';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <SEO 
        slug="/social-media" 
        title={language === 'ka' ? "სოციალური მედია მომსახურება | Facebook და Instagram გვერდის მართვა" : "Social Media Services | Facebook & Instagram Page Management"}
        description={language === 'ka' ? "სოციალური მედია მომსახურება საქართველოში — Facebook და Instagram გვერდის მართვა, კონტენტის დაგეგმვა და შედეგზე ორიენტირებული კამპანიები." : "Social media services in Georgia — Facebook and Instagram page management, content planning, and results-oriented campaigns."}
      />
      
      {/* Header with alwaysOpaque to ensure immediate visibility and white background in light mode */}
      <Header alwaysOpaque={true} />

      {/* 1. HERO SECTION - LIGHT/DARK VERSION SUPPORT & SPHERES */}
      <div className={`relative overflow-hidden pt-32 lg:pt-48 pb-20 lg:pb-32 ${heroBgClass}`}> 
         {/* Background depth for dark mode, clean for light */}
         {darkMode && <div className="absolute inset-0 bg-gradient-to-b from-[#11162B] to-[#0A0F1C] opacity-100 z-0"></div>}
         
         {/* Animated Spheres (Replacing Comets) */}
         <div className={`absolute inset-0 pointer-events-none overflow-visible z-0 ${iconColorClass}`}>
             <OrbitingIcons icons={orbitIcons} />
             <AnimatedSphere bounds={{ width: 1200, height: 600 }} size="large" color={sphereColor1} />
             <AnimatedSphere bounds={{ width: 1000, height: 800 }} size="medium" color={sphereColor2} />
             <AnimatedSphere bounds={{ width: 800, height: 500 }} size="small" color={sphereColor3} />
             <AnimatedSphere bounds={{ width: 600, height: 400 }} size="medium" color={sphereColor1} />
         </div>

         <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 font-semibold tracking-wide text-sm backdrop-blur-md ${darkMode ? 'bg-[#5468E7]/10 border-[#5468E7]/30 text-[#5468E7]' : 'bg-white border-blue-200 text-[#5468E7] shadow-sm'}`}
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'ka' ? 'სოციალური მედია მომსახურება' : 'Social Media Services'}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl lg:text-7xl font-extrabold mb-6 leading-tight max-w-5xl mx-auto ${heroTextClass}`}
            >
              {language === 'ka' ? 'სოციალური მედია მომსახურება და' : "Social Media Services &"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5468E7] via-purple-500 to-pink-500">
                {language === 'ka' ? 'Facebook გვერდის მართვა საქართველოში' : 'Facebook Page Management in Georgia'}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-10 ${heroSubtextClass}`}
            >
              {language === 'ka' 
                ? 'ჩვენ გთავაზობთ სრულ სოციალური მედია მომსახურებას: Facebook და Instagram გვერდის მართვა, კონტენტის დაგეგმვა და რეკლამა სოციალურ მედიაში, რაც უზრუნველყოფს თქვენი ბრენდის ცნობადობისა და გაყიდვების ზრდას.' 
                : 'We offer full social media services: Facebook and Instagram page management, content planning, and social media advertising to increase your brand awareness and sales.'}
            </motion.p>
            
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
            >
                <Button asChild className="bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] hover:from-[#3A4BCF] hover:to-[#5468E7] px-10 py-7 rounded-full text-lg font-bold shadow-lg shadow-[#5468E7]/25 transition-all hover:scale-105">
                   <a href="#contact">
                      {language === 'ka' ? 'დაგვიკავშირდით' : 'Get Started'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                   </a>
                </Button>
            </motion.div>
         </div>
      </div>

      {/* 2. STATISTICS SECTION */}
      <section className={`py-12 -mt-10 relative z-20`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl shadow-2xl backdrop-blur-md border ${darkMode ? 'bg-[#0D1126]/90 border-white/10' : 'bg-white/90 border-white/50'}`}>
               {STATS.map((stat, idx) => (
                  <motion.div 
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center text-center p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 last:border-0"
                  >
                     <div className={`mb-3 p-3 rounded-xl bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                     </div>
                     <h3 className={`text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {stat.prefix}<AnimatedCounter value={stat.number} suffix={stat.suffix} />
                     </h3>
                     <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {language === 'ka' ? stat.label_ka : stat.label_en}
                     </p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="py-20 lg:py-32 container mx-auto px-4 lg:px-8">
         <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
               {language === 'ka' ? 'Facebook და Instagram გვერდის მართვა - სრული სერვისი' : 'Facebook & Instagram Page Management - Full Service'}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
               {language === 'ka' 
                 ? 'ჩვენი სოციალური მედია მომსახურება მოიცავს ყველა პლატფორმას. Facebook გვერდის მართვა, Instagram ვიზუალი და რეკლამა სოციალურ მედიაში თქვენი წარმატებისთვის.'
                 : 'Our social media services cover all platforms. Facebook page management, Instagram visuals, and social media advertising for your success.'}
            </p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => (
               <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                     darkMode 
                       ? 'bg-[#0D1126] border-white/5 hover:border-[#5468E7]/30' 
                       : 'bg-white border-gray-100 hover:border-[#5468E7]/30'
                  }`}
               >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                     <service.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                     {language === 'ka' ? service.title_ka : service.title_en}
                  </h3>
                  
                  <p className={`text-sm mb-6 min-h-[40px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     {language === 'ka' ? service.desc_ka : service.desc_en}
                  </p>
                  
                  <ul className="space-y-2">
                     {(language === 'ka' ? service.features_ka : service.features_en).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs font-medium">
                           <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color}`} />
                           <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                        </li>
                     ))}
                  </ul>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 4. WORKFLOW VISUALIZATION SECTION */}
      <section className={`py-20 overflow-hidden ${darkMode ? 'bg-[#0D1126]' : 'bg-[#F4F7FF]'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
               <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {language === 'ka' ? 'სოციალური მედია კამპანიების დაგეგმვა - ეკოსისტემა' : 'Social Media Campaign Planning - Ecosystem'}
               </h2>
               <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'ka' ? 'ინტეგრირებული მიდგომა: კონტენტის დაგეგმვა, Facebook გვერდის მართვა და ანალიტიკა ერთ სივრცეში.' : 'Integrated approach: content planning, Facebook page management, and analytics in one space.'}
               </p>
            </div>

            {/* Horizontal Flow Container */}
            <div className="relative pt-10">
               {/* Steps Scrollable Container */}
               <div className="overflow-x-auto pb-8 custom-scrollbar">
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between min-w-[900px] gap-4 px-4">
                      {WORKFLOW_ITEMS.map((item, idx) => (
                          <div key={idx} className="relative group flex flex-col items-center flex-1">
                              {/* Connector Line */}
                              {idx < WORKFLOW_ITEMS.length - 1 && (
                                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#5468E7]/20 to-[#5468E7] z-0" />
                              )}
                              
                              {/* Icon Circle */}
                              <motion.div 
                                  initial={{ scale: 0, opacity: 0 }}
                                  whileInView={{ scale: 1, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1 }}
                                  className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg ${darkMode ? 'bg-[#1e2542] border border-white/10 text-white' : 'bg-white border border-gray-100 text-[#5468E7]'}`}
                              >
                                  <item.icon className="w-7 h-7" />
                                  <div className="absolute -bottom-2 -right-2 bg-[#5468E7] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                      {idx + 1}
                                  </div>
                              </motion.div>

                              {/* Label */}
                              <h4 className={`text-sm font-bold text-center px-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                  {language === 'ka' ? item.label_ka : item.label_en}
                              </h4>
                              
                              {/* Mobile Arrow (Vertical) */}
                              {idx < WORKFLOW_ITEMS.length - 1 && (
                                  <div className="md:hidden my-2">
                                      <ChevronRight className="w-5 h-5 text-[#5468E7] rotate-90" />
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. PROCESS FLOW SECTION */}
      <section className="py-20 lg:py-32 container mx-auto px-4 lg:px-8">
         <div className="text-center mb-20">
            <h2 className={`text-3xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
               {language === 'ka' ? 'Facebook და Instagram გვერდის მართვის პროცესი' : 'Facebook & Instagram Page Management Process'}
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
               {language === 'ka' ? 'ნაბიჯ-ნაბიჯ წარმატებული სოციალური მედია კამპანიებისკენ' : 'Step-by-step to successful social media campaigns'}
            </p>
         </div>

         <div className="relative">
            {/* Center Line (Desktop) */}
            <div className={`hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 ${darkMode ? 'bg-gradient-to-b from-[#5468E7]/0 via-[#5468E7]/50 to-[#5468E7]/0' : 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200'}`}></div>

            <div className="space-y-16 lg:space-y-24">
               {PROCESS_STEPS.map((step, idx) => (
                  <motion.div 
                     key={step.id}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className={`relative flex flex-col lg:flex-row items-center gap-12 ${idx % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
                  >
                     {/* Text Side */}
                     <div className="flex-1 text-center lg:text-left">
                        <div className={`inline-block p-3 rounded-xl mb-4 ${darkMode ? 'bg-[#5468E7]/20 text-[#5468E7]' : 'bg-[#5468E7]/10 text-[#5468E7]'}`}>
                           <step.icon className="w-8 h-8" />
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                           {language === 'ka' ? step.title_ka : step.title_en}
                        </h3>
                        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                           {language === 'ka' ? step.desc_ka : step.desc_en}
                        </p>
                     </div>

                     {/* Center Marker (Desktop) */}
                     <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-[#5468E7] text-white font-bold z-10 shadow-[0_0_0_8px_rgba(84,104,231,0.2)]">
                        {step.id}
                     </div>

                     {/* Visual Side with Image */}
                     <div className="flex-1 w-full">
                        <div className={`w-full aspect-video rounded-2xl overflow-hidden relative group shadow-2xl ${darkMode ? 'border border-white/10' : 'border border-gray-100'}`}>
                           <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-105">
                              {step.imgComp}
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                           
                           {/* Step Label Overlay */}
                           <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg">
                               <span className="text-xs font-bold text-[#0A0F1C] uppercase tracking-wider">
                                   Step {step.id}
                               </span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. PORTFOLIO SECTION */}
      <section className={`py-20 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
               <div>
                  <h2 className={`text-3xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                     {language === 'ka' ? 'ჩვენი ნამუშევრები: სოციალური მედია კამპანიები' : 'Our Work: Social Media Campaigns'}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                     {language === 'ka' ? 'ბოლო დროს განხორციელებული წარმატებული Facebook და Instagram კამპანიები' : 'Recent successful Facebook and Instagram campaigns'}
                  </p>
               </div>
               <Button variant="outline" className={`${darkMode ? 'border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7] hover:text-white' : ''}`}>
                  {language === 'ka' ? 'ყველა პროექტი' : 'View All Projects'} <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {portfolioProjects.length > 0 ? (
                  portfolioProjects.slice(0, 6).map((project, idx) => (
                     <PortfolioCard 
                        key={project.id} 
                        project={project}
                        industriesMap={industriesMap}
                        language={language}
                        darkMode={darkMode}
                        index={idx}
                     />
                  ))
               ) : (
                  // Fallback if no projects loaded yet - Demo Cards
                  [1, 2, 3].map((_, idx) => (
                     <div key={idx} className={`h-[420px] rounded-2xl animate-pulse ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}></div>
                  ))
               )}
            </div>
         </div>
      </section>

      {/* CALL TO ACTION - REVERTED TO BRAND GRADIENT */}
      <section id="contact" className="py-20">
         <div className="container mx-auto px-4 lg:px-8">
            <div className={`relative rounded-[2.5rem] p-10 lg:p-20 overflow-hidden text-center bg-gradient-to-r from-[#5468E7] to-[#3A4BCF]`}>
               {/* Background Pattern - subtle cubes */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               
               <div className="relative z-10">
                  <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                     {language === 'ka' ? 'გსურთ Facebook გვერდის პროფესიონალური მართვა?' : 'Ready for Professional Facebook Page Management?'}
                  </h2>
                  <p className="text-white/90 text-lg max-w-2xl mx-auto mb-10">
                     {language === 'ka' 
                       ? 'დაგვიკავშირდით დღესვე! მიიღეთ უფასო კონსულტაცია სოციალური მედია მომსახურებაზე და გაზარდეთ თქვენი ბიზნესის შემოსავალი.' 
                       : 'Contact us today! Get a free consultation on social media services and grow your business revenue.'}
                  </p>
                  <Button className="bg-white text-[#5468E7] hover:bg-gray-100 px-10 py-6 rounded-full text-lg font-bold shadow-xl transition-transform hover:scale-105">
                     {language === 'ka' ? 'უფასო კონსულტაცია' : 'Free Consultation'}
                  </Button>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default SocialMediaPage;
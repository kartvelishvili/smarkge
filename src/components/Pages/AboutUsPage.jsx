import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Users, Target, Heart, Award, ArrowRight, Globe, Megaphone, Palette, Search, Share2, ShoppingCart, Layout, PenTool, ShieldCheck, Lightbulb, CheckCircle2, Briefcase, CalendarDays, Smile } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AnimatedSection from '@/components/AnimatedSection';
import { usePageContent } from '@/hooks/usePageContent';

// Animated Counter Component
const AnimatedCounter = ({
  value,
  duration = 2
}) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, {
    once: true
  });
  const [displayValue, setDisplayValue] = useState(0);

  // Extract number from string (e.g., "13+" -> 13)
  const numberValue = parseInt(value.toString().replace(/[^0-9]/g, '')) || 0;
  const suffix = value.toString().replace(/[0-9]/g, '');
  useEffect(() => {
    if (inView) {
      let startTime;
      const startValue = 0;
      const step = timestamp => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(startValue + (numberValue - startValue) * easeOutQuart);
        setDisplayValue(current);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, numberValue, duration]);
  return <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>;
};
const AboutUsPage = () => {
  const {
    darkMode
  } = useTheme();
  const {
    language
  } = useLanguage();
  const [dbData, setDbData] = useState(null);
  const { content: pc } = usePageContent('about', {});

  // Icon map for DB-defined services/values
  const ICON_MAP = { Globe, Megaphone, Palette, Search, Share2, ShoppingCart, Layout, PenTool, Lightbulb, CheckCircle2, Heart, ShieldCheck, Users, Target, Award, CalendarDays, Briefcase, Smile };

  // --- DEFAULT SMARKETER CONTENT ---
  const SMARKETER_DATA = {
    hero_image: "https://i.postimg.cc/QNKGTtCQ/group-smarketer-YFAdo-(1).webp",
    company_name_ka: 'შპს "სმარკეტერი"',
    company_name_en: 'Smarketer LLC',
    tagline_ka: 'თქვენი ბიზნესის ციფრული ტრანსფორმაცია',
    tagline_en: 'Your Business Digital Transformation',
    about_title_ka: 'ვინ ვართ ჩვენ',
    about_title_en: 'Who We Are',
    about_desc_ka: '„სმარკეტერი“ არის წამყვანი ციფრული მარკეტინგისა და ვებ-დეველოპმენტის სააგენტო, რომელიც დაარსდა ქართული ბიზნესების ონლაინ სივრცეში გასაძლიერებლად. ჩვენი გუნდი შედგება გამოცდილი დიზაინერების, დეველოპერებისა და მარკეტერებისგან, რომლებიც ქმნიან თანამედროვე, ინოვაციურ გადაწყვეტილებებს.',
    about_desc_en: 'Smarketer is a leading digital marketing and web development agency dedicated to helping Georgian businesses thrive in the digital landscape. Our team consists of skilled designers, developers, and marketing experts committed to delivering innovative solutions and exceptional results.',
    mission_title_ka: 'ჩვენი მისია',
    mission_title_en: 'Our Mission',
    mission_desc_ka: 'ჩვენი მიზანია ქართული ბიზნესების დახმარება ციფრულ სამყაროში წარმატების მიღწევაში. ჩვენ ვქმნით ინოვაციურ ციფრულ პროდუქტებს, რომლებიც ეხმარება კომპანიებს ძლიერი ონლაინ პრეზენსის შექმნასა და ბიზნესის ზრდაში.',
    mission_desc_en: 'Our mission is to empower Georgian businesses to achieve success in the digital world. We deliver innovative digital solutions that help companies build a strong online presence and drive measurable business growth.',
    vision_title_ka: 'ჩვენი ხედვა',
    vision_title_en: 'Our Vision',
    vision_desc_ka: 'ვიზიონი: ქართველი ბიზნესმენების ნდობის მოპოვება და მათი ციფრული ტრანსფორმაციის ლიდერი ქვეყნის მასშტაბით. ჩვენ გვსურს გავხდეთ თქვენი სანდო პარტნიორი ტექნოლოგიურ განვითარებაში.',
    vision_desc_en: 'To become Georgia\'s leading digital transformation partner, empowering businesses with cutting-edge technology and creating lasting partnerships built on trust and success.'
  };
  const SERVICES_LIST = [{
    icon: Globe,
    title_en: 'Web Design & Development',
    title_ka: 'ვებ დიზაინი და დეველოპმენტი',
    desc_en: 'Custom websites built for performance.',
    desc_ka: 'ინდივიდუალური ვებ-გვერდები.'
  }, {
    icon: Megaphone,
    title_en: 'Digital Marketing',
    title_ka: 'ციფრული მარკეტინგი',
    desc_en: 'Strategic campaigns that convert.',
    desc_ka: 'სტრატეგიული კამპანიები.'
  }, {
    icon: Palette,
    title_en: 'Branding & Logo Design',
    title_ka: 'ბრენდინგი და ლოგო',
    desc_en: 'Memorable brand identities.',
    desc_ka: 'დასამახსოვრებელი იდენტობა.'
  }, {
    icon: Search,
    title_en: 'SEO Optimization',
    title_ka: 'SEO ოპტიმიზაცია',
    desc_en: 'Rank higher on Google.',
    desc_ka: 'მაღალი პოზიციები Google-ში.'
  }, {
    icon: Share2,
    title_en: 'Social Media Management',
    title_ka: 'სოციალური მედია',
    desc_en: 'Engaging content strategies.',
    desc_ka: 'ჩართულობის ზრდა.'
  }, {
    icon: ShoppingCart,
    title_en: 'E-commerce Solutions',
    title_ka: 'ელ-კომერცია',
    desc_en: 'Online stores that sell.',
    desc_ka: 'ონლაინ მაღაზიები.'
  }, {
    icon: Layout,
    title_en: 'UI/UX Design',
    title_ka: 'UI/UX დიზაინი',
    desc_en: 'User-centric interfaces.',
    desc_ka: 'მომხმარებელზე მორგებული ინტერფეისი.'
  }, {
    icon: PenTool,
    title_en: 'Content Creation',
    title_ka: 'კონტენტის შექმნა',
    desc_en: 'Compelling storytelling.',
    desc_ka: 'მიმზიდველი სთორითელინგი.'
  }];
  const VALUES_LIST = [{
    icon: Lightbulb,
    title_en: 'Innovation',
    title_ka: 'ინოვაცია',
    desc_en: 'Pushing boundaries with new tech.',
    desc_ka: 'მუდმივი სიახლეების ძიება.'
  }, {
    icon: CheckCircle2,
    title_en: 'Quality',
    title_ka: 'ხარისხი',
    desc_en: 'Excellence in every pixel.',
    desc_ka: 'სრულყოფილება ყველა დეტალში.'
  }, {
    icon: Heart,
    title_en: 'Client Focus',
    title_ka: 'კლიენტზე ორიენტაცია',
    desc_en: 'Your success is our priority.',
    desc_ka: 'თქვენი წარმატება ჩვენი პრიორიტეტია.'
  }, {
    icon: ShieldCheck,
    title_en: 'Integrity',
    title_ka: 'სამართლიანობა',
    desc_en: 'Honest and transparent work.',
    desc_ka: 'გამჭვირვალე და პატიოსანი მუშაობა.'
  }, {
    icon: Users,
    title_en: 'Teamwork',
    title_ka: 'თანამშრომლობა',
    desc_en: 'Together we achieve more.',
    desc_ka: 'ერთად მეტს ვაღწევთ.'
  }];
  const STATS_LIST = [{
    id: 1,
    number: '13+',
    label_ka: 'წელი გამოცდილება',
    label_en: 'Years of Experience',
    icon: CalendarDays,
    color: 'from-blue-400 to-cyan-400'
  }, {
    id: 2,
    number: '250+',
    label_ka: 'წარმატებული პროექტი',
    label_en: 'Successful Projects',
    icon: Briefcase,
    color: 'from-purple-400 to-pink-400'
  }, {
    id: 3,
    number: '130+',
    label_ka: 'კმაყოფილი კლიენტი',
    label_en: 'Satisfied Clients',
    icon: Users,
    color: 'from-amber-400 to-orange-400'
  }];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('about_us_settings').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (data) setDbData(data);
      } catch (err) {
        console.error("Error fetching about us data:", err);
      }
    };
    fetchData();
  }, []);

  // Use DB data if available for main fields, otherwise fall back to SMARKETER_DATA
  // Priority: page_content (pc) > about_us_settings (dbData) > SMARKETER_DATA
  const getContent = (keyEn, keyKa) => {
    if (language === 'ka') {
      return pc[keyKa] || (dbData && dbData[keyKa]) || SMARKETER_DATA[keyKa];
    }
    return pc[keyEn] || (dbData && dbData[keyEn]) || SMARKETER_DATA[keyEn];
  };
  const heroImage = pc.hero_image || (dbData && dbData.hero_image) || SMARKETER_DATA.hero_image;

  // Merge services from page_content if available
  const servicesList = (pc.services_list && Array.isArray(pc.services_list) && pc.services_list.length > 0)
    ? pc.services_list.map((s, i) => ({
        icon: ICON_MAP[s.icon] || SERVICES_LIST[i]?.icon || Globe,
        title_en: s.title_en || SERVICES_LIST[i]?.title_en || '',
        title_ka: s.title_ka || SERVICES_LIST[i]?.title_ka || '',
        desc_en: s.desc_en || SERVICES_LIST[i]?.desc_en || '',
        desc_ka: s.desc_ka || SERVICES_LIST[i]?.desc_ka || '',
      }))
    : SERVICES_LIST;

  // Merge values from page_content if available
  const valuesList = (pc.values_list && Array.isArray(pc.values_list) && pc.values_list.length > 0)
    ? pc.values_list.map((v, i) => ({
        icon: ICON_MAP[v.icon] || VALUES_LIST[i]?.icon || Lightbulb,
        title_en: v.title_en || VALUES_LIST[i]?.title_en || '',
        title_ka: v.title_ka || VALUES_LIST[i]?.title_ka || '',
        desc_en: v.desc_en || VALUES_LIST[i]?.desc_en || '',
        desc_ka: v.desc_ka || VALUES_LIST[i]?.desc_ka || '',
      }))
    : VALUES_LIST;

  // Merge stats from page_content if available
  const statsList = (pc.stats_list && Array.isArray(pc.stats_list) && pc.stats_list.length > 0)
    ? pc.stats_list.map((s, i) => ({
        id: i + 1,
        number: s.number || STATS_LIST[i]?.number || '0',
        label_en: s.label_en || STATS_LIST[i]?.label_en || '',
        label_ka: s.label_ka || STATS_LIST[i]?.label_ka || '',
        icon: STATS_LIST[i]?.icon || CalendarDays,
        color: STATS_LIST[i]?.color || 'from-blue-400 to-cyan-400',
      }))
    : STATS_LIST;
  return <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO slug="/about" fallbackTitle={getContent('company_name_en', 'company_name_ka')} fallbackDescription={getContent('tagline_en', 'tagline_ka')} />
      <Header alwaysOpaque={true} />

      <main>
        {/* 1. FUTURISTIC HERO SECTION */}
        <section className={`relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden ${darkMode ? 'bg-[#050810]' : 'bg-[#F0F4FF]'}`}>
           {/* Animated Background Elements */}
           <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }} transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }} className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent blur-3xl" />
              <motion.div animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0]
          }} transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }} className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-teal-600/10 to-transparent blur-3xl" />
              
              {/* Grid Pattern Overlay */}
              <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] ${darkMode ? 'invert' : ''}`}></div>
           </div>

           <div className="container mx-auto px-4 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Column: Text Content */}
                <AnimatedSection>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {language === 'ka' ? 'შპს სმარკეტერი' : 'Smarketer LLC'}
                    </span>
                  </div>

                  <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'ჩვენ შესახებ' : 'About Us'}
                  </h1>
                  
                  <h2 className="text-xl md:text-2xl font-medium text-blue-500 mb-6 flex items-center gap-3">
                     <span className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"></span>
                     {getContent('tagline_en', 'tagline_ka')}
                  </h2>

                  <p className={`text-lg leading-relaxed mb-10 max-w-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getContent('about_desc_en', 'about_desc_ka')}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                      <Link to="/contact">
                        {language === 'ka' ? 'დაგვიკავშირდით' : 'Contact Us'} <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className={`rounded-xl px-8 py-6 text-lg border-2 hover:bg-transparent transition-all duration-300 ${darkMode ? 'border-white/10 text-white hover:border-white/30 bg-white/5' : 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white'}`}>
                      <Link to="/portfolio">
                        {language === 'ka' ? 'პორტფოლიო' : 'Portfolio'}
                      </Link>
                    </Button>
                  </div>
                </AnimatedSection>

                {/* Right Column: Image with minimal styling */}
                <AnimatedSection delay={0.2} className="relative z-10">
                  <div className={`relative rounded-3xl overflow-hidden border ${
                    darkMode 
                      ? 'border-white/10 shadow-2xl shadow-black/20' 
                      : 'border-gray-200 shadow-xl'
                  }`}>
                    <img 
                      src={heroImage} 
                      alt="Smarketer Team" 
                      loading="lazy"
                      className="w-full h-auto object-cover rounded-3xl" 
                    />
                  </div>
                </AnimatedSection>
              </div>
           </div>
        </section>

        {/* 2. ANIMATED STATISTICS SECTION */}
        <section className={`py-12 relative z-20 -mt-10 mb-20`}>
          <div className="container mx-auto px-4 lg:px-8">
            <AnimatedSection delay={0.1} className={`rounded-3xl shadow-2xl p-8 lg:p-12 backdrop-blur-md border transform transition-all hover:scale-[1.01] duration-500 ${darkMode ? 'bg-[#0D1126]/90 border-white/10' : 'bg-white/90 border-white/40'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                {statsList.map((stat, index) => <motion.div key={stat.id} initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                delay: index * 0.2
              }} className="flex flex-col items-center text-center p-4 group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} p-[1px] mb-4 transform group-hover:rotate-6 transition-transform duration-300`}>
                      <div className={`w-full h-full rounded-2xl flex items-center justify-center ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
                        <stat.icon className={`w-8 h-8 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                    
                    <h3 className={`text-4xl lg:text-5xl font-extrabold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      <AnimatedCounter value={stat.number} />
                    </h3>
                    
                    <p className={`text-sm md:text-base font-medium uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {language === 'ka' ? stat.label_ka : stat.label_en}
                    </p>
                  </motion.div>)}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* 3. MISSION & VISION */}
        <section className={`py-20 ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
           <div className="container mx-auto px-4 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8">
                 {/* Mission Card */}
                 <AnimatedSection delay={0.1} className={`p-10 rounded-3xl border transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${darkMode ? 'bg-[#0A0F1C] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Target className="w-32 h-32 text-[#5468E7]" />
                    </div>
                    <div className="relative z-10">
                       <div className="w-14 h-14 rounded-2xl bg-[#5468E7]/10 flex items-center justify-center text-[#5468E7] mb-6">
                          <Target className="w-7 h-7" />
                       </div>
                       <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getContent('mission_title_en', 'mission_title_ka')}
                       </h3>
                       <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getContent('mission_desc_en', 'mission_desc_ka')}
                       </p>
                    </div>
                 </AnimatedSection>

                 {/* Vision Card */}
                 <AnimatedSection delay={0.2} className={`p-10 rounded-3xl border transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${darkMode ? 'bg-[#0A0F1C] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Award className="w-32 h-32 text-[#3A4BCF]" />
                    </div>
                    <div className="relative z-10">
                       <div className="w-14 h-14 rounded-2xl bg-[#3A4BCF]/10 flex items-center justify-center text-[#3A4BCF] mb-6">
                          <Award className="w-7 h-7" />
                       </div>
                       <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getContent('vision_title_en', 'vision_title_ka')}
                       </h3>
                       <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getContent('vision_desc_en', 'vision_desc_ka')}
                       </p>
                    </div>
                 </AnimatedSection>
              </div>
           </div>
        </section>

        {/* 4. SERVICES GRID */}
        <section className="py-20 lg:py-28 container mx-auto px-4 lg:px-8">
           <AnimatedSection className="text-center mb-16">
              <span className="text-[#5468E7] font-bold tracking-wider uppercase text-sm mb-2 block">
                 {language === 'ka' ? 'რას ვაკეთებთ' : 'What We Do'}
              </span>
              <h2 className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                 {language === 'ka' ? 'ჩვენი სერვისები' : 'Our Services'}
              </h2>
           </AnimatedSection>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicesList.map((service, index) => (
                <AnimatedSection key={index} delay={index * 0.1} className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group ${darkMode ? 'bg-[#0D1126] border-white/10 hover:border-[#5468E7]/50' : 'bg-white border-gray-100 hover:border-[#5468E7]/50'}`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                       <service.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                       {language === 'ka' ? service.title_ka : service.title_en}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                       {language === 'ka' ? service.desc_ka : service.desc_en}
                    </p>
                 </AnimatedSection>
              ))}
           </div>
        </section>

        {/* 5. VALUES SECTION */}
        <section className={`py-20 relative overflow-hidden ${darkMode ? 'bg-[#0D1126]' : 'bg-[#0A0F1C]'}`}>
           {/* Abstract Background */}
           <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <div className="container mx-auto px-4 lg:px-8 relative z-10">
              <AnimatedSection className="text-center mb-16 text-white">
                 <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    {language === 'ka' ? 'ჩვენი ღირებულებები' : 'Our Core Values'}
                 </h2>
                 <p className="text-gray-400 max-w-2xl mx-auto">
                    {language === 'ka' ? 'პრინციპები, რომლებიც განსაზღვრავს ჩვენს მუშაობას და ურთიერთობებს.' : 'The principles that guide our work and relationships.'}
                 </p>
              </AnimatedSection>

              <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                 {valuesList.map((value, index) => (
                    <AnimatedSection key={index} delay={index * 0.1} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(20%-1.6rem)] p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center backdrop-blur-sm">
                       <div className="mx-auto w-12 h-12 rounded-full bg-[#5468E7]/20 flex items-center justify-center text-[#5468E7] mb-4">
                          <value.icon className="w-6 h-6" />
                       </div>
                       <h3 className="text-lg font-bold text-white mb-2">
                          {language === 'ka' ? value.title_ka : value.title_en}
                       </h3>
                       <p className="text-sm text-gray-400">
                          {language === 'ka' ? value.desc_ka : value.desc_en}
                       </p>
                    </AnimatedSection>
                 ))}
              </div>
           </div>
        </section>

        {/* 6. CALL TO ACTION */}
        <section className="py-20 lg:py-28 container mx-auto px-4 text-center">
           <AnimatedSection className={`max-w-4xl mx-auto rounded-3xl p-12 relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-[#1a2342] to-[#0D1126]' : 'bg-gradient-to-r from-[#F4F7FF] to-white'} border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="relative z-10">
                 <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'ka' ? 'მზად ხართ წარმატებისთვის?' : 'Ready for Success?'}
                 </h2>
                 <p className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {language === 'ka' ? 'დაგვიკავშირდით დღესვე და დავიწყოთ თქვენი ბიზნესის ციფრული ტრანსფორმაცია.' : 'Contact us today and let\'s start your business digital transformation.'}
                 </p>
                 <Button asChild size="lg" className="bg-[#5468E7] hover:bg-[#4353b8] text-white px-8 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <Link to="/contact">
                       {language === 'ka' ? 'დაგვიკავშირდით' : 'Contact Us'} <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                 </Button>
              </div>
           </AnimatedSection>
        </section>

      </main>

      <Footer />
    </div>;
};
export default AboutUsPage;
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, Building, Rocket, Puzzle, 
  Smartphone, Search, Zap, Shield, Settings, TrendingUp, Headphones, BadgeDollarSign,
  Target, Globe, Users, CheckCircle2, ArrowRight, Check, Sparkles
} from 'lucide-react';
import PortfolioCard from '@/components/PortfolioCard';

// --- Animated Counter Helper ---
const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  
  const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    if (inView) {
      let startTime;
      const startValue = 0;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = startValue + (numericValue - startValue) * easeOutQuart;
        setDisplayValue(Math.floor(current));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, numericValue, duration]);

  return <span ref={ref} className="tabular-nums">{displayValue}{suffix}</span>;
};

const WebDesignPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [industriesMap, setIndustriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // --- DATA CONSTANTS ---

  const SERVICES = [
    {
      id: 1,
      icon: Rocket,
      title_en: "Landing Page", 
      title_ka: "Landing Page და საიტის დამზადება",
      desc_en: "High-converting marketing pages optimized for conversions and sales growth.",
      desc_ka: "მაღალი კონვერსიის მქონე მარკეტინგული გვერდები და საიტების დამზადება, რომელიც ორიენტირებულია გაყიდვების ზრდაზე და მომხმარებლის მოზიდვაზე.",
      features_en: ["Fast loading speed", "SEO optimized structure", "Mobile responsive design", "Analytics ready"],
      features_ka: ["სწრაფი ჩატვირთვა", "SEO ოპტიმიზაცია", "მობილურზე მორგებული", "ანალიტიკის ინტეგრაცია"],
      gradient: "from-blue-600 to-purple-600",
      shadow: "shadow-blue-500/20"
    },
    {
      id: 2,
      icon: Building,
      title_en: "Corporate Website Development", 
      title_ka: "კორპორატიული ვებ-გვერდების დამზადება",
      desc_en: "Professional business presence with complete company information and service catalog.",
      desc_ka: "პროფესიონალური ბიზნეს საიტის დამზადება სრული ინფორმაციით, სერვისების კატალოგით და კომპანიის იმიჯის გაძლიერებით.",
      features_en: ["Company profile", "Services showcase", "Team profiles", "Contact forms"],
      features_ka: ["კომპანიის პროფილი", "სერვისების ჩვენება", "გუნდის გვერდი", "საკონტაქტო ფორმები"],
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20"
    },
    {
      id: 3,
      icon: ShoppingBag,
      title_en: "E-Commerce Development", 
      title_ka: "ონლაინ მაღაზიების და საიტების დამზადება",
      desc_en: "Complete online store solutions with secure payment integration and inventory management.",
      desc_ka: "სრული ელ-კომერციის პლატფორმა და საიტების დამზადება გადახდის სისტემებით, მარაგების მართვით და SEO ოპტიმიზაციით.",
      features_en: ["Product catalog", "Shopping cart & Checkout", "Payment gateway integration", "Inventory management"],
      features_ka: ["პროდუქტების კატალოგი", "კალათა და გადახდა", "ბარათით გადახდა", "მარაგების მართვა"],
      gradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/20"
    },
    {
      id: 4,
      icon: Puzzle,
      title_en: "Custom Web Solutions", 
      title_ka: "ინდივიდუალური საიტის დამზადება",
      desc_en: "Tailored web solutions designed for unique business needs with complex functionality.",
      desc_ka: "უნიკალური ბიზნეს საჭიროებებზე მორგებული ვებ-გვერდების დამზადება რთული ფუნქციონალით და სისტემური ინტეგრაციით.",
      features_en: ["Custom functionality", "API Integration", "Scalable architecture", "Dedicated support"],
      features_ka: ["რთული ფუნქციონალი", "API ინტეგრაცია", "მასშტაბური არქიტექტურა", "ტექნიკური მხარდაჭერა"],
      gradient: "from-pink-500 to-purple-600",
      shadow: "shadow-pink-500/20"
    }
  ];

  const BENEFITS = [
    { 
      icon: Smartphone, 
      title_en: "Responsive Design", 
      title_ka: "ადაპტიური საიტების დამზადება", 
      desc_en: "Websites that work perfectly on all devices - mobile, tablet, and desktop.", 
      desc_ka: "ვებ-გვერდების დამზადება, რომელიც იდეალურად მუშაობს ყველა მოწყობილობაზე - მობილურსა თუ კომპიუტერზე.", 
      color: "text-blue-500" 
    },
    { 
      icon: Search, 
      title_en: "SEO Optimization", 
      title_ka: "SEO ოპტიმიზაცია და ხილვადობა", 
      desc_en: "Built-in search engine optimization to help you rank higher on Google.", 
      desc_ka: "საძიებო სისტემებში ოპტიმიზაცია (SEO) საიტის დამზადების პროცესშივე, რაც უზრუნველყოფს Google-ის პირველ გვერდზე მოხვედრას.", 
      color: "text-purple-500" 
    },
    { 
      icon: Zap, 
      title_en: "Fast Performance", 
      title_ka: "სწრაფი მუშაობა და ჩატვირთვა", 
      desc_en: "Lightning-fast loading speeds for better user experience and SEO.", 
      desc_ka: "საიტის სწრაფი ჩატვირთვა, რაც კრიტიკულია მომხმარებლის კმაყოფილებისა და SEO რეიტინგისთვის.", 
      color: "text-yellow-500" 
    },
    { 
      icon: Shield, 
      title_en: "Secure & Reliable", 
      title_ka: "დაცული და საიმედო ვებ-გვერდები", 
      desc_en: "Enterprise-grade security features to protect your data and users.", 
      desc_ka: "უმაღლესი დონის უსაფრთხოება და დაცვა კიბერ შეტევებისგან.", 
      color: "text-green-500" 
    },
    { 
      icon: Settings, 
      title_en: "Easy Management", 
      title_ka: "მარტივი მართვის პანელი", 
      desc_en: "User-friendly content management system (CMS) for easy updates.", 
      desc_ka: "საიტის დამზადება მარტივი სამართავი პანელით, რათა დამოუკიდებლად შეძლოთ კონტენტის განახლება.", 
      color: "text-gray-500" 
    },
    { 
      icon: TrendingUp, 
      title_en: "Scalable Solutions", 
      title_ka: "მასშტაბური ბიზნეს გადაწყვეტა", 
      desc_en: "Solutions that grow with your business needs.", 
      desc_ka: "საიტები, რომლებიც იზრდება თქვენს ბიზნესთან ერთად და უძლებს მაღალ დატვირთვას.", 
      color: "text-indigo-500" 
    },
    { 
      icon: Headphones, 
      title_en: "24/7 Support", 
      title_ka: "ტექნიკური მხარდაჭერა", 
      desc_en: "Dedicated customer support whenever you need assistance.", 
      desc_ka: "მუდმივი ტექნიკური მხარდაჭერა და კონსულტაცია საიტის გამართულ მუშაობაზე.", 
      color: "text-pink-500" 
    },
    { 
      icon: BadgeDollarSign, 
      title_en: "Cost Effective", 
      title_ka: "ბიუჯეტური და ეფექტური", 
      desc_en: "Affordable pricing with great value for your investment.", 
      desc_ka: "ხელმისაწვდომი ფასები საიტის დამზადებაზე მაღალი ხარისხის შენარჩუნებით.", 
      color: "text-teal-500" 
    }
  ];

  const STATS = [
    { value: "16", suffix: "+", label_en: "Years Experience", label_ka: "წელი გამოცდილება", icon: Target, color: "from-blue-400 to-blue-600" },
    { value: "150", suffix: "+", label_en: "Websites Created", label_ka: "შექმნილი საიტი", icon: Globe, color: "from-purple-400 to-purple-600" },
    { value: "100", suffix: "+", label_en: "Satisfied Clients", label_ka: "კმაყოფილი კლიენტი", icon: Users, color: "from-green-400 to-green-600" },
    { value: "98", suffix: "%", label_en: "Satisfaction Rate", label_ka: "კმაყოფილების დონე", icon: CheckCircle2, color: "from-orange-400 to-orange-600" }
  ];

  useEffect(() => {
    const fetchWebProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch industries map
        const { data: industriesData } = await supabase.from('industries_settings').select('industries').limit(1).maybeSingle();
        if (industriesData && industriesData.industries) {
            const map = {};
            industriesData.industries.forEach(ind => { map[ind.id] = ind; });
            setIndustriesMap(map);
        }

        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('visible', true)
          .or('project_type.eq.web,category_en.ilike.%web%,category_ka.ilike.%ვებ%')
          .order('order_index', { ascending: true })
          .limit(6);

        if (error) throw error;
        if (data) setProjects(data);
      } catch (error) {
        console.error('Error fetching web projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebProjects();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <SEO 
        slug="/web-design" 
        title={language === 'ka' ? "საიტის დამზადება საქართველოში | ვებ-გვერდების პროფესიონალური შექმნა" : "Website Development in Georgia | Professional Web Design"}
        description={language === 'ka' ? "საიტის დამზადება ბიზნესისთვის საქართველოში — თანამედროვე, სწრაფი და SEO ოპტიმიზირებული ვებ-გვერდები. მორგებული ყველა მოწყობილობაზე." : "Professional website development for businesses in Georgia. Modern, fast, and SEO optimized websites tailored for all devices."}
      />
      <Header />
      
      {/* 1. HERO SECTION (Replaced WebsiteServices for SEO control) */}
      <section className={`pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${darkMode ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
               <Sparkles className="w-4 h-4" />
               <span className="text-sm font-bold uppercase tracking-wider">
                 {language === 'ka' ? 'ვებ-გვერდების დამზადება' : 'Professional Web Design'}
               </span>
            </div>

            <h1 className={`text-4xl lg:text-6xl font-black mb-6 leading-tight max-w-5xl mx-auto ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
               {language === 'ka' ? 'საიტის დამზადება ბიზნესისთვის საქართველოში' : 'Website Development for Business in Georgia'}
            </h1>

            <p className={`text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
               {language === 'ka' 
                 ? "ჩვენ გთავაზობთ პროფესიონალურ ვებ-გვერდების დამზადებას და SEO ოპტიმიზაციას. გაზარდეთ გაყიდვები თანამედროვე, სწრაფი და მობილურზე მორგებული საიტების დამზადებით, რომელიც სრულად პასუხობს საძიებო სისტემებში ოპტიმიზაციის სტანდარტებს."
                 : "We offer professional website development and SEO optimization services. Increase sales with modern, fast, and mobile-responsive websites that fully meet search engine optimization standards."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button 
                 onClick={() => navigate('/contact')}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
               >
                 {language === 'ka' ? 'უფასო კონსულტაცია' : 'Free Consultation'}
               </Button>
               <Button 
                 variant="outline"
                 onClick={() => navigate('/portfolio')}
                 className={`px-8 py-6 rounded-xl font-bold text-lg border-2 transition-all hover:scale-105 ${darkMode ? 'border-gray-700 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
               >
                 {language === 'ka' ? 'ნახეთ პორტფოლიო' : 'View Portfolio'}
               </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SERVICES SECTION (SEO Optimized Titles) */}
      <section className={`py-20 lg:py-28 relative z-10 ${darkMode ? 'bg-[#0D1126]' : 'bg-gray-50/50'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}
               >
                 {language === 'ka' ? 'ვებ-გვერდების დამზადება - ჩვენი სერვისები' : 'Web Development Services'}
               </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
               {SERVICES.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative p-1 rounded-[2.5rem] bg-gradient-to-br ${service.gradient} transition-transform duration-500 hover:-translate-y-2 hover:scale-[1.02]`}
                  >
                     <div className={`h-full p-8 lg:p-10 rounded-[2.3rem] flex flex-col items-start overflow-hidden relative ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
                        {/* Background Glow */}
                        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-20 blur-[60px] rounded-full group-hover:opacity-40 transition-opacity duration-500`} />
                        
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${service.gradient} text-white shadow-lg shadow-current group-hover:scale-110 transition-transform duration-500`}>
                           <service.icon className="w-8 h-8" />
                        </div>
                        
                        {/* Content */}
                        <h3 className={`text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r ${service.gradient}`}>
                           {language === 'ka' ? service.title_ka : service.title_en}
                        </h3>
                        
                        <p className={`text-base mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                           {language === 'ka' ? service.desc_ka : service.desc_en}
                        </p>
                        
                        {/* Features List */}
                        <ul className="space-y-3 mt-auto w-full">
                           {(language === 'ka' ? service.features_ka : service.features_en).map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-3 text-sm font-medium">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r ${service.gradient} opacity-80`}>
                                     <Check className="w-3.5 h-3.5 text-white" />
                                 </div>
                                 <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feat}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 3. BENEFITS SECTION (SEO Optimized) */}
      <section className={`py-24 relative overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F8FAFC]'}`}>
         {/* Abstract background shapes */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
         </div>

         <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center mb-16">
               <motion.h2 
                 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                 className={`text-3xl lg:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}
               >
                  {language === 'ka' ? 'SEO ოპტიმიზირებული საიტების შექმნა - უპირატესობები' : 'Why Choose Our SEO Optimized Web Design'}
               </motion.h2>
               <motion.div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
               {BENEFITS.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl ${
                       darkMode 
                         ? 'bg-[#0D1126]/50 border-white/5 hover:bg-[#0D1126] hover:border-purple-500/30' 
                         : 'bg-white border-white hover:border-purple-200 shadow-sm'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gray-50 dark:bg-white/5 group-hover:scale-110 transition-transform duration-300`}>
                        <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                     </div>
                     <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {language === 'ka' ? benefit.title_ka : benefit.title_en}
                     </h3>
                     <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'ka' ? benefit.desc_ka : benefit.desc_en}
                     </p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. EXPERIENCE SECTION (SEO Enhanced Text) */}
      <section className={`py-24 relative overflow-hidden ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
         <div className="container mx-auto px-4 lg:px-8">
             <div className="flex flex-col lg:flex-row gap-16 items-center">
                 {/* Text Content */}
                 <div className="lg:w-1/2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                        className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs uppercase tracking-widest"
                    >
                        {language === 'ka' ? 'გამოცდილება' : 'Experience'}
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className={`text-4xl lg:text-6xl font-black mb-6 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}
                    >
                        {language === 'ka' ? 'საიტის დამზადება 16 წლიანი გამოცდილებით' : 'Web Development with 16 Years of Experience'}
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        {language === 'ka' 
                        ? "ჩვენ გვაქვს 16 წელზე მეტი გამოცდილება საიტების დამზადების და ციფრული მარკეტინგის სფეროში. ჩვენი პორტფოლიო მოიცავს 150-ზე მეტ წარმატებულ პროექტს - როგორც კორპორატიულ, ისე რთულ ვებ-სისტემებს. ჩვენი გუნდი გთავაზობთ სრულ სერვისს: ვებ-გვერდების დამზადება, SEO ოპტიმიზაცია და ტექნიკური მხარდაჭერა თქვენი ბიზნესის წარმატებისთვის."
                        : "We have over 16 years of experience in web design and digital marketing. Our portfolio includes 150+ successful projects ranging from corporate sites to complex web systems. Our team offers full-service solutions: website development, SEO optimization, and technical support for your business success."}
                    </motion.p>
                 </div>

                 {/* Modern Stats Grid */}
                 <div className="lg:w-1/2 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        {STATS.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, type: "spring", bounce: 0.4 }}
                                className={`relative overflow-hidden p-6 lg:p-8 rounded-3xl ${darkMode ? 'bg-[#0A0F1C] border border-white/5' : 'bg-gray-50 border border-white shadow-lg'}`}
                            >
                                {/* Gradient Background Accent */}
                                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-xl`} />
                                
                                <stat.icon className={`w-8 h-8 mb-4 relative z-10 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                                
                                <div className={`text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                </div>
                                
                                <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {language === 'ka' ? stat.label_ka : stat.label_en}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                 </div>
             </div>
         </div>
      </section>

      {/* 5. PORTFOLIO SECTION (Title Update) */}
      <section className={`py-24 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F8FAFC]'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    className={`text-3xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}
                  >
                     {language === 'ka' ? 'ბიზნეს საიტის დამზადება - პორტფოლიო' : 'Our Web Design Portfolio'}
                  </motion.h2>
                  <motion.div 
                    initial={{ width: 0 }} whileInView={{ width: 100 }} viewport={{ once: true }}
                    className="h-1 bg-blue-600 rounded-full" 
                  />
               </div>
               <Button onClick={() => navigate('/portfolio')} variant="outline" className={`${darkMode ? 'text-blue-500 border-blue-500/50' : 'text-blue-600 border-blue-200'}`}>
                  {language === 'ka' ? 'ყველა ნამუშევარი' : 'View All Projects'} <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {projects.map((project, index) => (
                  <PortfolioCard 
                    key={project.id} 
                    project={project} 
                    industriesMap={industriesMap} 
                    language={language} 
                    darkMode={darkMode}
                    index={index} 
                  />
               ))}
            </div>
         </div>
      </section>

      {/* 6. CALL TO ACTION SECTION (SEO Enhanced Text) */}
      <section className="py-24">
         <div className="container mx-auto px-4 lg:px-8">
            <div className="relative rounded-[3rem] p-10 lg:p-24 overflow-hidden text-center bg-gradient-to-tr from-[#5468E7] via-[#8A2387] to-[#E94057] shadow-2xl">
               {/* Animated Background Shapes */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-yellow-400/20 blur-[120px] rounded-full" 
                  />
               </div>
               
               <div className="relative z-10">
                  <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    className="text-3xl lg:text-7xl font-black text-white mb-8 leading-tight drop-shadow-sm"
                  >
                     {language === 'ka' ? 'გსურთ პროფესიონალური საიტის დამზადება?' : 'Ready to Create Your Website?'}
                  </motion.h2>
                  
                  <p className="text-white/90 text-lg lg:text-2xl max-w-3xl mx-auto mb-12 font-medium">
                     {language === 'ka' 
                       ? 'დაგვიკავშირდით დღესვე და მიიღეთ უფასო კონსულტაცია ვებ-გვერდების დამზადებასა და SEO ოპტიმიზაციაზე.' 
                       : 'Contact us today and get a free consultation for your next big project.'}
                  </p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row justify-center gap-6"
                  >
                     <Button className="bg-white text-purple-600 hover:bg-gray-50 px-12 py-8 rounded-full text-xl font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                        <a href="#contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>
                           {language === 'ka' ? 'დაგვიკავშირდით' : 'Contact Us'}
                        </a>
                     </Button>
                     <Button variant="outline" className="border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 px-12 py-8 rounded-full text-xl font-bold transition-all hover:scale-105">
                        <a href="#portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>
                           {language === 'ka' ? 'ნახეთ პორტფოლიო' : 'View Portfolio'}
                        </a>
                     </Button>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default WebDesignPage;
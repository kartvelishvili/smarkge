import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, CheckCircle2, Building2, Home, Key, LineChart, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import PortfolioCard from '@/components/PortfolioCard';
import { Link } from 'react-router-dom';
import { usePageContent } from '@/hooks/usePageContent';

const IndustryRealEstatePage = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [industriesMap, setIndustriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const TARGET_INDUSTRY_NAME = "Real Estate";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data: industriesData } = await supabase.from('industries_settings').select('industries').single();

        let targetIds = [TARGET_INDUSTRY_NAME];
        const map = {};

        if (industriesData && industriesData.industries) {
            industriesData.industries.forEach(ind => { map[ind.id] = ind; });
            setIndustriesMap(map);
            const matchedIndustry = industriesData.industries.find(
                ind => ind.name_en === TARGET_INDUSTRY_NAME || ind.title_en === TARGET_INDUSTRY_NAME
            );
            if (matchedIndustry) targetIds.push(matchedIndustry.id);
            targetIds.push('real_estate', 'real-estate', 'Real Estate');
        }

        const { data: allProjects } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('visible', true)
          .order('order_index', { ascending: true });

        const filteredProjects = (allProjects || []).filter(project => {
            let pIds = project.industry_ids || project['Associated Industries'];
            if (!pIds) return false;
            if (typeof pIds === 'string') {
                try { pIds = JSON.parse(pIds); } catch(e) { pIds = [pIds]; }
            }
            if (!Array.isArray(pIds)) return false;
            return pIds.some(id => targetIds.includes(id));
        });

        setProjects(filteredProjects);
      } catch (err) {
        console.error('Error fetching real estate projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const { content: pc } = usePageContent('industry_real_estate', {});

  const buildContent = (lang) => {
    const prefix = lang;
    return {
      title: pc[`${prefix}_title`],
      subtitle: pc[`${prefix}_subtitle`],
      description: pc[`${prefix}_description`],
      stats: pc[`${prefix}_stats`],
      services: pc[`${prefix}_services`] ? (typeof pc[`${prefix}_services`] === 'string' ? pc[`${prefix}_services`].split('\n').filter(Boolean) : pc[`${prefix}_services`]) : undefined,
      projectsTitle: pc[`${prefix}_projectsTitle`],
      projectsDesc: pc[`${prefix}_projectsDesc`],
      cta: pc[`${prefix}_cta`],
      ctaBtn: pc[`${prefix}_ctaBtn`],
      whyTitle: pc[`${prefix}_whyTitle`],
      keyServicesTitle: pc[`${prefix}_keyServicesTitle`],
      features: pc[`${prefix}_features`],
    };
  };

  const defaults = {
    en: {
      title: "Real Estate Digital Growth",
      subtitle: "Showcase properties, generate leads, and close deals with high-performance digital tools.",
      description: "In real estate, visual appeal and speed are everything. We build stunning property portals, virtual tour experiences, and automated lead generation systems that help agencies and developers sell faster.",
      stats: [
        { value: "3x", label: "Lead Generation" },
        { value: "-40%", label: "Admin Time" },
        { value: "24/7", label: "Virtual Open House" }
      ],
      services: [
        "Property Listing Websites",
        "Virtual 360° Tours",
        "Agent & Broker Portals",
        "Real Estate CRM Systems",
        "Lead Capture Funnels",
        "Interactive Maps Integration"
      ],
      projectsTitle: "Real Estate Success Cases",
      projectsDesc: "See how we help real estate agencies grow.",
      cta: "Want to sell properties faster?",
      ctaBtn: "Start Your Project",
      whyTitle: "Revolutionizing Property Sales",
      keyServicesTitle: "Key Services",
      features: [
        { label: "Smart Listings" },
        { label: "CRM Integration" },
        { label: "Analytics Dashboard" }
      ]
    },
    ka: {
      title: "უძრავი ქონების ციფრული ზრდა",
      subtitle: "წარადგინეთ ქონება, მოიზიდეთ ლიდები და დახურეთ გარიგებები მაღალეფექტური ციფრული ინსტრუმენტებით.",
      description: "უძრავ ქონებაში ვიზუალური მხარე და სისწრაფე გადამწყვეტია. ჩვენ ვქმნით შთამბეჭდავ პორტალებს, ვირტუალურ ტურებს და ავტომატიზებულ სისტემებს, რაც სააგენტოებს ეხმარება სწრაფ გაყიდვებში.",
      stats: [
        { value: "3x", label: "ლიდების გენერაცია" },
        { value: "-40%", label: "ადმინ. დრო" },
        { value: "24/7", label: "ვირტუალური ტური" }
      ],
      services: [
        "უძრავი ქონების ვებგვერდები",
        "ვირტუალური 360° ტურები",
        "აგენტის პორტალები",
        "უძრავი ქონების CRM სისტემები",
        "ლიდების მოზიდვის ძაბრები",
        "ინტერაქტიული რუკები"
      ],
      projectsTitle: "წარმატებული პროექტები უძრავ ქონებაში",
      projectsDesc: "ნახეთ როგორ ვეხმარებით უძრავი ქონების სააგენტოებს ზრდაში.",
      cta: "გსურთ გაყიდოთ უძრავი ქონება უფრო სწრაფად?",
      ctaBtn: "დაიწყეთ პროექტი",
      whyTitle: "უძრავი ქონების გაყიდვების რევოლუცია",
      keyServicesTitle: "ძირითადი სერვისები",
      features: [
        { label: "ჭკვიანი განცხადებები" },
        { label: "CRM ინტეგრაცია" },
        { label: "ანალიტიკური დაფა" }
      ]
    }
  };

  // Merge DB content over defaults
  const mergedContent = {};
  for (const lang of ['en', 'ka']) {
    const dbLang = buildContent(lang);
    mergedContent[lang] = { ...defaults[lang] };
    for (const [k, v] of Object.entries(dbLang)) {
      if (v !== undefined && v !== null && v !== '') mergedContent[lang][k] = v;
    }
  }
  const content = mergedContent;
  const heroImage = pc.hero_image || "https://i.postimg.cc/d3dYsT21/real-estate.webp";

  const t = language === 'ka' ? content.ka : content.en;
  const icons = [Home, Key, LineChart];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0F1C] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Helmet>
        <title>{t.title} | Smarketer</title>
      </Helmet>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               animate={{ scale: [1, 1.2, 1], y: [0, 30, 0] }}
               transition={{ duration: 18, repeat: Infinity }}
               className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-green-600' : 'bg-green-400'}`}
             />
             <motion.div 
               animate={{ scale: [1, 1.1, 1], x: [0, 40, 0] }}
               transition={{ duration: 12, repeat: Infinity }}
               className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${darkMode ? 'bg-emerald-600' : 'bg-emerald-400'}`}
             />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-1/2 z-10"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${darkMode ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-100 text-green-600'}`}>
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Real Estate Tech</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.title}
                </h1>
                
                <p className={`text-lg lg:text-xl mb-10 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.subtitle}
                </p>
                
                <Link to="/contact">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1">
                    {t.ctaBtn}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:w-1/2 relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" alt="Modern skyscrapers and city architecture real estate" src={heroImage} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                </div>
                
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute -bottom-8 -right-8 p-6 rounded-2xl shadow-xl backdrop-blur-md border hidden md:block ${darkMode ? 'bg-[#0A0F1C]/90 border-white/10' : 'bg-white/90 border-gray-100'}`}
                >
                   <div className="flex items-center gap-4">
                      <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400">
                         <Home className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-xs uppercase text-gray-500 font-bold mb-1">Properties Sold</p>
                         <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,240+</p>
                      </div>
                   </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-12 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${darkMode ? 'bg-green-900/20 border-y border-green-500/10' : 'bg-green-600'}`} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {t.stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl ${darkMode ? 'bg-green-950/30 border border-green-500/20' : 'bg-white/10 backdrop-blur-sm border border-white/20'}`}
                >
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-white'}`}>{stat.value}</div>
                  <div className={`text-sm lg:text-base uppercase tracking-wider font-medium ${darkMode ? 'text-green-200' : 'text-green-100'}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Overview & Services */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/2">
                <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.whyTitle}</h2>
                <p className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.features.map((item, idx) => {
                    const Icon = icons[idx] || Home;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:border-green-500/30' : 'bg-green-50/50 border-green-100 hover:border-green-200'}`}>
                          <Icon className="w-6 h-6 text-green-500" />
                          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-[#151932] border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-green-900/5'}`}>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-500 rounded-full" />
                    {t.keyServicesTitle}
                  </h3>
                  <div className="space-y-6">
                    {t.services.map((service, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 group"
                      >
                        <div className={`mt-1 p-1 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-lg transition-colors ${darkMode ? 'text-gray-300 group-hover:text-green-300' : 'text-gray-700 group-hover:text-green-700'}`}>{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

         {/* Portfolio Projects Section */}
        <section className={`py-20 ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
            <div className="container mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 text-green-500 font-bold text-xs uppercase tracking-widest">
                  {language === 'ka' ? 'პორტფოლიო' : 'Portfolio'}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.projectsTitle}</h2>
                <p className="text-lg opacity-60 max-w-2xl mx-auto">{t.projectsDesc}</p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                </div>
              ) : projects.length > 0 ? (
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
              ) : (
                <div className="text-center py-20 opacity-60">
                  <p>{language === 'ka' ? 'ამ კატეგორიაში პროექტები არ მოიძებნა' : 'No projects found in this category'}</p>
                </div>
              )}
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`rounded-3xl p-12 text-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-green-900 to-teal-900 border border-green-700/30' : 'bg-gradient-to-br from-green-600 to-teal-600 shadow-2xl shadow-green-500/30'}`}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
              <div className="relative z-10">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 max-w-2xl mx-auto leading-tight">
                  {t.cta}
                </h2>
                <Link to="/contact">
                  <button className="bg-white text-green-600 hover:bg-gray-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                    {t.ctaBtn}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default IndustryRealEstatePage;
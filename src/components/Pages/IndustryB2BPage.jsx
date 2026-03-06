import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, CheckCircle2, Briefcase, BarChart, Shield, Users, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import PortfolioCard from '@/components/PortfolioCard';
import { Link } from 'react-router-dom';
import { usePageContent } from '@/hooks/usePageContent';

const IndustryB2BPage = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [industriesMap, setIndustriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const TARGET_INDUSTRY_NAME = "B2B Services";

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
            targetIds.push('b2b', 'b2b_services', 'B2B Services');
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
        console.error('Error fetching B2B projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const { content: pc } = usePageContent('industry_b2b', {});

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
      title: "B2B & Corporate Services",
      subtitle: "Professional digital solutions that build authority and generate high-value leads.",
      description: "In the B2B world, trust and expertise are currency. We build sophisticated corporate websites, client portals, and automated marketing funnels that position your brand as an industry leader.",
      stats: [
        { value: "High", label: "Conversion Rate" },
        { value: "Premium", label: "Trust Score" },
        { value: "100%", label: "Brand Consistency" }
      ],
      services: [
        "Corporate Website Development",
        "Lead Generation Funnels",
        "Client Portals & Intranets",
        "B2B E-commerce Solutions",
        "CRM & ERP Integration",
        "Data Analytics Dashboards"
      ],
      projectsTitle: "B2B Success Stories",
      projectsDesc: "See our latest B2B projects.",
      cta: "Ready to scale your B2B business?",
      ctaBtn: "Get a Strategy Session",
      whyTitle: "Professional Excellence",
      keyServicesTitle: "Key Services",
      features: [
        { label: "Enterprise Security" },
        { label: "Data Driven" },
        { label: "Client Focused" }
      ]
    },
    ka: {
      title: "B2B და კორპორატიული სერვისები",
      subtitle: "პროფესიონალური ციფრული გადაწყვეტილებები, რომლებიც ზრდის ავტორიტეტს და ლიდებს.",
      description: "B2B სამყაროში ნდობა და გამოცდილება მთავარია. ჩვენ ვქმნით დახვეწილ კორპორატიულ ვებგვერდებს, კლიენტის პორტალებს და ავტომატიზებულ მარკეტინგულ ძაბრებს.",
      stats: [
        { value: "მაღალი", label: "კონვერსია" },
        { value: "პრემიუმ", label: "ნდობის რეიტინგი" },
        { value: "100%", label: "ბრენდის მდგრადობა" }
      ],
      services: [
        "კორპორატიული ვებგვერდების შექმნა",
        "ლიდების მოზიდვის ძაბრები",
        "კლიენტის პორტალები და ინტრანეტები",
        "B2B ელ-კომერციის გადაწყვეტილებები",
        "CRM და ERP ინტეგრაცია",
        "მონაცემთა ანალიტიკური დაფები"
      ],
      projectsTitle: "B2B პროექტები",
      projectsDesc: "გაეცანით ჩვენს B2B პროექტებს.",
      cta: "მზად ხართ გაზარდოთ თქვენი B2B ბიზნესი?",
      ctaBtn: "მიიღეთ სტრატეგიული სესია",
      whyTitle: "პროფესიონალური სრულყოფილება",
      keyServicesTitle: "ძირითადი სერვისები",
      features: [
        { label: "კორპორატიული უსაფრთხოება" },
        { label: "მონაცემებზე დაფუძნებული" },
        { label: "კლიენტზე ორიენტირებული" }
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
  const heroImage = pc.hero_image || "https://i.postimg.cc/D0sTvbrf/b2b.webp";

  const t = language === 'ka' ? content.ka : content.en;
  const icons = [Shield, BarChart, Users];

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
               animate={{ scale: [1, 1.3, 1], rotate: [0, 60, 0] }}
               transition={{ duration: 30, repeat: Infinity }}
               className={`absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-400'}`}
             />
             <motion.div 
               animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
               transition={{ duration: 20, repeat: Infinity }}
               className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'}`}
             />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-1/2 z-10"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Corporate Solutions</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.title}
                </h1>
                
                <p className={`text-lg lg:text-xl mb-10 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.subtitle}
                </p>
                
                <Link to="/contact">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1">
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
                  <img className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" alt="Business people shaking hands in modern corporate office" src={heroImage} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-transparent" />
                </div>
                
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute -bottom-6 -left-6 p-5 rounded-2xl shadow-xl backdrop-blur-md border hidden md:block ${darkMode ? 'bg-[#0A0F1C]/90 border-white/10' : 'bg-white/90 border-gray-100'}`}
                >
                   <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
                         <Shield className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-xs uppercase text-gray-500 font-bold mb-1">Trust Rating</p>
                         <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AAA+</p>
                      </div>
                   </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-12 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${darkMode ? 'bg-indigo-900/20 border-y border-indigo-500/10' : 'bg-indigo-600'}`} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {t.stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl ${darkMode ? 'bg-indigo-950/30 border border-indigo-500/20' : 'bg-white/10 backdrop-blur-sm border border-white/20'}`}
                >
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 ${darkMode ? 'text-indigo-400' : 'text-white'}`}>{stat.value}</div>
                  <div className={`text-sm lg:text-base uppercase tracking-wider font-medium ${darkMode ? 'text-indigo-200' : 'text-indigo-100'}`}>{stat.label}</div>
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
                    const Icon = icons[idx] || Shield;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200'}`}>
                          <Icon className="w-6 h-6 text-indigo-500" />
                          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-[#151932] border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-indigo-900/5'}`}>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-indigo-500 rounded-full" />
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
                        <div className={`mt-1 p-1 rounded-full ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-lg transition-colors ${darkMode ? 'text-gray-300 group-hover:text-indigo-300' : 'text-gray-700 group-hover:text-indigo-700'}`}>{service}</span>
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
                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs uppercase tracking-widest">
                  {language === 'ka' ? 'პორტფოლიო' : 'Portfolio'}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.projectsTitle}</h2>
                <p className="text-lg opacity-60 max-w-2xl mx-auto">{t.projectsDesc}</p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
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
            <div className={`rounded-3xl p-12 text-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-indigo-900 to-blue-900 border border-indigo-700/30' : 'bg-gradient-to-br from-indigo-600 to-blue-600 shadow-2xl shadow-indigo-500/30'}`}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
              <div className="relative z-10">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 max-w-2xl mx-auto leading-tight">
                  {t.cta}
                </h2>
                <Link to="/contact">
                  <button className="bg-white text-indigo-600 hover:bg-gray-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
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

export default IndustryB2BPage;
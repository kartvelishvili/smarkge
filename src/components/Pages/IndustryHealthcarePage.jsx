import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, CheckCircle2, HeartPulse, Activity, ShieldCheck, Users, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import PortfolioCard from '@/components/PortfolioCard';
import { Link } from 'react-router-dom';
import { usePageContent } from '@/hooks/usePageContent';

const IndustryHealthcarePage = () => {
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [industriesMap, setIndustriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Target Industry Name as per Admin Panel
  const TARGET_INDUSTRY_NAME = "Healthcare";

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
            targetIds.push('healthcare', 'Healthcare');
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
                if (pIds.startsWith('[')) {
                    try { pIds = JSON.parse(pIds); } catch(e) { pIds = [pIds]; }
                } else {
                    pIds = [pIds];
                }
            }
            if (!Array.isArray(pIds)) return false;
            return pIds.some(id => targetIds.includes(id));
        });

        setProjects(filteredProjects);
      } catch (err) {
        console.error('[Industry] Error fetching healthcare projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const { content: pc } = usePageContent('industry_healthcare', {});

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
      title: "Digital Solutions for Healthcare",
      subtitle: "Transforming patient care with secure, efficient, and user-friendly digital technologies.",
      description: "In the rapidly evolving healthcare sector, digital presence is more than just a website. It's about building trust, ensuring accessibility, and streamlining patient interactions. We create HIPAA-compliant, accessible, and intuitive digital solutions for clinics, hospitals, and wellness centers.",
      stats: [
        { value: "45%", label: "Efficiency Increase" },
        { value: "2x", label: "Patient Engagement" },
        { value: "100%", label: "Data Security" }
      ],
      services: [
        "Telemedicine Platform Development",
        "Patient Portal & Appointment Systems",
        "Medical CRM Integration",
        "Healthcare SEO & Local Visibility",
        "ADA Compliant Web Design",
        "Secure Data Management"
      ],
      projectsTitle: "Healthcare Success Stories",
      projectsDesc: "Explore our successful projects in the healthcare industry.",
      cta: "Ready to modernize your medical practice?",
      ctaBtn: "Get a Consultation",
      whyTitle: "Why Smarketer for Healthcare?",
      keyServicesTitle: "Key Services",
      features: [
        { label: "Workflow Automation" },
        { label: "HIPAA Compliance" },
        { label: "Patient Experience" }
      ]
    },
    ka: {
      title: "ციფრული გადაწყვეტილებები ჯანდაცვისთვის",
      subtitle: "პაციენტის მოვლის ტრანსფორმაცია უსაფრთხო, ეფექტური და მომხმარებელზე მორგებული ტექნოლოგიებით.",
      description: "ჯანდაცვის სფეროში ციფრული ყოფნა უფრო მეტია, ვიდრე უბრალოდ ვებგვერდი. ეს არის ნდობის მოპოვება, ხელმისაწვდომობის უზრუნველყოფა და პაციენტებთან ურთიერთობის გამარტივება. ჩვენ ვქმნით უსაფრთხო და ინტუიციურ ციფრულ გადაწყვეტილებებს კლინიკებისთვის და საავადმყოფოებისთვის.",
      stats: [
        { value: "45%", label: "ეფექტურობის ზრდა" },
        { value: "2x", label: "პაციენტების ჩართულობა" },
        { value: "100%", label: "მონაცემთა უსაფრთხოება" }
      ],
      services: [
        "ტელემედიცინის პლატფორმები",
        "პაციენტის პორტალები და ჯავშნები",
        "სამედიცინო CRM ინტეგრაცია",
        "ჯანდაცვის SEO და ლოკალური ხილვადობა",
        "ადაპტირებული ვებ დიზაინი",
        "მონაცემთა უსაფრთხო მართვა"
      ],
      projectsTitle: "წარმატებული პროექტები ჯანდაცვაში",
      projectsDesc: "გაეცანით ჩვენს წარმატებულ პროექტებს ჯანდაცვის სფეროში.",
      cta: "მზად ხართ განაახლოთ თქვენი სამედიცინო პრაქტიკა?",
      ctaBtn: "მიიღეთ კონსულტაცია",
      whyTitle: "რატომ Smarketer ჯანდაცვისთვის?",
      keyServicesTitle: "ძირითადი სერვისები",
      features: [
        { label: "სამუშაო პროცესების ავტომატიზაცია" },
        { label: "HIPAA შესაბამისობა" },
        { label: "პაციენტის გამოცდილება" }
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
  const heroImage = pc.hero_image || "https://i.postimg.cc/VvM8fbq5/healt.webp";

  const t = language === 'ka' ? content.ka : content.en;
  const icons = [Activity, ShieldCheck, Users];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0F1C] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Helmet>
        <title>{t.title} | Smarketer</title>
      </Helmet>
      <Header />
      
      <main>
        {/* Modern Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'}`}
             />
             <motion.div 
               animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${darkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}
             />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:w-1/2 z-10"
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Healthcare Solutions</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.title}
                </h1>
                
                <p className={`text-lg lg:text-xl mb-10 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.subtitle}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link to="/contact">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1">
                      {t.ctaBtn}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:w-1/2 relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <img className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" alt="Modern doctor using tablet in high-tech clinic" src={heroImage} />
                </div>
                {/* Floating Badge */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute -bottom-6 -left-6 p-6 rounded-2xl shadow-xl backdrop-blur-md border ${darkMode ? 'bg-[#0A0F1C]/90 border-white/10' : 'bg-white/90 border-gray-100'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Security</p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>HIPAA Ready</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - Preserved Colors in Dark Mode */}
        <section className={`py-12 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${darkMode ? 'bg-blue-900/20 border-y border-blue-500/10' : 'bg-blue-600'}`} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {t.stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl ${darkMode ? 'bg-blue-950/30 border border-blue-500/20' : 'bg-white/10 backdrop-blur-sm border border-white/20'}`}
                >
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-white'}`}>{stat.value}</div>
                  <div className={`text-sm lg:text-base uppercase tracking-wider font-medium ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/2">
                <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t.whyTitle}
                </h2>
                <p className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.features.map((item, idx) => {
                    const Icon = icons[idx] || Activity;
                    return (
                      <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:border-blue-500/30' : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'}`}>
                        <Icon className="w-6 h-6 text-blue-500" />
                        <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-[#151932] border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-blue-900/5'}`}>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
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
                        <div className={`mt-1 p-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-lg transition-colors ${darkMode ? 'text-gray-300 group-hover:text-blue-300' : 'text-gray-700 group-hover:text-blue-700'}`}>{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Projects */}
        <section className={`py-20 ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
            <div className="container mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <span className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs uppercase tracking-widest">
                  {language === 'ka' ? 'პორტფოლიო' : 'Portfolio'}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.projectsTitle}</h2>
                <p className="text-lg opacity-60 max-w-2xl mx-auto">{t.projectsDesc}</p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
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
            <div className={`rounded-3xl p-12 text-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-blue-900 to-purple-900 border border-blue-700/30' : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/30'}`}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
              <div className="relative z-10">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 max-w-2xl mx-auto leading-tight">
                  {t.cta}
                </h2>
                <Link to="/contact">
                  <button className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
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

export default IndustryHealthcarePage;
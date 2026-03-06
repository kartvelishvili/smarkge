import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import PortfolioCard from '@/components/PortfolioCard';
import AnimatedSection from '@/components/AnimatedSection';

const PortfolioPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [pageSettings, setPageSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [industriesMap, setIndustriesMap] = useState({});

  useEffect(() => {
    // Fetch projects & settings
    const fetchData = async () => {
      try {
        // 1. Fetch Industries Map
        const { data: industriesData } = await supabase
          .from('industries_settings')
          .select('industries')
          .single();

        if (industriesData && industriesData.industries) {
            const map = {};
            industriesData.industries.forEach(ind => { map[ind.id] = ind; });
            setIndustriesMap(map);
        }

        // 2. Fetch Page Settings
        const { data: settingsData } = await supabase
          .from('portfolio_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (settingsData) setPageSettings(settingsData);

        // 3. Fetch Projects
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('visible', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (data) {
          setProjects(data);
          
          // Extract unique categories
          const uniqueCategories = new Set(['All']);
          data.forEach(p => {
            const cat = language === 'ka' ? p.category_ka : p.category_en;
            if (cat) uniqueCategories.add(cat);
          });
          setCategories(Array.from(uniqueCategories));
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscriptions
    const projectsChannel = supabase
      .channel('portfolio_changes_page_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_projects' }, () => fetchData())
      .subscribe();

    const settingsChannel = supabase
      .channel('portfolio_changes_page_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_settings' }, (payload) => {
         setPageSettings(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [language]);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => (language === 'ka' ? p.category_ka : p.category_en) === activeCategory);

  // Defaults if settings not loaded yet or empty
  const defaultTitle = language === 'ka' ? 'ჩვენი ნამუშევრები' : 'Our Work';
  const defaultDesc = language === 'ka' ? 'გადახედეთ ჩვენს ბოლოდროინდელ პროექტებს.' : 'Take a look at our recent projects.';
  
  const title = pageSettings ? (language === 'ka' ? pageSettings.title_ka : pageSettings.title_en) : defaultTitle;
  const description = pageSettings ? (language === 'ka' ? pageSettings.description_ka : pageSettings.description_en) : defaultDesc;
  const showTitle = pageSettings?.show_title !== false;

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F8FAFC]'}`}>
      <SEO slug="/portfolio" fallbackTitle="Portfolio" />

      {/* Modern Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 transition-colors duration-700 ${darkMode ? 'bg-indigo-900/40' : 'bg-blue-200/60'}`} />
          <div className={`absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-30 transition-colors duration-700 ${darkMode ? 'bg-purple-900/40' : 'bg-purple-200/60'}`} />
          <div className={`absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-20 transition-colors duration-700 ${darkMode ? 'bg-blue-900/30' : 'bg-indigo-200/50'}`} />
      </div>

      <Header alwaysOpaque={true} />

      <main className="relative z-10 pt-28 pb-16 container mx-auto px-4 lg:px-6 max-w-7xl">
        {/* Compact Page Header */}
        {showTitle && (
            <AnimatedSection className="text-center mb-10 relative">
                <div
                    className="inline-flex items-center justify-center gap-2 mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
                >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                        {language === 'ka' ? 'პორტფოლიო' : 'Portfolio'}
                    </span>
                </div>
                
                <h1 
                    className={`text-3xl lg:text-5xl font-extrabold mb-4 tracking-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}
                >
                    {title}
                </h1>
                
                <p 
                    className={`text-base lg:text-lg max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                    {description}
                </p>
            </AnimatedSection>
        )}

        {/* Modern Compact Filters */}
        <AnimatedSection delay={0.1} className="flex justify-center mb-10">
            <div 
                className={`
                    inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-md shadow-sm
                    ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200/60'}
                `}
            >
                {categories.map((cat, idx) => (
                    <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                        px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                        ${activeCategory === cat
                            ? 'text-white shadow-md'
                            : darkMode 
                                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }
                    `}
                    >
                    {activeCategory === cat && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-[#5468E7] to-[#4355D0]"
                        />
                    )}
                    <span className="relative z-10">{cat}</span>
                    </button>
                ))}
            </div>
        </AnimatedSection>

        {/* Projects Grid - More Compact & Modern */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#5468E7] animate-spin" />
          </div>
        ) : (
          <AnimatedSection delay={0.2} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <PortfolioCard 
                  key={project.id} 
                  project={project} 
                  industriesMap={industriesMap} 
                  language={language} 
                  darkMode={darkMode}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </AnimatedSection>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className={`text-center py-20 rounded-3xl border border-dashed ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'ka' ? 'პროექტები არ მოიძებნა' : 'No projects found'}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {language === 'ka' ? 'სცადეთ სხვა კატეგორია.' : 'Try selecting a different category.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
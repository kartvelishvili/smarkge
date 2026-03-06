import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PortfolioCard from '@/components/PortfolioCard';

const Portfolio = ({ darkMode }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(6);
  const [categories, setCategories] = useState(['All']);
  const [industriesMap, setIndustriesMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch display limit settings
        const { data: settingsData } = await supabase
          .from('portfolio_settings')
          .select('home_page_count')
          .limit(1)
          .maybeSingle();
        
        const displayLimit = settingsData?.home_page_count || 6;
        setLimit(displayLimit);

        // Fetch industries to map icons
        const { data: industriesData } = await supabase
          .from('industries_settings')
          .select('industries')
          .single();

        if (industriesData && industriesData.industries) {
            const map = {};
            industriesData.industries.forEach(ind => { map[ind.id] = ind; });
            setIndustriesMap(map);
        }

        // Fetch projects - ENSURE ORDER IS APPLIED
        const { data: projectsData, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('visible', true)
          .order('order_index', { ascending: true }); // Critical sorting

        if (error) throw error;

        if (projectsData) {
          setProjects(projectsData);
          
          const uniqueCategories = new Set(['All']);
          projectsData.forEach(p => {
            const cat = language === 'ka' ? p.category_ka : p.category_en;
            if (cat) uniqueCategories.add(cat);
          });
          setCategories(Array.from(uniqueCategories));
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to changes
    const projectsChannel = supabase
      .channel('home_portfolio_projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_projects' }, () => fetchData())
      .subscribe();
      
    const settingsChannel = supabase
      .channel('home_portfolio_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_settings' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [language]);

  const filteredProjects = projects.filter(p => 
    activeFilter === 'All' || (language === 'ka' ? p.category_ka : p.category_en) === activeFilter
  ).slice(0, limit);

  // Optimized Titles and Descriptions with Keywords
  const sectionTitle = language === 'ka' 
    ? 'ჩვენი ნამუშევრები: საიტების დამზადება და ბრენდინგი' 
    : 'Our Work: Website Creation & Branding';
    
  const sectionDesc = language === 'ka' 
    ? 'გაეცანით ჩვენს პორტფოლიოს: ვებ-გვერდების დამზადება, ლოგოს დამზადება და სოციალური მედია კამპანიები. ნახეთ, როგორ ვეხმარებით ბიზნესებს ციფრული ტრანსფორმაციაში.' 
    : 'Explore our portfolio: web development, logo design, and social media campaigns. See how we help businesses transform their digital presence.';

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {sectionTitle}
          </h2>
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {sectionDesc}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#5468E7] animate-spin" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {categories.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] text-white shadow-lg scale-105'
                      : darkMode
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
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
              </motion.div>
            </AnimatePresence>

            {filteredProjects.length === 0 && (
               <div className="text-center py-10">
                 <p className="text-gray-500">{language === 'ka' ? 'პროექტები არ მოიძებნა' : 'No projects found in this category'}</p>
               </div>
            )}

            <div className="flex justify-center mt-12">
               <Button 
                 onClick={() => navigate('/portfolio')}
                 className="bg-[#5468E7] hover:bg-[#4555d1] text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-[#5468E7]/25 hover:shadow-xl hover:scale-105 transition-all"
               >
                 {language === 'ka' ? 'ყველა ნამუშევრის ნახვა' : 'View All Projects'}
               </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
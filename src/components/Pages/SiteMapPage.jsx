import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, Briefcase, FileText, Phone, Users, Globe, 
  Layers, Map, Shield, Layout, Share2, Building2, 
  HeartPulse, ShoppingBag, GraduationCap, Plane, 
  ChevronRight, ExternalLink, Newspaper, Calendar
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/customSupabaseClient';

const SiteMapPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('portfolio_projects')
          .select('title_en, title_ka, slug, category_en, category_ka')
          .eq('visible', true)
          .order('order_index', { ascending: true });

        if (projectsError) throw projectsError;
        if (projectsData) setProjects(projectsData);

        // Fetch News
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('title_en, title_ka, slug, publish_date, category')
          .eq('status', 'published')
          .order('publish_date', { ascending: false });

        if (newsError) throw newsError;
        if (newsData) setNews(newsData);

      } catch (error) {
        console.error('Error fetching sitemap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for updates
    const newsChannel = supabase
      .channel('sitemap_news_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchData())
      .subscribe();
      
    const projectsChannel = supabase
      .channel('sitemap_projects_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_projects' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, []);

  const sections = [
    {
      title_en: "Main Pages",
      title_ka: "მთავარი გვერდები",
      icon: Home,
      links: [
        { to: "/", label_en: "Home", label_ka: "მთავარი", icon: Home },
        { to: "/services", label_en: "Services", label_ka: "სერვისები", icon: Layers },
        { to: "/about-us", label_en: "About Us", label_ka: "ჩვენ შესახებ", icon: Users },
        { to: "/contact", label_en: "Contact", label_ka: "კონტაქტი", icon: Phone },
        { to: "/news", label_en: "News & Blog", label_ka: "ბლოგი და სიახლეები", icon: FileText },
        { to: "/portfolio", label_en: "Portfolio", label_ka: "პორტფოლიო", icon: Briefcase },
      ]
    },
    {
      title_en: "Services Details",
      title_ka: "სერვისები დეტალურად",
      icon: Layers,
      links: [
        { to: "/web-design", label_en: "Web Design & Development", label_ka: "ვებ დიზაინი და დეველოპმენტი", icon: Layout },
        { to: "/social-media", label_en: "Social Media Marketing", label_ka: "სოციალური მედია მარკეტინგი", icon: Share2 },
      ]
    },
    {
      title_en: "Industries",
      title_ka: "ინდუსტრიები",
      icon: Globe,
      links: [
        { to: "/industry/healthcare", label_en: "Healthcare", label_ka: "ჯანდაცვა", icon: HeartPulse },
        { to: "/industry/real-estate", label_en: "Real Estate", label_ka: "უძრავი ქონება", icon: Building2 },
        { to: "/industry/ecommerce", label_en: "E-commerce", label_ka: "ელ-კომერცია", icon: ShoppingBag },
        { to: "/industry/education", label_en: "Education", label_ka: "განათლება", icon: GraduationCap },
        { to: "/industry/tourism", label_en: "Hospitality & Tourism", label_ka: "ტურიზმი და მასპინძლობა", icon: Plane },
        { to: "/industry/b2b", label_en: "B2B Services", label_ka: "B2B სერვისები", icon: Briefcase },
      ]
    },
    {
      title_en: "Legal & Support",
      title_ka: "სამართლებრივი",
      icon: Shield,
      links: [
        { to: "/privacy", label_en: "Privacy Policy", label_ka: "კონფიდენციალურობის პოლიტიკა", icon: Shield },
        { to: "/terms", label_en: "Terms & Conditions", label_ka: "წესები და პირობები", icon: FileText },
        { to: "/sitemap", label_en: "Site Map", label_ka: "საიტის რუკა", icon: Map },
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug="/sitemap" 
        fallbackTitle={language === 'ka' ? 'საიტის რუკა' : 'Site Map'} 
        fallbackDescription={language === 'ka' ? 'Smarketer-ის ვებ-გვერდის სრული რუკა და ნავიგაცია' : 'Complete navigation map of Smarketer website'} 
      />
      
      <Header />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <div className="container mx-auto px-4 lg:px-8 mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-6">
                    <Map className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wide">
                        {language === 'ka' ? 'ნავიგაცია' : 'Navigation'}
                    </span>
                </div>
                
                <h1 className={`text-4xl lg:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {language === 'ka' ? 'საიტის რუკა' : 'Site Map'}
                </h1>
                
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ka' 
                        ? 'იპოვეთ ნებისმიერი გვერდი ან სერვისი მარტივად.' 
                        : 'Find any page or service easily with our complete site overview.'}
                </p>
            </motion.div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Structural Sections */}
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-8 rounded-3xl border transition-all hover:shadow-lg ${
                            darkMode 
                                ? 'bg-[#0D1126] border-white/5 hover:border-blue-500/30' 
                                : 'bg-white border-gray-100 hover:border-blue-200'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <section.icon className="w-6 h-6" />
                            </div>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                {language === 'ka' ? section.title_ka : section.title_en}
                            </h2>
                        </div>
                        
                        <ul className="space-y-4">
                            {section.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                    <Link 
                                        to={link.to}
                                        className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                                            darkMode 
                                                ? 'hover:bg-white/5 text-gray-300 hover:text-white' 
                                                : 'hover:bg-gray-50 text-gray-600 hover:text-blue-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {link.icon && <link.icon className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity`} />}
                                            <span className="font-medium">{language === 'ka' ? link.label_ka : link.label_en}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}

                {/* News Section (Dynamic) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`md:col-span-2 lg:col-span-3 p-8 rounded-3xl border ${
                        darkMode 
                            ? 'bg-[#0D1126] border-white/5' 
                            : 'bg-white border-gray-100'
                    }`}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                            <Newspaper className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                {language === 'ka' ? 'სიახლეები' : 'Latest News'}
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'ka' ? 'ჩვენი ბლოგი და სიახლეები' : 'Our Blog and Updates'}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {news.map((item, idx) => (
                                <Link 
                                    key={idx}
                                    to={`/news/${item.slug}`}
                                    className={`group p-4 rounded-xl border transition-all hover:shadow-md flex items-start justify-between gap-4 ${
                                        darkMode 
                                            ? 'bg-white/5 border-white/5 hover:border-orange-500/30 text-gray-300 hover:text-white' 
                                            : 'bg-gray-50 border-gray-100 hover:border-orange-200 text-gray-600 hover:text-orange-700'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate mb-1">
                                            {language === 'ka' ? item.title_ka : item.title_en}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs opacity-60">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.publish_date).toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US')}
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                                </Link>
                            ))}
                            {news.length === 0 && (
                                <div className={`col-span-full text-center py-4 opacity-60 text-sm italic`}>
                                   {language === 'ka' ? 'სიახლეები არ არის' : 'No news found'}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Projects Section (Dynamic) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`md:col-span-2 lg:col-span-3 p-8 rounded-3xl border ${
                        darkMode 
                            ? 'bg-[#0D1126] border-white/5' 
                            : 'bg-white border-gray-100'
                    }`}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                {language === 'ka' ? 'პროექტები' : 'Projects'}
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'ka' ? 'ჩვენი პორტფოლიო' : 'Our Portfolio Showcase'}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {projects.map((project, idx) => (
                                <Link 
                                    key={idx}
                                    to={`/portfolio/${project.slug}`}
                                    className={`group p-4 rounded-xl border transition-all hover:shadow-md flex items-center justify-between ${
                                        darkMode 
                                            ? 'bg-white/5 border-white/5 hover:border-purple-500/30 text-gray-300 hover:text-white' 
                                            : 'bg-gray-50 border-gray-100 hover:border-purple-200 text-gray-600 hover:text-purple-700'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <div className="font-medium truncate pr-2">
                                            {language === 'ka' ? project.title_ka : project.title_en}
                                        </div>
                                        <div className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {language === 'ka' ? project.category_ka : project.category_en}
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

            </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default SiteMapPage;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import AnimatedSection from '@/components/AnimatedSection';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, searchQuery, language]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      
      setPosts(data || []);
      
      // Extract unique categories
      const cats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let result = posts;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(post => post.category === selectedCategory);
    }

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        (post.title_en?.toLowerCase().includes(query)) ||
        (post.title_ka?.toLowerCase().includes(query)) ||
        (post.excerpt_en?.toLowerCase().includes(query)) ||
        (post.excerpt_ka?.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(result);
  };

  const getReadTime = (content) => {
    const text = content || '';
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug="/news" 
        fallbackTitle={language === 'ka' ? 'სიახლეები' : 'News & Updates'} 
      />
      
      <Header />
      
      <main className="pt-24 lg:pt-32 pb-20 px-4 lg:px-8">
        {/* Hero Section */}
        <AnimatedSection className="container mx-auto max-w-7xl mb-12 lg:mb-20">
            <div className="text-center relative z-10">
              <h1 className={`text-4xl lg:text-7xl font-bold mb-6 tracking-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                {language === 'ka' ? 'სიახლეები' : 'News & Updates'}
              </h1>
              <p className={`text-lg lg:text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'ka' 
                  ? 'გაიგეთ უახლესი ტენდენციები, სიახლეები და ექსპერტთა მოსაზრებები ციფრულ სამყაროზე.'
                  : 'Discover the latest trends, agency updates, and expert insights on the digital world.'}
              </p>
            </div>
        </AnimatedSection>

        {/* Filters & Search */}
        <AnimatedSection delay={0.1} className="container mx-auto max-w-7xl mb-12">
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'bg-[#0D1126] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                selectedCategory === cat 
                                    ? 'bg-[#5468E7] text-white shadow-lg shadow-[#5468E7]/25' 
                                    : darkMode 
                                        ? 'bg-white/5 text-gray-400 hover:bg-white/10' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input 
                        type="text"
                        placeholder={language === 'ka' ? 'ძებნა...' : 'Search news...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-[#5468E7]/50 transition-all ${
                            darkMode 
                                ? 'bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-600' 
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                        }`}
                    />
                </div>
            </div>
        </AnimatedSection>

        {/* News Grid */}
        <AnimatedSection delay={0.2} className="container mx-auto max-w-7xl">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className={`h-[450px] rounded-3xl animate-pulse ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}></div>
                 ))}
               </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => {
                        const title = language === 'ka' ? post.title_ka : post.title_en;
                        const excerpt = language === 'ka' ? post.excerpt_ka : post.excerpt_en;
                        const readTime = getReadTime(language === 'ka' ? post.content_ka : post.content_en);
                        
                        return (
                            <div key={post.id} className="group h-full">
                                <Link 
                                    to={`/news/${post.slug}`}
                                    className={`block h-full rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                                        darkMode 
                                            ? 'bg-[#0D1126] border-white/5 hover:border-[#5468E7]/30 hover:shadow-2xl hover:shadow-[#5468E7]/10' 
                                            : 'bg-white border-gray-100 hover:border-[#5468E7]/30 hover:shadow-2xl hover:shadow-[#5468E7]/5'
                                    }`}
                                >
                                    {/* Image Container */}
                                    <div className="relative h-60 overflow-hidden">
                                        <img 
                                            src={post.featured_image_url || 'https://via.placeholder.com/800x600'} 
                                            alt={title} 
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1126] to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                        
                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full bg-[#5468E7]/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(post.publish_date).toLocaleDateString(language === 'en' ? 'en-US' : 'ka-GE')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {readTime} {language === 'ka' ? 'წთ კითხვა' : 'min read'}
                                            </span>
                                        </div>

                                        <h2 className={`text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-[#5468E7] transition-colors ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                            {title}
                                        </h2>

                                        <p className={`text-sm line-clamp-3 mb-6 flex-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {excerpt}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-auto">
                                             <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5468E7] to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {post.author ? post.author.charAt(0) : 'S'}
                                                </div>
                                                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {post.author || 'Smarketer'}
                                                </span>
                                             </div>
                                             <span className="text-[#5468E7] text-sm font-bold flex items-center group/btn">
                                                {language === 'ka' ? 'სრულად' : 'Read More'}
                                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                             </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-white/5 mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {language === 'ka' ? 'შედეგები არ მოიძებნა' : 'No articles found'}
                    </h3>
                    <p className="text-gray-500">
                        {language === 'ka' ? 'სცადეთ სხვა საძიებო სიტყვა ან კატეგორია.' : 'Try adjusting your search or filter.'}
                    </p>
                </div>
            )}
        </AnimatedSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsPage;
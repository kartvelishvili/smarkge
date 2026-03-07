import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Blog = ({ darkMode }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('publish_date', { ascending: false })
          .limit(4);
        
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  if (posts.length === 0 && !loading) return null;

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-12">
           <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-3xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
              {language === 'ka' ? 'სიახლეები' : 'Latest News'}
            </h2>
            <p className={`text-lg max-w-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'ka' 
                ? 'გაიგეთ მეტი ჩვენი კომპანიის სიახლეებსა და ტექნოლოგიურ მიღწევებზე.' 
                : 'Updates, strategies, and success stories from our team.'}
            </p>
          </motion.div>
          
          <Link to="/news">
            <Button variant="outline" className={`hidden md:flex ${darkMode ? 'border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7] hover:text-white' : 'border-[#5468E7] text-[#5468E7] hover:bg-[#5468E7] hover:text-white'}`}>
               {language === 'ka' ? 'ყველა სიახლე' : 'View All News'} <ArrowRight className="ml-2 w-4 h-4"/>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {posts.map((post, index) => {
            const title = language === 'ka' ? post.title_ka : post.title_en;
            const excerpt = language === 'ka' ? post.excerpt_ka : post.excerpt_en;
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  to={`/news/${post.slug}`}
                  className={`group block h-full rounded-2xl border overflow-hidden transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-[#0D1126] border-[#5468E7]/30 hover:border-[#5468E7]' 
                      : 'bg-white border-gray-200 hover:border-[#5468E7]'
                  } shadow-lg hover:shadow-2xl`}
                >
                  <div className="relative h-48 overflow-hidden">
                    {post.featured_image_url ? (
                       <img alt={title} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-110" src={post.featured_image_url} />
                    ) : (
                       <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="text-gray-400 text-xs">No Image</span>
                       </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Category */}
                    <div className="absolute top-3 left-3">
                       <span className="bg-[#5468E7]/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md">
                          {post.category}
                       </span>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/90">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publish_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${darkMode ? 'text-white group-hover:text-[#5468E7]' : 'text-[#0A0F1C] group-hover:text-[#5468E7]'} transition-colors`}>
                      {title}
                    </h3>

                    <p className={`text-sm line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {excerpt}
                    </p>
                    
                    <div className="mt-4 flex items-center text-[#5468E7] text-xs font-bold uppercase tracking-wider">
                      {language === 'ka' ? 'სრულად' : 'Read More'} <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex justify-center md:hidden">
            <Link to="/news">
              <Button className="w-full bg-[#5468E7] text-white">
                {language === 'ka' ? 'ყველა სიახლე' : 'View All News'}
              </Button>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
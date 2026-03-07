import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Share2, ArrowLeft, Clock, Tag, Facebook, Twitter, Linkedin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ShortcodeParser from '@/components/ShortcodeParser';
import AnimatedSection from '@/components/AnimatedSection';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        // Fetch current post
        const { data: currentPost, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(currentPost);

        // Fetch related posts
        if (currentPost) {
          const { data: related, error: relatedError } = await supabase
            .from('news')
            .select('id, title_en, title_ka, slug, featured_image_url, publish_date, category')
            .eq('status', 'published')
            .neq('id', currentPost.id)
            .eq('category', currentPost.category)
            .limit(3);
            
          if (!relatedError) setRelatedPosts(related);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Article link copied to clipboard!" });
  };

  const getReadTime = (text) => {
    if (!text) return 0;
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0A0F1C] text-white' : 'bg-[#F4F7FF] text-gray-900'}`}>Loading...</div>;
  if (!post) return <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0A0F1C] text-white' : 'bg-[#F4F7FF] text-gray-900'}`}>Post not found</div>;

  const title = language === 'ka' ? post.title_ka : post.title_en;
  const content = language === 'ka' ? post.content_ka : post.content_en;
  const excerpt = language === 'ka' ? post.excerpt_ka : post.excerpt_en;
  const readTime = getReadTime(content);

  // Article JSON-LD schema (SEO-011)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": excerpt,
    "image": post.featured_image_url,
    "author": {
      "@type": "Person",
      "name": post.author || "Smarketer"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Smarketer",
      "logo": {
        "@type": "ImageObject",
        "url": "https://smarketer.ge/smarketer-logo.png"
      }
    },
    "datePublished": post.publish_date,
    "dateModified": post.updated_at || post.publish_date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://smarketer.ge/news/${slug}`
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug={`/news/${slug}`}
        overrideTitle={title}
        overrideDescription={excerpt}
        overrideImage={post.featured_image_url}
        fallbackTitle="News Detail"
        jsonLd={articleSchema}
      />

      <Header alwaysOpaque />

      <main className="pt-28 pb-20">
        {/* Article Hero */}
        <AnimatedSection className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
             <img 
               src={post.featured_image_url || "https://via.placeholder.com/1200x600"} 
               alt={title} 
               loading="lazy"
               className="w-full h-full object-cover" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/60 to-transparent"></div>
             
             <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 z-10">
                <div className="container mx-auto max-w-4xl">
                   <Link to="/news" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors text-sm font-medium backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full border border-white/10">
                      <ArrowLeft className="w-4 h-4 mr-2" /> 
                      {language === 'ka' ? 'უკან სიახლეებში' : 'Back to News'}
                   </Link>
                   
                   <div>
                       <div className="flex flex-wrap gap-3 mb-4">
                           <span className="bg-[#5468E7] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              {post.category}
                           </span>
                       </div>
                       
                       <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                          {title}
                       </h1>

                       <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm font-medium">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                {post.author ? post.author.charAt(0) : 'A'}
                             </div>
                             <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4" />
                             <span>{new Date(post.publish_date).toLocaleDateString(language === 'en' ? 'en-US' : 'ka-GE')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4" />
                             <span>{readTime} {language === 'ka' ? 'წთ კითხვა' : 'min read'}</span>
                          </div>
                       </div>
                   </div>
                </div>
             </div>
        </AnimatedSection>

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 mt-12">
           <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Main Content */}
              <article className="lg:w-2/3">
                 <AnimatedSection delay={0.1}>
                   <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert prose-p:text-gray-300 prose-headings:text-white' : 'prose-p:text-gray-600 prose-headings:text-gray-900'}`}>
                      {/* Excerpt */}
                      <p className="lead text-xl font-medium border-l-4 border-[#5468E7] pl-6 italic mb-10">
                         {excerpt}
                      </p>
                      
                      {/* Body with Shortcode Parser */}
                      <ShortcodeParser content={content} />
                   </div>
                 </AnimatedSection>

                 {/* Tags & Share */}
                 <AnimatedSection delay={0.2} className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex gap-2">
                       {['Technology', 'Innovation', 'Future'].map(tag => (
                          <span key={tag} className={`px-3 py-1 rounded-lg text-xs font-medium ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                             #{tag}
                          </span>
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="rounded-full" onClick={handleShare}>
                          <Facebook className="w-5 h-5 text-blue-600" />
                       </Button>
                       <Button size="icon" variant="ghost" className="rounded-full" onClick={handleShare}>
                          <Twitter className="w-5 h-5 text-sky-500" />
                       </Button>
                       <Button size="icon" variant="ghost" className="rounded-full" onClick={handleShare}>
                          <Linkedin className="w-5 h-5 text-blue-700" />
                       </Button>
                       <Button size="icon" variant="ghost" className="rounded-full" onClick={handleShare}>
                          <Share2 className="w-5 h-5" />
                       </Button>
                    </div>
                 </AnimatedSection>
              </article>

              {/* Sidebar */}
              <aside className="lg:w-1/3 space-y-8">
                 <AnimatedSection delay={0.3} className={`p-8 rounded-3xl border sticky top-32 ${darkMode ? 'bg-[#0D1126] border-white/10' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                       <Tag className="w-5 h-5 text-[#5468E7]" />
                       {language === 'ka' ? 'მსგავსი სიახლეები' : 'Related News'}
                    </h3>
                    
                    <div className="space-y-6">
                       {relatedPosts.length > 0 ? relatedPosts.map(related => (
                          <Link key={related.id} to={`/news/${related.slug}`} className="group flex gap-4 items-start">
                             <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                                <img src={related.featured_image_url} alt={related.title} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                             </div>
                             <div>
                                <h4 className={`text-sm font-bold line-clamp-2 mb-2 group-hover:text-[#5468E7] transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                   {language === 'ka' ? related.title_ka : related.title_en}
                                </h4>
                                <span className="text-xs text-gray-500 block">
                                   {new Date(related.publish_date).toLocaleDateString()}
                                </span>
                             </div>
                          </Link>
                       )) : (
                          <p className="text-gray-500 text-sm italic">No related articles found.</p>
                       )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                       <h4 className={`text-sm font-bold mb-4 uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {language === 'ka' ? 'გამოგვყევით' : 'Follow Us'}
                       </h4>
                       <div className="flex gap-4">
                          {[1,2,3,4].map(i => (
                             <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${darkMode ? 'bg-white/5 hover:bg-[#5468E7] text-white' : 'bg-gray-100 hover:bg-[#5468E7] hover:text-white text-gray-600'}`}>
                                <Share2 className="w-4 h-4" />
                             </div>
                          ))}
                       </div>
                    </div>
                 </AnimatedSection>
              </aside>

           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
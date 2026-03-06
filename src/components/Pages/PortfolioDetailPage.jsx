import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, X, ZoomIn, Loader2, ArrowRight, Grid, Quote, CheckCircle2, Sparkles, Facebook, Instagram, Linkedin, Youtube, Music2, Globe, ChevronLeft, ChevronRight, Briefcase, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import ShortcodeParser from '@/components/ShortcodeParser';
import AnimatedSection from '@/components/AnimatedSection';
import { resolveIcon } from '@/lib/iconMap';

const PortfolioDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { darkMode } = useTheme();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [industriesMap, setIndustriesMap] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Layout 4 Specific States
  const [activeTab, setActiveTab] = useState(0);

  // Gallery slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: projectData, error: projectError } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (projectError) throw projectError;
        
        if (!projectData) {
            navigate('/portfolio');
            return;
        }

        setProject(projectData);
        // If Layout 4 and tabs exist, set active tab
        if(Array.isArray(projectData.project_tabs) && projectData.project_tabs.length > 0) {
            setActiveTab(0);
        }

        const { data: industriesData } = await supabase
          .from('industries_settings')
          .select('industries')
          .single();

        if (industriesData && industriesData.industries) {
          const map = {};
          industriesData.industries.forEach(ind => { map[ind.id] = ind; });
          setIndustriesMap(map);
        }

      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
        <Loader2 className="w-10 h-10 text-[#5468E7] animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const title = language === 'ka' ? project.title_ka : project.title_en;
  const description = language === 'ka' ? project.description_ka : project.description_en;
  const detailedDescription = language === 'ka' ? (project.detailed_description_ka || description) : (project.detailed_description_en || description);
  const category = language === 'ka' ? project.category_ka : project.category_en;
  const layout = project.layout_type || 'layout_a';
  const galleryLayout = project.gallery_layout || 'grid_3';

  // --- SUB-COMPONENTS FOR REUSE ---
  
  const ProjectHeader = () => (
    <div className="flex items-center gap-3 mb-6">
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        project.project_type === 'social_media' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
      }`}>
        {project.project_type === 'social_media' ? (language === 'ka' ? 'სოციალური მედია' : 'Social Media') : (language === 'ka' ? 'ვებ დეველოპმენტი' : 'Web Development')}
      </span>
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        {category}
      </span>
    </div>
  );

  const IndustriesList = ({ centered = false }) => (
    Array.isArray(project.industry_ids) && project.industry_ids.length > 0 && (
      <div className={`mb-8 ${centered ? 'flex flex-col items-center' : ''}`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {language === 'ka' ? 'ინდუსტრიები' : 'Industries'}
        </h3>
        <div className={`flex flex-wrap gap-3 ${centered ? 'justify-center' : ''}`}>
          {project.industry_ids.map(id => {
            const ind = industriesMap[id];
            if (!ind) return null;
            const Icon = resolveIcon(ind.icon) || Briefcase;
            return (
              <div key={id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-[#0D1126] border-white/10' : 'bg-white border-gray-200'}`}>
                <Icon className="w-3 h-3 text-[#5468E7]" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{language === 'ka' ? ind.name_ka : ind.name_en}</span>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
  
  const FeaturesList = () => (
    Array.isArray(project.project_features) && project.project_features.length > 0 && (
        <div className="mb-8">
             <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                 <Sparkles className="w-4 h-4" /> {language === 'ka' ? 'მახასიათებლები' : 'Key Features'}
             </h3>
             <ul className="grid sm:grid-cols-2 gap-3">
                 {project.project_features.map((feature, idx) => (
                     <li key={idx} className={`flex items-start gap-2 text-sm p-3 rounded-lg border ${darkMode ? 'bg-[#0D1126] border-white/5 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                         <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                         <span className="leading-snug">{language === 'ka' ? feature.title_ka : feature.title_en}</span>
                     </li>
                 ))}
             </ul>
        </div>
    )
  );

  const VisitButton = ({ className }) => (
    project.project_link && (
      <a 
        href={project.project_link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-[#5468E7] hover:bg-[#4555d1] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#5468E7]/25 hover:shadow-xl hover:scale-105 transition-all ${className}`}
      >
        {language === 'ka' ? 'პროექტის ნახვა' : 'Visit Live Project'}
        <ExternalLink className="w-5 h-5" />
      </a>
    )
  );

  const BackButton = ({ className }) => (
    <button onClick={() => navigate('/portfolio')} className={`flex items-center gap-2 text-sm font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} ${className}`}>
        <ArrowLeft className="w-4 h-4" /> {language === 'ka' ? 'უკან' : 'Back'}
    </button>
  );

  const GallerySection = () => {
      const images = project.gallery_images || [];
      if (images.length === 0) return null;

      return (
        <AnimatedSection className={`py-12 lg:py-20 border-t ${darkMode ? 'border-white/5 bg-[#0A0F1C]' : 'border-gray-100 bg-[#F4F7FF]'}`}>
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-3 mb-10">
                    <Grid className="w-6 h-6 text-[#5468E7]" />
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>{language === 'ka' ? 'გალერეა' : 'Project Gallery'}</h2>
                </div>

                {/* --- Grid Layouts (2 or 3 Columns) --- */}
                {['grid_2', 'grid_3'].includes(galleryLayout) && (
                     <div className={`grid grid-cols-1 md:grid-cols-2 ${galleryLayout === 'grid_3' ? 'lg:grid-cols-3' : ''} gap-6`}>
                        {images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`rounded-xl overflow-hidden cursor-pointer border shadow-lg group relative aspect-video ${darkMode ? 'border-white/10' : 'border-gray-100'}`}
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* --- Masonry Layout --- */}
                {galleryLayout === 'masonry' && (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                         {images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer border shadow-lg group relative mb-6"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* --- Carousel Slider --- */}
                {galleryLayout === 'carousel' && (
                    <div className="relative group">
                         <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black aspect-video relative">
                             <AnimatePresence mode="wait">
                                 <motion.img 
                                    key={currentSlide}
                                    src={images[currentSlide]}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-full object-contain cursor-pointer"
                                    onClick={() => setSelectedImage(images[currentSlide])}
                                 />
                             </AnimatePresence>

                             {/* Navigation Buttons */}
                             {images.length > 1 && (
                                <>
                                    <button 
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                        }}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                        }}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                             )}
                             
                             {/* Indicators */}
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                 {images.map((_, idx) => (
                                     <button 
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                                     />
                                 ))}
                             </div>
                         </div>
                         
                         {/* Thumbnails Strip */}
                         {images.length > 1 && (
                             <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                                 {images.map((img, idx) => (
                                     <button 
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${currentSlide === idx ? 'border-[#5468E7]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                     >
                                         <img src={img} className="w-full h-full object-cover" alt="" />
                                     </button>
                                 ))}
                             </div>
                         )}
                    </div>
                )}
            </div>
        </AnimatedSection>
      );
  }
  
  // Renders a testimonial card if data exists and is visible
  const TestimonialCard = ({ className = "" }) => {
    // Check visibility flag first (default to true if undefined/null for backward compatibility)
    if (project.testimonial_visible === false) return null;

    // Determine fields based on language, falling back if not available
    const tName = language === 'ka' ? (project.testimonial_data?.name_ka || project.testimonial_data?.name_en || project.testimonial_data?.name) : (project.testimonial_data?.name_en || project.testimonial_data?.name);
    const tRole = language === 'ka' ? (project.testimonial_data?.position_ka || project.testimonial_data?.position_en || project.testimonial_data?.role) : (project.testimonial_data?.position_en || project.testimonial_data?.role);
    const tCompany = language === 'ka' ? (project.testimonial_data?.company_ka || project.testimonial_data?.company_en) : (project.testimonial_data?.company_en);
    const tText = language === 'ka' ? (project.testimonial_data?.text_ka || project.testimonial_data?.text_en || project.testimonial_data?.quote_ka || project.testimonial_data?.quote_en) : (project.testimonial_data?.text_en || project.testimonial_data?.quote_en);
    const tImage = project.testimonial_data?.image_url || project.testimonial_data?.logo_url;

    if (!tName || !tText) return null;

    return (
        <AnimatedSection delay={0.2} className={`bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden ${className}`}>
             <Quote className="absolute top-6 right-6 w-16 h-16 text-white/10" />
             <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                     {tImage && (
                         <img src={tImage} alt="Client" className="w-12 h-12 rounded-full bg-white p-0.5 object-cover shadow-sm border-2 border-white/20" />
                     )}
                     <div>
                         <h4 className="font-bold text-lg leading-tight">{tName}</h4>
                         <p className="text-white/80 text-xs">
                            {tRole} {tCompany && ` @ ${tCompany}`}
                         </p>
                     </div>
                 </div>
                 <p className="italic text-white/90 leading-relaxed mb-4 text-sm md:text-base">"{tText}"</p>
             </div>
         </AnimatedSection>
    );
  };

  const SocialMediaSection = () => {
    if (!project.social_media_links) return null;
    
    const links = project.social_media_links;
    const platforms = [
      { key: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', gradient: 'from-[#1877F2] to-[#0C5DC7]' },
      { key: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', gradient: 'from-[#833AB4] via-[#FD1D1D] to-[#F77737]' },
      { key: 'tiktok', name: 'TikTok', icon: Music2, color: '#000000', gradient: 'from-[#000000] to-[#252525]' },
      { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-[#0A66C2] to-[#064B91]' },
      { key: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', gradient: 'from-[#FF0000] to-[#CC0000]' }
    ].filter(p => links[p.key] && links[p.key].url);

    if (platforms.length === 0) return null;
    
    return (
      <AnimatedSection className={`py-12 border-t ${darkMode ? 'border-white/10 bg-[#0D1126]/50' : 'border-gray-200 bg-white'}`}>
        <div className="container mx-auto px-4 lg:px-8">
           <h3 className={`text-xl font-bold mb-8 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Globe className="w-5 h-5 text-[#5468E7]" />
              {language === 'ka' ? 'სოციალური მედია' : 'Connect on Social Media'}
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                 <motion.a 
                    key={platform.key}
                    href={links[platform.key].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    className={`relative overflow-hidden rounded-xl p-6 flex flex-col justify-between h-32 shadow-lg group`}
                 >
                    {/* Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-90 transition-opacity group-hover:opacity-100`} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex justify-between items-start">
                       <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <platform.icon className="w-6 h-6 text-white" />
                       </div>
                       <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                       <h4 className="text-white font-bold text-lg">{platform.name}</h4>
                       {links[platform.key].followers && (
                          <p className="text-white/80 text-sm font-medium">
                             {links[platform.key].followers} {language === 'ka' ? 'გამომწერი' : 'Followers'}
                          </p>
                       )}
                    </div>

                    {/* Decorative Circle */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                 </motion.a>
              ))}
           </div>
        </div>
      </AnimatedSection>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug={`/portfolio/${slug}`} 
        overrideTitle={title} 
        overrideDescription={description} 
        overrideImage={project.image_url}
        fallbackTitle="Portfolio Project"
      />

      <Header alwaysOpaque={true} />

      {/* --- LAYOUT A: Standard --- */}
      {layout === 'layout_a' && (
        <main className="pt-24">
            <div className="container mx-auto px-4 lg:px-8 mb-8"><BackButton /></div>
            <div className="container mx-auto px-4 lg:px-8 mb-16">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <AnimatedSection>
                        <ProjectHeader />
                        <h1 className={`text-4xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>{title}</h1>
                        <div className={`prose prose-lg mb-8 ${darkMode ? 'prose-invert text-gray-400' : 'text-gray-600'}`}><p>{description}</p></div>
                        <FeaturesList />
                        <IndustriesList />
                        <VisitButton />
                        <TestimonialCard className="mt-12" />
                    </AnimatedSection>
                    <AnimatedSection delay={0.2} className="relative">
                        <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${darkMode ? 'bg-[#0D1126] border-white/10' : 'bg-white border-gray-100'}`}>
                            <div className="aspect-video relative overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(project.image_url)}>
                                <img src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"><ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                            </div>
                            {project.logo_url && (
                                <div className="absolute -bottom-10 right-10">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-xl flex items-center justify-center relative z-10" style={{ border: `4px solid ${project.logo_border_color || '#ffffff'}` }}>
                                        <img src={project.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </AnimatedSection>
                </div>
            </div>
            
            <SocialMediaSection /> {/* Moved SocialMediaSection here */}
            <GallerySection />    {/* GallerySection moved below SocialMediaSection */}
        </main>
      )}

      {/* --- LAYOUT B: Split View --- */}
      {layout === 'layout_b' && (
        <main className="pt-24 pb-20 container mx-auto px-4 lg:px-8">
            <div className="mb-8"><BackButton /></div>
            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                    <AnimatedSection>
                        <ProjectHeader />
                        <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>{title}</h1>
                        <div className={`prose mb-8 ${darkMode ? 'prose-invert text-gray-400' : 'text-gray-600'}`}><p>{description}</p></div>
                        <FeaturesList />
                        <IndustriesList />
                        <VisitButton />
                         {project.logo_url && (
                            <div className="mt-8 w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white">
                                <img src={project.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <TestimonialCard className="mt-12" />
                    </AnimatedSection>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    <AnimatedSection delay={0.2} className="rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={() => setSelectedImage(project.image_url)}>
                        <img src={project.image_url} alt="Cover" className="w-full h-auto" />
                    </AnimatedSection>
                    
                    <SocialMediaSection /> {/* Moved SocialMediaSection here */}
                    <GallerySection />    {/* GallerySection moved below SocialMediaSection */}
                </div>
            </div>
        </main>
      )}

      {/* --- LAYOUT C: Visual Focus --- */}
      {layout === 'layout_c' && (
        <main className="pb-0">
            <AnimatedSection className="relative h-[70vh] w-full overflow-hidden">
                <img src={project.image_url} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-16 container mx-auto">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                         <BackButton className="text-white/70 hover:text-white mb-6" />
                        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">{title}</h1>
                        <ProjectHeader />
                    </motion.div>
                </div>
            </AnimatedSection>
            
            <div className="container mx-auto px-4 lg:px-8 mt-16 mb-20">
                 <div className="max-w-4xl mx-auto text-center mb-20">
                     <AnimatedSection delay={0.1}>
                         <p className={`text-xl lg:text-2xl leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{description}</p>
                         <div className="mt-10 flex flex-col items-center gap-6">
                            <div className="w-full max-w-2xl text-left">
                                 <FeaturesList />
                            </div>
                            <IndustriesList centered />
                            <VisitButton />
                            <TestimonialCard className="w-full max-w-2xl text-left mt-8" />
                         </div>
                     </AnimatedSection>
                 </div>
                 
                 <SocialMediaSection /> {/* Moved SocialMediaSection here */}
                 <GallerySection />    {/* GallerySection moved below SocialMediaSection */}
            </div>
        </main>
      )}

      {/* --- LAYOUT 4: Storytelling (Redesigned) --- */}
      {layout === 'layout_4' && (
        <main className="pb-0">
            {/* Hero Section */}
            <div className="relative h-[65vh] w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                   <img src={project.image_url} alt={title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>
                
                {/* Content Overlay on Hero */}
                <div className="absolute inset-0 z-10 container mx-auto px-4 lg:px-8 flex flex-col justify-center h-full pb-20">
                     <BackButton className="text-white/80 hover:text-white mb-8 w-fit" />
                     <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-5xl lg:text-7xl font-bold text-white mb-4 drop-shadow-xl max-w-4xl leading-tight"
                    >
                        {title}
                    </motion.h1>
                     <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/90 font-light tracking-wide uppercase"
                     >
                        {category}
                     </motion.p>
                </div>

                {/* Shape Divider */}
                <div className="absolute bottom-0 left-0 w-full h-24 z-20 overflow-hidden">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill={darkMode ? '#0A0F1C' : '#F4F7FF'} fillOpacity="1" d="M0,224L80,197.3C160,171,320,117,480,122.7C640,128,800,192,960,197.3C1120,203,1280,149,1360,122.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`relative z-30 -mt-10 lg:-mt-16 container mx-auto px-4 lg:px-8 mb-20`}>
                 <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                     
                     {/* Left Column (Main Story) */}
                     <div className="lg:w-[70%]">
                         {/* Meta Action Bar */}
                         <AnimatedSection className="flex flex-wrap items-center gap-6 mb-12 p-6 rounded-2xl bg-white dark:bg-[#0D1126] shadow-lg border border-gray-100 dark:border-white/5 order-1">
                            {/* Logo Overlap */}
                            <div className="flex items-center gap-4">
                                {project.logo_url && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-md border-2 border-gray-100 dark:border-white/10 flex-shrink-0">
                                        <img src={project.logo_url} className="w-full h-full object-cover" alt="Logo" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">{category}</span>
                                </div>
                            </div>

                            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block mx-2" />

                            {/* Industries */}
                            <div className="flex gap-2 flex-wrap">
                                {Array.isArray(project.industry_ids) && project.industry_ids.map(id => {
                                    const ind = industriesMap[id];
                                    if(!ind) return null;
                                    const Icon = resolveIcon(ind.icon) || Briefcase;
                                    return <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5"><Icon className="w-3 h-3 text-[#5468E7]" /> {language === 'ka' ? ind.name_ka : ind.name_en}</div>
                                })}
                            </div>

                            <div className="ml-auto">
                                <VisitButton className="px-5 py-2 text-sm !rounded-lg" />
                            </div>
                         </AnimatedSection>

                         {/* Rich Description */}
                         <AnimatedSection delay={0.1} className={`prose prose-lg max-w-none mb-16 order-2 ${darkMode ? 'prose-invert prose-p:text-gray-300 prose-headings:text-white' : 'prose-p:text-gray-600 prose-headings:text-[#0A0F1C]'}`}>
                             <ShortcodeParser content={detailedDescription} />
                         </AnimatedSection>

                         <AnimatedSection delay={0.2} className="mb-16">
                             <FeaturesList />
                         </AnimatedSection>
                         
                         {/* Interactive Tabs Section - Screenshots */}
                         {Array.isArray(project.project_tabs) && project.project_tabs.length > 0 && (
                             <AnimatedSection delay={0.3} className="space-y-6 order-3 mt-16">
                                 <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                    {language === 'ka' ? 'პროექტის მიმოხილვა' : 'Project Showcase'}
                                 </h3>
                                 <div className="flex flex-wrap gap-3 mb-6">
                                     {project.project_tabs.map((tab, idx) => (
                                         <button
                                            key={idx}
                                            onClick={() => setActiveTab(idx)}
                                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                                                activeTab === idx
                                                ? 'bg-[#5468E7] text-white ring-2 ring-[#5468E7] ring-offset-2 ring-offset-[#F4F7FF] dark:ring-offset-[#0A0F1C]'
                                                : 'bg-white dark:bg-[#0D1126] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10'
                                            }`}
                                         >
                                             {language === 'ka' ? tab.label_ka : tab.label_en}
                                         </button>
                                     ))}
                                 </div>
                                 
                                 {/* Tab Content (Full Page Screenshot) */}
                                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-900 bg-gray-900 group">
                                     <div className="absolute top-0 left-0 w-full h-8 bg-gray-800 flex items-center px-4 gap-2 z-10">
                                         <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                         <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                         <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                     </div>
                                     <div className="w-full pt-8 bg-gray-900">
                                         {/* Updated to check both possible keys for backward compatibility */}
                                         <img 
                                            src={project.project_tabs[activeTab]?.image_url || project.project_tabs[activeTab]?.url} 
                                            alt={language === 'ka' ? project.project_tabs[activeTab]?.label_ka : project.project_tabs[activeTab]?.label_en} 
                                            className="w-full h-auto block"
                                         />
                                     </div>
                                 </div>
                             </AnimatedSection>
                         )}
                     </div>

                     {/* Right Column (Sidebar) */}
                     <div className="lg:w-[30%] space-y-8 mt-8 lg:mt-0">
                         {/* Testimonial Card */}
                         <TestimonialCard />

                         {/* Project Facts Card */}
                         <AnimatedSection delay={0.2} className="bg-white dark:bg-[#0D1126] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-lg">
                             <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                                 <CheckCircle2 className="w-5 h-5 text-[#5468E7]" /> {language === 'ka' ? 'პროექტის დეტალები' : 'Project Facts'}
                             </h4>
                             <div className="space-y-6">
                                 {Array.isArray(project.project_facts) && project.project_facts.map((fact, idx) => {
                                     const FactIcon = resolveIcon(fact.icon) || CheckCircle;
                                     return (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#5468E7]/10 flex items-center justify-center flex-shrink-0 text-[#5468E7]">
                                                <FactIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">{language === 'ka' ? fact.label_ka : fact.label_en}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{language === 'ka' ? fact.value_ka : fact.value_en}</span>
                                            </div>
                                        </div>
                                     );
                                 })}
                             </div>
                         </AnimatedSection>
                     </div>
                 </div>
            </div>
            <SocialMediaSection /> {/* SocialMediaSection now appears *before* Gallery for Layout 4 */}
            <GallerySection />    {/* GallerySection moved below SocialMediaSection for Layout 4 */}
        </main>
      )}

      {/* --- LAYOUT 5: Gallery Focus (Top Info, Masonry Below) --- */}
      {layout === 'layout_5' && (
        <main className="pt-24 pb-0 container mx-auto px-4 lg:px-8">
            <div className="mb-12 border-b border-white/10 pb-12">
                <div className="flex justify-between items-start mb-8">
                    <BackButton />
                    <div className="hidden lg:block">{project.logo_url && <img src={project.logo_url} className="w-16 h-16 rounded-full border-2 border-white/20" alt="Logo" />}</div>
                </div>
                <div className="grid lg:grid-cols-2 gap-12">
                    <AnimatedSection>
                        <h1 className={`text-5xl lg:text-7xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>{title}</h1>
                        <ProjectHeader />
                    </AnimatedSection>
                    <AnimatedSection delay={0.2} className="flex flex-col justify-between">
                        <p className={`text-xl leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
                        <FeaturesList />
                        <div className="flex items-center gap-6 mt-8">
                            <VisitButton />
                            <div className="flex gap-2">
                                {Array.isArray(project.industry_ids) && project.industry_ids.map(id => {
                                    const ind = industriesMap[id];
                                    if(!ind) return null;
                                    const Icon = resolveIcon(ind.icon) || Briefcase;
                                    return <div key={id} className="p-2 rounded-full border border-white/10 text-gray-400" title={language==='ka'?ind.name_ka:ind.name_en}><Icon className="w-5 h-5" /></div>
                                })}
                            </div>
                        </div>
                         <TestimonialCard className="mt-8" />
                    </AnimatedSection>
                </div>
            </div>
            
            <SocialMediaSection /> {/* Moved SocialMediaSection here */}
            <GallerySection />    {/* GallerySection moved below SocialMediaSection */}
        </main>
      )}

      {/* --- LAYOUT 6: Modern Grid (Asymmetrical) --- */}
      {layout === 'layout_6' && (
        <main className="pt-24 pb-0 bg-[#0A0F1C]">
             <div className="container mx-auto px-4 lg:px-8 mb-20">
                <BackButton className="mb-12" />
                
                {/* Modern Grid Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                    <AnimatedSection className="lg:col-span-8 bg-[#0D1126] rounded-3xl p-8 lg:p-16 border border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-[#5468E7] font-bold tracking-widest uppercase mb-4 block">{category}</span>
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">{title}</h1>
                            <p className="text-gray-400 text-lg max-w-2xl">{description}</p>
                            <div className="mt-8">
                                <FeaturesList />
                            </div>
                            <TestimonialCard className="mt-12 w-full max-w-lg" />
                        </div>
                        {/* Abstract bg element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5468E7]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    </AnimatedSection>
                    <AnimatedSection delay={0.2} className="lg:col-span-4 space-y-6">
                        <div className="bg-[#151932] rounded-3xl p-8 border border-white/5 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Grid className="w-5 h-5 text-[#5468E7]" /> Project Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">Client Industry</span>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(project.industry_ids) && project.industry_ids.map(id => (
                                                <span key={id} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">{industriesMap[id]?.name_en}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">Type</span>
                                        <span className="text-white font-medium">{project.project_type === 'web' ? 'Web Development' : 'Social Media'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                {project.project_link && (
                                    <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                        View Live <ArrowRight className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>

             <SocialMediaSection /> {/* Moved SocialMediaSection here */}
             <GallerySection />    {/* GallerySection moved below SocialMediaSection */}
             </div>
        </main>
      )}

      <Footer />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" onClick={() => setSelectedImage(null)}><X className="w-8 h-8" /></button>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioDetailPage;
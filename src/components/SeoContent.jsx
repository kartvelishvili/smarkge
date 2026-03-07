import React from 'react';
import DOMPurify from 'dompurify';
import { useSeo } from '@/contexts/SeoContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Zap, Globe, Rocket, Monitor, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const SeoContent = ({ darkMode }) => {
  const { seoSettings } = useSeo();
  const { language } = useLanguage();
  const content = seoSettings.homepage_seo_content || {};

  // Check if there is any content to render (even if hidden)
  const hasContent = content.main_text_block || content.additional_text_block || (content.internal_links && content.internal_links.length > 0);

  if (!hasContent) {
    return null;
  }

  // Content configuration based on language
  const textContent = {
    en: {
      badge: "Your Digital Growth Partner",
      title_prefix: "Elevating Brands in",
      title_highlight: "Georgia & Beyond",
      description: "Smarketer is a premier full-service digital agency based in Tbilisi, dedicated to transforming businesses through innovative digital solutions. We combine local market expertise with global standards to deliver measurable results in web development, social media marketing, and brand strategy.",
      features: [
        { icon: Monitor, text: "Custom Web Development & UI/UX Design" },
        { icon: TrendingUp, text: "Data-Driven Digital Marketing Strategies" },
        { icon: Target, text: "Strategic Branding & Identity Creation" },
        { icon: Rocket, text: "Performance Marketing & SEO Optimization" }
      ],
      cta_primary: "Our Story",
      cta_secondary: "Get in Touch",
      stat_label: "Successful Projects",
      stat_value: "150+",
      stat_sub: "Driving Growth Since 2024"
    },
    ka: {
      badge: "თქვენი ციფრული პარტნიორი",
      title_prefix: "ვქმნით წარმატებულ ბრენდებს",
      title_highlight: " ",
      description: "Smarketer არის წამყვანი ციფრული სააგენტო თბილისში, რომელიც ორიენტირებულია ბიზნესების ტრანსფორმაციაზე ინოვაციური ციფრული გადაწყვეტილებებით. ჩვენ ვაერთიანებთ ადგილობრივი ბაზრის ცოდნას და გლობალურ სტანდარტებს, რათა შევქმნათ ხელშესახები შედეგები ვებ-დეველოპმენტში, სოციალურ მედია მარკეტინგსა და ბრენდინგში.",
      features: [
        { icon: Monitor, text: "ვებ-დეველოპმენტი და UI/UX დიზაინი" },
        { icon: TrendingUp, text: "მონაცემებზე დაფუძნებული მარკეტინგი" },
        { icon: Target, text: "სტრატეგიული ბრენდინგი და იდენტობა" },
        { icon: Rocket, text: "პერფორმანს მარკეტინგი და SEO ოპტიმიზაცია" }
      ],
      cta_primary: "ჩვენი ისტორია",
      cta_secondary: "დაგვიკავშირდით",
      stat_label: "წარმატებული პროექტი",
      stat_value: "150+",
      stat_sub: "ზრდაზე ორიენტირებული 2024 წლიდან"
    }
  };

  const t = textContent[language] || textContent.en;

  return (
    <>
      {/* Modern Visual "About Us" Section */}
      <section className={`py-20 lg:py-32 relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
        
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5468E7]/20 to-transparent" />
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none ${darkMode ? 'bg-[#5468E7]' : 'bg-blue-400'}`} />
        <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t pointer-events-none ${darkMode ? 'from-[#0A0F1C]' : 'from-white'} to-transparent`} />

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Visual Side (Image & Stats) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <div className="absolute inset-0 bg-[#5468E7]/10 mix-blend-overlay z-10 transition-opacity duration-500 group-hover:opacity-0" />
                  
                  {/* Main Image */}
                  <img 
                    className="w-full h-[400px] lg:h-[600px] object-cover transform transition-transform duration-1000 group-hover:scale-105" 
                    alt="Smarketer creative team working on digital strategy"
                    loading="lazy"
                    src="https://i.postimg.cc/qq8vmFZS/smarketer-office.webp" 
                    width="800"
                    height="600" 
                  />
                  
                  {/* Floating Glass Card - Stats */}
                  <div className={`
                    absolute bottom-6 left-6 right-6 lg:left-8 lg:right-auto lg:w-80 p-6 rounded-2xl backdrop-blur-xl border shadow-xl z-20
                    ${darkMode ? 'bg-[#0A0F1C]/80 border-white/10' : 'bg-white/90 border-white/40'}
                  `}>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#5468E7] flex items-center justify-center text-white shadow-lg shadow-[#5468E7]/30">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.stat_label}</p>
                        <p className={`text-2xl font-bold leading-none ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>{t.stat_value}</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.stat_sub}</p>
                      </div>
                    </div>
                  </div>
               </div>
               
               {/* Decorative Circle Behind */}
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-[#5468E7] to-purple-600 rounded-full blur-[80px] opacity-20 -z-10" />
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5468E7]/10 text-[#5468E7] text-sm font-bold mb-8">
                <Globe className="w-4 h-4" />
                <span className="uppercase tracking-wide text-xs">{t.badge}</span>
              </div>
              
              <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                {t.title_prefix} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5468E7] via-purple-500 to-[#5468E7]">
                  {t.title_highlight}
                </span>
              </h2>
              
              <p className={`text-lg lg:text-xl mb-10 leading-relaxed max-w-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.description}
              </p>
              
              <div className="space-y-5 mb-12">
                 {t.features.map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300
                        ${darkMode ? 'bg-[#5468E7]/10 text-[#5468E7] group-hover:bg-[#5468E7] group-hover:text-white' : 'bg-[#5468E7]/5 text-[#5468E7] group-hover:bg-[#5468E7] group-hover:text-white'}
                      `}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-base lg:text-lg font-medium ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-black'} transition-colors`}>
                        {item.text}
                      </span>
                   </div>
                 ))}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/about-us" 
                  className="group relative px-8 py-4 rounded-xl bg-[#5468E7] text-white font-semibold overflow-hidden shadow-lg shadow-[#5468E7]/25 hover:shadow-[#5468E7]/40 transition-all hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    {t.cta_primary}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`
                    px-8 py-4 rounded-xl font-semibold border transition-all hover:-translate-y-1
                    ${darkMode 
                      ? 'border-white/10 hover:bg-white/5 text-white hover:border-white/20' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  {t.cta_secondary}
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 
        HIDDEN SEO CONTENT 
        Preserved in DOM for crawlers but visually hidden from users.
      */}
      <div className="hidden" aria-hidden="true">
        {content.main_text_block && (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.main_text_block) }} />
        )}
        {content.additional_text_block && (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.additional_text_block) }} />
        )}
        {content.internal_links && content.internal_links.length > 0 && (
          <ul>
            {content.internal_links.map((link, idx) => (
              <li key={idx}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default SeoContent;
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Share2, Monitor, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveIcon } from '@/lib/iconMap';

const PortfolioCard = ({ project, industriesMap, language, darkMode, index = 0 }) => {
  const navigate = useNavigate();
  const title = language === 'ka' ? project.title_ka : project.title_en;
  const category = language === 'ka' ? project.category_ka : project.category_en;
  
  // Resolve icons for industries
  // Checks 'Associated Industries' first, then falls back to 'industry_ids'
  const rawIndustries = project['Associated Industries'] || project.industry_ids || [];
  const projectIndustries = (Array.isArray(rawIndustries) ? rawIndustries : [])
    .map(id => industriesMap[id])
    .filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative cursor-pointer"
      onClick={() => navigate(`/portfolio/${project.slug || '#'}`)}
    >
        {/* Glow Effect behind card */}
        <div className={`
            absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-md
        `} />

        {/* Main Card Container */}
        <div className={`
            relative flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300
            ${darkMode 
                ? 'bg-[#121629] border-white/5 group-hover:bg-[#161b33]' 
                : 'bg-white border-gray-100 shadow-sm group-hover:shadow-xl'
            }
        `}>
            
            {/* Image Container - Compact Aspect Ratio */}
            <div className="relative h-48 sm:h-52 overflow-hidden">
                <img 
                    src={project.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Modern Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/90 via-[#0A0F1C]/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                
                {/* Floating Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg
                        ${darkMode 
                            ? 'bg-black/40 text-white' 
                            : 'bg-white/80 text-gray-900'
                        }
                    `}>
                        {category}
                    </span>
                </div>

                {/* Type Icon/Badge (Top Right) */}
                 <div className="absolute top-3 right-3 z-10">
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg
                        ${project.project_type === 'social_media' 
                            ? 'bg-purple-500/80 text-white' 
                            : 'bg-blue-500/80 text-white'
                        }
                    `}>
                        {project.project_type === 'social_media' 
                            ? <Share2 className="w-4 h-4" /> 
                            : <Monitor className="w-4 h-4" />
                        }
                    </div>
                </div>
            </div>

            {/* Content Section - Compact & Clean */}
            <div className="flex flex-col flex-grow p-5 relative">
                
                {/* Optional Floating Logo */}
                {project.logo_url && (
                    <div className="absolute -top-6 right-5 w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-white/20 z-20 bg-white">
                         <img src={project.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="mb-auto pr-10">
                    <h3 className={`text-lg font-bold line-clamp-1 mb-2 transition-colors group-hover:text-blue-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                </div>

                {/* Industries / Tags - Compact Row */}
                <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-white/5">
                     {projectIndustries.slice(0, 3).map((ind, i) => {
                        const Icon = resolveIcon(ind.icon) || Briefcase;
                        return (
                            <div 
                                key={i} 
                                className={`
                                    flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide
                                    ${darkMode 
                                        ? 'bg-white/5 text-gray-400 border border-white/5' 
                                        : 'bg-gray-50 text-gray-500 border border-gray-100'
                                    }
                                `}
                            >
                                <Icon className="w-3 h-3 opacity-70" />
                                <span className="line-clamp-1 max-w-[80px]">{language === 'ka' ? ind.name_ka : ind.name_en}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Hover Reveal Action */}
                <div className={`
                    absolute bottom-5 right-5 w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100
                    ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
                `}>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default PortfolioCard;
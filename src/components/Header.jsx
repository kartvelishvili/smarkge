import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Globe, Sun, Moon, ChevronDown, 
  Monitor, Share2, HeartPulse, Building2, ShoppingBag, 
  GraduationCap, Plane, Briefcase, Info, Newspaper,
  Phone, ArrowRight, Layers
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/customSupabaseClient';
import { resolveIcon } from '@/lib/iconMap';

// --- Fallback data used when DB is empty or fetch fails ---
const FALLBACK_MENU = [
  {
    key: 'services',
    label_en: 'Services',
    label_ka: 'სერვისები',
    type: 'dropdown',
    link: '/services',
    items: [
      { link: '/web-design', label_en: 'Web Design', label_ka: 'ვებ დიზაინი', icon: 'Monitor' },
      { link: '/social-media', label_en: 'Social Media', label_ka: 'სოც.მედია', icon: 'Share2' }
    ]
  },
  {
    key: 'industries',
    label_en: 'Industries',
    label_ka: 'ინდუსტრიები',
    type: 'dropdown',
    items: [
      { link: '/industry/healthcare', label_en: 'Healthcare', label_ka: 'ჯანდაცვა', icon: 'HeartPulse' },
      { link: '/industry/real-estate', label_en: 'Real Estate', label_ka: 'უძრავი ქონება', icon: 'Building2' },
      { link: '/industry/ecommerce', label_en: 'E-commerce', label_ka: 'ელ-კომერცია', icon: 'ShoppingBag' },
      { link: '/industry/education', label_en: 'Education', label_ka: 'განათლება', icon: 'GraduationCap' },
      { link: '/industry/tourism', label_en: 'Hospitality & Tourism', label_ka: 'ტურიზმი', icon: 'Plane' },
      { link: '/industry/b2b', label_en: 'B2B Services', label_ka: 'B2B სერვისები', icon: 'Briefcase' }
    ]
  },
  {
    key: 'portfolio',
    label_en: 'Portfolio',
    label_ka: 'პორტფოლიო',
    link: '/portfolio',
    type: 'link'
  },
  {
    key: 'about',
    label_en: 'About Us',
    label_ka: 'ჩვენ შესახებ',
    type: 'dropdown',
    items: [
      { link: '/about-us', label_en: 'About Company', label_ka: 'კომპანიის შესახებ', icon: 'Info' },
      { link: '/news', label_en: 'News', label_ka: 'სიახლეები', icon: 'Newspaper' }
    ]
  },
  {
    key: 'contact',
    label_en: 'Contact',
    label_ka: 'კონტაქტი',
    link: '/contact',
    type: 'link'
  }
];

const FALLBACK_LOGO = "https://i.postimg.cc/fy2TmQbM/smark'et'eri.png";
const FALLBACK_CTA = { text_en: '500 70 20 80', text_ka: '500 70 20 80', link: 'https://wa.me/995500702080', visible: true };

/**
 * Normalizes DB menu_items (flat list from admin) into the nested menuStructure
 * format used for rendering, merging with fallback for dropdown sub-items.
 * 
 * Admin stores flat items: { id, label_en, label_ka, link }
 * Frontend needs: { key, label_en, label_ka, type, link, items[] }
 * 
 * Strategy: If DB has items, use them as top-level links. 
 * If a DB item's link matches a fallback dropdown parent (e.g. /services),
 * attach the dropdown's sub-items from the fallback.
 */
const normalizeMenuItems = (dbItems) => {
  if (!Array.isArray(dbItems) || dbItems.length === 0) return FALLBACK_MENU;

  // Build a lookup of fallback items by their link or key
  const fallbackByLink = {};
  const fallbackByKey = {};
  FALLBACK_MENU.forEach(item => {
    if (item.link) fallbackByLink[item.link] = item;
    fallbackByKey[item.key] = item;
  });

  return dbItems.map((dbItem, idx) => {
    const link = dbItem.link || '/';
    const key = dbItem.id || `menu-${idx}`;
    
    // Check if this matches a known dropdown parent
    const matchedFallback = fallbackByLink[link] || 
      Object.values(fallbackByKey).find(fb => 
        fb.items?.some(sub => sub.link === link)
      );

    // If the DB item matches a dropdown parent, render as dropdown with sub-items
    if (matchedFallback && matchedFallback.type === 'dropdown' && matchedFallback.link === link) {
      return {
        key,
        label_en: dbItem.label_en || matchedFallback.label_en,
        label_ka: dbItem.label_ka || matchedFallback.label_ka,
        type: 'dropdown',
        link: matchedFallback.link,
        items: matchedFallback.items
      };
    }

    // If there's a fallback with the same key/link that's a dropdown without a direct link
    const keyMatch = fallbackByKey[dbItem.label_en?.toLowerCase()?.replace(/\s+/g, '')] ||
      FALLBACK_MENU.find(fb => 
        fb.label_en?.toLowerCase() === dbItem.label_en?.toLowerCase() ||
        fb.label_ka === dbItem.label_ka
      );
    
    if (keyMatch && keyMatch.type === 'dropdown') {
      return {
        key,
        label_en: dbItem.label_en || keyMatch.label_en,
        label_ka: dbItem.label_ka || keyMatch.label_ka,
        type: 'dropdown',
        link: keyMatch.link || undefined,
        items: keyMatch.items
      };
    }

    // Default: render as simple link
    return {
      key,
      label_en: dbItem.label_en || 'Link',
      label_ka: dbItem.label_ka || 'ბმული',
      link,
      type: 'link'
    };
  });
};

const Header = ({ alwaysOpaque = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [menuStructure, setMenuStructure] = useState(FALLBACK_MENU);
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
  const [ctaButton, setCtaButton] = useState(FALLBACK_CTA);
  
  const { language, setLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  // Fetch header settings from DB
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          // Menu items
          if (Array.isArray(data.menu_items) && data.menu_items.length > 0) {
            setMenuStructure(normalizeMenuItems(data.menu_items));
          }
          // Logo
          const isDark = darkMode;
          const dbLogo = isDark ? (data.logo_dark || data.logo_light) : (data.logo_light || data.logo_dark);
          if (dbLogo) setLogoUrl(dbLogo);
          // CTA
          if (data.cta_button && typeof data.cta_button === 'object') {
            setCtaButton(prev => ({ ...prev, ...data.cta_button }));
          }
        }
      } catch (err) {
        console.warn('Header: using fallback data due to fetch error:', err.message);
      }
    };

    fetchHeaderSettings();

    // Realtime subscription
    const channel = supabase
      .channel('header_settings_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'header_settings' }, () => {
        fetchHeaderSettings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setHoveredMenu(null);
    setActiveMobileDropdown(null);
  }, [location.pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ka' : 'en');
  };

  const isDark = darkMode;

  // CTA label & link from DB
  const ctaLabel = language === 'ka' ? ctaButton.text_ka : ctaButton.text_en;
  const ctaLink = ctaButton.link || 'https://wa.me/995500702080';
  const ctaIsExternal = ctaLink.startsWith('http') || ctaLink.startsWith('tel:');

  // Unified font class for BPG Nateli Mtavruli
  const fontClass = "font-nateli tracking-wide"; 

  // Helper for consistent menu styling
  const getMenuButtonClass = (isActive, type) => {
    // Dynamic font weight: always bold as requested
    const fontWeight = 'font-bold';
    
    const base = `text-[12px] lg:text-[13px] ${fontWeight} uppercase transition-all px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer select-none`;
    
    if (isDark) {
      return `${base} ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`;
    }
    return `${base} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'}`;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          (scrolled || alwaysOpaque || mobileMenuOpen)
            ? isDark 
              ? 'bg-[#0A0F1C]/95 backdrop-blur-md border-white/5 shadow-lg' 
              : 'bg-white/95 backdrop-blur-md border-gray-100 shadow-md'
            : isDark 
              ? 'bg-[#0A0F1C]/80 backdrop-blur-sm border-transparent' 
              : 'bg-white/80 backdrop-blur-sm border-transparent'
        } h-[80px]`}
      >
        <div className="container mx-auto px-4 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Area */}
            <div className="flex items-center shrink-0">
               <Link to="/" className="relative z-50 block transition-transform hover:scale-105 active:scale-95 duration-200">
                  <img src={logoUrl} alt="Smarketer Logo" className="h-8 lg:h-9 w-auto object-contain" />
               </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden lg:flex items-center gap-2 ${fontClass}`}>
              {menuStructure.map((item) => (
                <div 
                  key={item.key} 
                  className="relative group"
                  onMouseEnter={() => item.type === 'dropdown' && setHoveredMenu(item.key)}
                  onMouseLeave={() => item.type === 'dropdown' && setHoveredMenu(null)}
                >
                  {item.type === 'link' ? (
                    <Link
                      to={item.link}
                      className={getMenuButtonClass(location.pathname === item.link, item.type)}
                    >
                      {language === 'ka' ? item.label_ka : item.label_en}
                    </Link>
                  ) : (
                    <>
                        {item.link ? (
                            <Link
                                to={item.link}
                                className={getMenuButtonClass(hoveredMenu === item.key || location.pathname === item.link || item.items.some(sub => location.pathname.startsWith(sub.link)), item.type)}
                            >
                                {language === 'ka' ? item.label_ka : item.label_en}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMenu === item.key ? 'rotate-180' : ''}`} />
                            </Link>
                        ) : (
                            <button
                                className={getMenuButtonClass(hoveredMenu === item.key, item.type)}
                            >
                                {language === 'ka' ? item.label_ka : item.label_en}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hoveredMenu === item.key ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </>
                  )}

                  {/* Desktop Dropdown */}
                  <AnimatePresence>
                    {hoveredMenu === item.key && item.type === 'dropdown' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-max min-w-[240px] max-w-[500px] z-50`}
                      >
                         <div className={`rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden p-2 backdrop-blur-xl ${
                           isDark 
                            ? 'bg-[#0F1629]/95 border border-white/10 shadow-black/50' 
                            : 'bg-white/95 border border-gray-100 shadow-blue-900/10'
                         }`}>
                           <div className={`grid gap-1 ${item.items.length > 4 ? 'grid-cols-2 min-w-[420px]' : 'grid-cols-1'}`}>
                             {item.items.map((subItem) => (
                               <Link
                                 key={subItem.link}
                                 to={subItem.link}
                                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group/item ${
                                   isDark 
                                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                                    : 'hover:bg-blue-50 text-gray-600 hover:text-blue-700'
                                 }`}
                               >
                                 <div className={`p-2 rounded-lg transition-colors shadow-sm ${
                                   isDark
                                    ? 'bg-white/5 text-gray-400 group-hover/item:bg-blue-500 group-hover/item:text-white'
                                    : 'bg-white text-blue-500 group-hover/item:bg-blue-600 group-hover/item:text-white shadow-gray-200'
                                 }`}>
                                    {(() => { const Icon = typeof subItem.icon === 'string' ? resolveIcon(subItem.icon) : (subItem.icon || Phone); return <Icon className="w-4 h-4" />; })()}
                                 </div>
                                 <span className="text-[12px] font-bold uppercase whitespace-nowrap font-nateli">
                                   {language === 'ka' ? subItem.label_ka : subItem.label_en}
                                 </span>
                               </Link>
                             ))}
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className={`hidden lg:flex items-center gap-4 ${fontClass}`}>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-200 dark:border-white/10">
                <button
                  onClick={toggleLanguage}
                  className={`px-3 h-8 rounded-full transition-all flex items-center justify-center gap-1.5 hover:bg-white dark:hover:bg-white/10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold mt-0.5">
                    {/* If KA, show EN. If EN, show GE */}
                    {language === 'ka' ? 'EN' : 'GE'}
                  </span>
                </button>

                <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-1" />

                <button
                  onClick={toggleTheme}
                  className={`w-8 h-8 rounded-full transition-all flex items-center justify-center hover:bg-white dark:hover:bg-white/10 ${
                    isDark ? 'text-yellow-400' : 'text-blue-600'
                  }`}
                  title="Toggle Theme"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {ctaButton.visible !== false && (
                ctaIsExternal ? (
                  <a 
                    href={ctaLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white pl-5 pr-6 py-2.5 rounded-full transition-all hover:shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 border border-blue-500/20"
                  >
                    <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[14px] font-bold tracking-wider">{ctaLabel}</span>
                  </a>
                ) : (
                  <Link 
                    to={ctaLink}
                    className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white pl-5 pr-6 py-2.5 rounded-full transition-all hover:shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 border border-blue-500/20"
                  >
                    <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[14px] font-bold tracking-wider">{ctaLabel}</span>
                  </Link>
                )
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl relative z-50 transition-all active:scale-95 ${
                isDark ? 'text-gray-300 hover:text-white bg-white/5' : 'text-gray-700 hover:text-black bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay - Portal/Absolute Positioning */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "tween", duration: 0.2 }}
              className={`absolute top-[80px] left-0 right-0 h-[calc(100vh-80px)] overflow-y-auto z-40 ${
                isDark ? 'bg-[#0A0F1C]' : 'bg-white'
              } ${fontClass}`}
            >
              <div className="flex flex-col p-6 space-y-4 pb-32 min-h-full">
                {menuStructure.map((item, i) => (
                  <motion.div 
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl overflow-hidden border ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50/50 border-gray-100'
                    }`}
                  >
                    {item.type === 'link' ? (
                      <Link
                        to={item.link}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-5 font-bold text-[13px] uppercase ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {language === 'ka' ? item.label_ka : item.label_en}
                        <ArrowRight className={`w-4 h-4 opacity-50`} />
                      </Link>
                    ) : (
                      <div>
                        {/* Mobile: If item has link, show Split Button (Link | Toggle) */}
                        {item.link ? (
                            <div className={`w-full flex items-center justify-between font-bold text-[13px] uppercase transition-colors ${
                                isDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-800 hover:bg-gray-100'
                            }`}>
                                <Link 
                                    to={item.link}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex-grow p-5"
                                >
                                    {language === 'ka' ? item.label_ka : item.label_en}
                                </Link>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveMobileDropdown(activeMobileDropdown === item.key ? null : item.key);
                                    }}
                                    className={`p-5 h-full flex items-center justify-center border-l ${
                                        isDark ? 'border-white/10 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-200'
                                    }`}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeMobileDropdown === item.key ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        ) : (
                             <button
                                onClick={() => setActiveMobileDropdown(activeMobileDropdown === item.key ? null : item.key)}
                                className={`w-full flex items-center justify-between p-5 font-bold text-[13px] uppercase transition-colors ${
                                  isDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-800 hover:bg-gray-100'
                                } ${activeMobileDropdown === item.key ? (isDark ? 'bg-white/5' : 'bg-gray-100') : ''}`}
                              >
                                {language === 'ka' ? item.label_ka : item.label_en}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeMobileDropdown === item.key ? 'rotate-180' : ''}`} />
                              </button>
                        )}
                        
                        <AnimatePresence>
                          {activeMobileDropdown === item.key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-black/5 dark:bg-black/20"
                            >
                              <div className="p-2 grid gap-1">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.link}
                                    to={subItem.link}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                                      isDark 
                                        ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                                        : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                      {(() => { const Icon = typeof subItem.icon === 'string' ? resolveIcon(subItem.icon) : (subItem.icon || Phone); return <Icon className="w-4 h-4" />; })()}
                                    </div>
                                    <span className="text-[12px] font-bold uppercase">{language === 'ka' ? subItem.label_ka : subItem.label_en}</span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}

                <div className="mt-auto pt-8 flex flex-col gap-4">
{ctaButton.visible !== false && (
                    ctaIsExternal ? (
                    <a 
                    href={ctaLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl font-bold w-full shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
                  >
                    <div className="bg-white/20 p-1.5 rounded-full">
                       <Phone className="w-5 h-5" />
                    </div>
                    <span className="tracking-wide text-lg">{ctaLabel}</span>
                  </a>
                  ) : (
                    <Link 
                    to={ctaLink}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl font-bold w-full shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
                  >
                    <div className="bg-white/20 p-1.5 rounded-full">
                       <Phone className="w-5 h-5" />
                    </div>
                    <span className="tracking-wide text-lg">{ctaLabel}</span>
                  </Link>
                  )
                    )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={toggleLanguage}
                      className={`py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[12px] uppercase border ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-gray-300 active:bg-white/10' 
                          : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      {/* Mobile Switcher: If KA, show EN. If EN, show GE */}
                      <span>{language === 'ka' ? 'EN' : 'GE'}</span>
                    </button>

                    <button
                      onClick={toggleTheme}
                      className={`py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[12px] uppercase border ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-gray-300 active:bg-white/10' 
                          : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'
                      }`}
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4" />
                          <span>Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          <span>Dark</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
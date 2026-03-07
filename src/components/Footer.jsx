import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube, MessageCircle, Dribbble, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import OxoCounter from '@/components/OxoCounter';

// --- Social icon resolver ---
const SOCIAL_ICON_MAP = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
  behance: Dribbble,
};

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const resolveSocialIcon = (platform) => {
  if (!platform) return Globe;
  const key = platform.toLowerCase();
  if (key === 'tiktok') return TikTokIcon;
  return SOCIAL_ICON_MAP[key] || Globe;
};

const SOCIAL_COLORS = {
  facebook: 'hover:bg-[#1877F2]',
  instagram: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]',
  linkedin: 'hover:bg-[#0077B5]',
  youtube: 'hover:bg-[#FF0000]',
  whatsapp: 'hover:bg-[#25D366]',
  tiktok: 'hover:bg-black dark:hover:bg-white dark:hover:text-black',
  behance: 'hover:bg-[#1769FF]',
  twitter: 'hover:bg-[#1DA1F2]',
};

// --- Fallback data ---
const FALLBACK_FOOTER = {
  logo_url: '',
  description_en: 'We are a digital agency focused on delivering content and utility user-experiences.',
  description_ka: 'ჩვენ ვართ ციფრული სააგენტო, რომელიც ორიენტირებულია საუკეთესო გამოცდილების შექმნაზე.',
  copyright_text_en: `© ${new Date().getFullYear()} Smarketer. All rights reserved.`,
  copyright_text_ka: `© ${new Date().getFullYear()} Smarketer. ყველა უფლება დაცულია.`,
  contact_info: {
    email: 'info@smarketer.ge',
    phone: '+995 500 70 20 80',
    address_en: 'Tbilisi, Georgia',
    address_ka: 'თბილისი, საქართველო'
  },
  sections: [
    {
      title_en: 'Navigation', title_ka: 'ნავიგაცია',
      links: [
        { name_en: 'Home', name_ka: 'მთავარი', href: '/' },
        { name_en: 'About Us', name_ka: 'ჩვენს შესახებ', href: '/about-us' },
        { name_en: 'Services', name_ka: 'სერვისები', href: '/web-design' },
        { name_en: 'Portfolio', name_ka: 'პორტფოლიო', href: '/portfolio' },
        { name_en: 'News & Blog', name_ka: 'ბლოგი', href: '/news' },
        { name_en: 'Contact', name_ka: 'კონტაქტი', href: '/contact' },
        { name_en: 'Site Map', name_ka: 'საიტის რუკა', href: '/sitemap' }
      ]
    },
    {
      title_en: 'Services', title_ka: 'სერვისები',
      links: [
        { name_en: 'Web Design', name_ka: 'ვებ დიზაინი', href: '/web-design' },
        { name_en: 'Social Media', name_ka: 'სოციალური მედია', href: '/social-media' },
        { name_en: 'SEO Optimization', name_ka: 'SEO ოპტიმიზაცია', href: '/web-design' },
        { name_en: 'Branding', name_ka: 'ბრენდინგი', href: '/portfolio' }
      ]
    }
  ],
  social_links: [
    { platform: 'Facebook', url: 'https://www.facebook.com/smarketeri' },
    { platform: 'Instagram', url: 'https://www.instagram.com/smarketer.georgia' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/104962757' },
    { platform: 'YouTube', url: 'https://www.youtube.com/@SmarketerGE' },
    { platform: 'WhatsApp', url: 'https://wa.me/995500702080' },
    { platform: 'TikTok', url: 'https://www.tiktok.com/@smarketer.ge' },
    { platform: 'Behance', url: 'https://www.behance.net/smarketer' }
  ]
};

const FALLBACK_LOGO_URL = "https://lekwouwaajnnjhoomyrc.supabase.co/storage/v1/object/public/portfolio/footer_logo_1765739450441.png";

const Footer = () => {
  const { language, t } = useLanguage();
  const { darkMode } = useTheme();
  
  const [footerData, setFooterData] = useState(FALLBACK_FOOTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
    const channel = supabase
      .channel('footer_public_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_settings' }, () => fetchFooterData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchFooterData = async () => {
    try {
      const { data, error } = await supabase.from('footer_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        // Normalize sections from DB
        // Admin saves sections in `navigation_links` column (or `sections` if available)
        let sections = data.sections || [];
        if (sections.length === 0 && Array.isArray(data.navigation_links)) {
          // Adapter: navigation_links might contain the new sections format
          const navLinks = data.navigation_links;
          if (navLinks.length > 0 && navLinks[0]?.title_en) {
            // New format: [{title_en, title_ka, links[]}]
            sections = navLinks;
          } else if (navLinks.length > 0 && navLinks[0]?.name_en) {
            // Old format: flat array of links — wrap in a section
            sections = [{ title_en: 'Navigation', title_ka: 'ნავიგაცია', links: navLinks }];
            if (Array.isArray(data.services_links) && data.services_links.length > 0) {
              sections.push({ title_en: 'Services', title_ka: 'სერვისები', links: data.services_links });
            }
          }
        }

        // Normalize social links — filter out empty URLs
        let socialLinks = Array.isArray(data.social_links) ? data.social_links.filter(s => s?.url) : [];

        setFooterData({
          logo_url: data.logo_url || '',
          description_en: data.description_en || FALLBACK_FOOTER.description_en,
          description_ka: data.description_ka || FALLBACK_FOOTER.description_ka,
          copyright_text_en: data.copyright_text_en || FALLBACK_FOOTER.copyright_text_en,
          copyright_text_ka: data.copyright_text_ka || FALLBACK_FOOTER.copyright_text_ka,
          contact_info: data.contact_info && typeof data.contact_info === 'object' ? data.contact_info : FALLBACK_FOOTER.contact_info,
          sections: sections.length > 0 ? sections : FALLBACK_FOOTER.sections,
          social_links: socialLinks.length > 0 ? socialLinks : FALLBACK_FOOTER.social_links,
        });
      }
    } catch (error) {
      console.warn('Footer: using fallback data due to fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = footerData.logo_url || FALLBACK_LOGO_URL;
  const description = language === 'ka' ? footerData.description_ka : footerData.description_en;
  const copyrightText = language === 'ka' ? footerData.copyright_text_ka : footerData.copyright_text_en;
  const contactInfo = footerData.contact_info || {};
  const sections = footerData.sections || [];
  const socialLinks = footerData.social_links || [];

  // Calculate grid columns for sections (max 2 link sections beside contact)
  const linkSections = sections.slice(0, 3);

  return (
    <footer className={`relative overflow-hidden pt-20 pb-10 ${darkMode ? 'bg-[#050812]' : 'bg-[#F8FAFC]'}`}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5468E7] to-transparent opacity-50"></div>
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[128px] opacity-10 pointer-events-none ${darkMode ? 'bg-[#5468E7]' : 'bg-blue-400'}`}></div>
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[128px] opacity-10 pointer-events-none ${darkMode ? 'bg-purple-600' : 'bg-purple-400'}`}></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block group">
               <img 
                 src={logoSrc} 
                 alt="Smarketer Logo" 
                 loading="lazy"
                 width="160"
                 height="48"
                 className="h-12 object-contain transition-transform duration-300 group-hover:scale-105" 
               />
            </Link>
            
            <p className={`text-base leading-relaxed max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>

            {/* Social Links from DB */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, idx) => {
                const Icon = resolveSocialIcon(social.platform);
                const colorClass = SOCIAL_COLORS[social.platform?.toLowerCase()] || 'hover:bg-gray-600';
                return (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${darkMode 
                        ? 'bg-white/5 text-gray-400 hover:text-white' 
                        : 'bg-white text-gray-500 hover:text-white shadow-sm hover:shadow-lg'
                      }
                      ${colorClass}
                      hover:-translate-y-1
                    `}
                    aria-label={social.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* OXO.ge Counter */}
            <div className="mt-4">
              <OxoCounter siteId="54" style="1" color="#6366f1" />
            </div>
          </div>

          {/* Dynamic Link Sections from DB */}
          {linkSections.map((section, sIdx) => (
            <div key={sIdx} className={`lg:col-span-2 ${sIdx === 0 ? 'lg:col-start-6' : ''}`}>
              <h3 className={`font-bold text-lg mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                {language === 'ka' ? section.title_ka : section.title_en}
              </h3>
              <ul className="space-y-4">
                {(section.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.href || '#'} 
                      className={`
                        group flex items-center gap-2 text-sm font-medium transition-all
                        ${darkMode ? 'text-gray-400 hover:text-[#5468E7]' : 'text-gray-600 hover:text-[#5468E7]'}
                      `}
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#5468E7] transition-all duration-300"></span>
                      {language === 'ka' ? link.name_ka : link.name_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className={`lg:col-span-3 ${linkSections.length === 0 ? 'lg:col-start-6' : ''}`}>
            <h3 className={`font-bold text-lg mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
              {language === 'ka' ? 'კონტაქტი' : 'Contact'}
            </h3>
            <ul className="space-y-5">
              {contactInfo.email && (
              <li>
                <a href={`mailto:${contactInfo.email}`} className="group flex items-start gap-4">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'bg-white/5 group-hover:bg-[#5468E7]/20 text-[#5468E7]' : 'bg-gray-100 group-hover:bg-[#5468E7]/10 text-[#5468E7]'}
                  `}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'ka' ? 'ელ-ფოსტა' : 'Email'}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-[#0A0F1C]'} transition-colors`}>
                      {contactInfo.email}
                    </span>
                  </div>
                </a>
              </li>
              )}
              {contactInfo.phone && (
              <li>
                <a href={`tel:${contactInfo.phone}`} className="group flex items-start gap-4">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'bg-white/5 group-hover:bg-[#5468E7]/20 text-[#5468E7]' : 'bg-gray-100 group-hover:bg-[#5468E7]/10 text-[#5468E7]'}
                  `}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'ka' ? 'ტელეფონი' : 'Phone'}
                    </span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-[#0A0F1C]'} transition-colors`}>
                      {contactInfo.phone}
                    </span>
                  </div>
                </a>
              </li>
              )}
              {(contactInfo.address_en || contactInfo.address_ka) && (
              <li>
                <div className="group flex items-start gap-4">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'bg-white/5 text-[#5468E7]' : 'bg-gray-100 text-[#5468E7]'}
                  `}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'ka' ? 'მისამართი' : 'Address'}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'ka' ? (contactInfo.address_ka || contactInfo.address_en) : (contactInfo.address_en || contactInfo.address_ka)}
                    </span>
                  </div>
                </div>
              </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`
          pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4
          ${darkMode ? 'border-white/5' : 'border-gray-200'}
        `}>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {copyrightText}
          </p>
          
          <div className="flex items-center gap-6">
             <Link to="/privacy" className={`text-sm transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-[#0A0F1C]'}`}>
               {language === 'ka' ? 'კონფიდენციალურობა' : 'Privacy Policy'}
             </Link>
             <Link to="/terms" className={`text-sm transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-[#0A0F1C]'}`}>
               {language === 'ka' ? 'წესები და პირობები' : 'Terms & Conditions'}
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
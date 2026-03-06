import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, AlertCircle, Gavel, UserCheck, RefreshCw, Mail, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePageContent } from '@/hooks/usePageContent';

const TermsPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('terms');
  const { content: pc } = usePageContent('terms', {});

  // ICON_MAP for section icons (icons can't be stored in DB)
  const ICON_MAP = { terms: FileText, responsibilities: UserCheck, intellectual: Scale, liability: AlertCircle, modifications: RefreshCw, governing: Gavel, contact: Mail };

  // Content Data
  const defaults = {
    en: {
      title: "Terms & Conditions",
      subtitle: "Please read these terms carefully before using our services.",
      lastUpdated: "Last Updated: January 4, 2026",
      sections: [
        {
          id: 'terms',
          icon: FileText,
          title: "1. Terms of Service",
          content: "By accessing the website at https://smarketer.ge, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
        },
        {
          id: 'responsibilities',
          icon: UserCheck,
          title: "2. User Responsibilities",
          content: "As a user of our services, you agree to use our website and services only for lawful purposes. You are strictly prohibited from:\n• Using the service for any illegal or unauthorized purpose.\n• Attempting to hack, destabilize or adapt our website.\n• Transmitting any worms or viruses or any code of a destructive nature."
        },
        {
          id: 'intellectual',
          icon: Scale,
          title: "3. Intellectual Property",
          content: "The materials contained in this website are protected by applicable copyright and trademark law. All content, designs, graphics, and code are the property of Smarketer LLC unless otherwise stated. Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only."
        },
        {
          id: 'liability',
          icon: AlertCircle,
          title: "4. Limitation of Liability",
          content: "In no event shall Smarketer or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Smarketer's website, even if Smarketer or a Smarketer authorized representative has been notified orally or in writing of the possibility of such damage."
        },
        {
          id: 'modifications',
          icon: RefreshCw,
          title: "5. Modifications to Terms",
          content: "Smarketer may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service. We reserve the right to update or change our Terms & Conditions at any time and you should check this page periodically."
        },
        {
          id: 'governing',
          icon: Gavel,
          title: "6. Governing Law",
          content: "These terms and conditions are governed by and construed in accordance with the laws of Georgia and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location."
        },
        {
          id: 'contact',
          icon: Mail,
          title: "7. Contact Us",
          content: "If you have any questions about these Terms & Conditions, please contact us at:\nEmail: info@smarketer.ge\nPhone: +995 500 70 20 80\nAddress: Tbilisi, Georgia"
        }
      ]
    },
    ka: {
      title: "წესები და პირობები",
      subtitle: "გთხოვთ, ყურადღებით გაეცნოთ ჩვენი მომსახურების პირობებს.",
      lastUpdated: "ბოლო განახლება: 4 იანვარი, 2026",
      sections: [
        {
          id: 'terms',
          icon: FileText,
          title: "1. მომსახურების პირობები",
          content: "ვებ-გვერდზე https://smarketer.ge წვდომით, თქვენ ეთანხმებით აღნიშნულ წესებსა და პირობებს, ყველა მოქმედ კანონს და რეგულაციას. თუ არ ეთანხმებით რომელიმე პირობას, გთხოვთ შეწყვიტოთ ვებ-გვერდით სარგებლობა."
        },
        {
          id: 'responsibilities',
          icon: UserCheck,
          title: "2. მომხმარებლის პასუხისმგებლობა",
          content: "როგორც მომხმარებელი, თქვენ ვალდებული ხართ გამოიყენოთ ჩვენი სერვისები მხოლოდ კანონიერი მიზნებისთვის. მკაცრად იკრძალება:\n• სერვისის გამოყენება ნებისმიერი უკანონო მიზნით.\n• ვებ-გვერდის გატეხვის, დესტაბილიზაციის ან ადაპტაციის მცდელობა.\n• ვირუსების ან მავნე კოდის გავრცელება."
        },
        {
          id: 'intellectual',
          icon: Scale,
          title: "3. ინტელექტუალური საკუთრება",
          content: "ამ ვებ-გვერდზე განთავსებული მასალები დაცულია საავტორო უფლებებით. ყველა კონტენტი, დიზაინი, გრაფიკა და კოდი არის შპს სმარკეტერის საკუთრება, თუ სხვა რამ არ არის მითითებული. დაშვებულია მასალების მხოლოდ დროებითი ჩამოტვირთვა პირადი, არაკომერციული მიზნებისთვის."
        },
        {
          id: 'liability',
          icon: AlertCircle,
          title: "4. პასუხისმგებლობის შეზღუდვა",
          content: "Smarketer არ არის პასუხისმგებელი რაიმე სახის ზიანზე (მათ შორის, მონაცემების ან მოგების დაკარგვაზე), რომელიც შეიძლება გამოწვეული იყოს ვებ-გვერდის გამოყენებით ან გამოყენების შეუძლებლობით, მაშინაც კი, თუ კომპანია ინფორმირებული იყო მსგავსი ზიანის შესაძლებლობის შესახებ."
        },
        {
          id: 'modifications',
          icon: RefreshCw,
          title: "5. ცვლილებები პირობებში",
          content: "Smarketer უფლებას იტოვებს ნებისმიერ დროს, წინასწარი შეტყობინების გარეშე შეცვალოს მომსახურების პირობები. ვებ-გვერდის გამოყენების გაგრძელება ნიშნავს, რომ თქვენ ეთანხმებით განახლებულ პირობებს. გირჩევთ პერიოდულად შეამოწმოთ ეს გვერდი."
        },
        {
          id: 'governing',
          icon: Gavel,
          title: "6. მარეგულირებელი კანონმდებლობა",
          content: "აღნიშნული წესები და პირობები რეგულირდება საქართველოს კანონმდებლობით და თქვენ ექვემდებარებით საქართველოს სასამართლოების იურისდიქციას."
        },
        {
          id: 'contact',
          icon: Mail,
          title: "7. დაგვიკავშირდით",
          content: "თუ გაქვთ კითხვები წესებთან და პირობებთან დაკავშირებით, დაგვიკავშირდით:\nელ-ფოსტა: info@smarketer.ge\nტელეფონი: +995 500 70 20 80\nმისამართი: თბილისი, საქართველო"
        }
      ]
    }
  };

  // Merge DB content over defaults
  const content = { en: { ...defaults.en }, ka: { ...defaults.ka } };
  if (pc.title_en) content.en.title = pc.title_en;
  if (pc.title_ka) content.ka.title = pc.title_ka;
  if (pc.subtitle_en) content.en.subtitle = pc.subtitle_en;
  if (pc.subtitle_ka) content.ka.subtitle = pc.subtitle_ka;
  if (pc.last_updated_en) content.en.lastUpdated = pc.last_updated_en;
  if (pc.last_updated_ka) content.ka.lastUpdated = pc.last_updated_ka;
  if (pc.sections && Array.isArray(pc.sections)) {
    for (const lang of ['en', 'ka']) {
      content[lang].sections = defaults[lang].sections.map((defSec, i) => {
        const dbSec = pc.sections[i];
        if (!dbSec) return defSec;
        return {
          ...defSec,
          icon: ICON_MAP[defSec.id] || defSec.icon,
          title: dbSec[`title_${lang}`] || defSec.title,
          content: dbSec[`content_${lang}`] || defSec.content,
        };
      });
    }
  }

  const currentContent = language === 'ka' ? content.ka : content.en;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = currentContent.sections;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentContent]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <SEO 
        slug="/terms" 
        fallbackTitle={language === 'ka' ? 'წესები და პირობები - Smarketer' : 'Terms & Conditions - Smarketer'} 
        fallbackDescription={currentContent.subtitle} 
      />
      <Header alwaysOpaque={true} />

      <main>
        {/* Hero Section */}
        <section className={`relative pt-32 pb-20 overflow-hidden ${darkMode ? 'bg-[#050810]' : 'bg-[#F0F4FF]'}`}>
           {/* Animated Background Elements */}
           <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent blur-3xl" />
              <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-600/10 to-transparent blur-3xl" />
           </div>

           <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
                    <Scale className="w-4 h-4 text-[#5468E7]" />
                    <span className="text-sm font-semibold text-[#5468E7]">{language === 'ka' ? 'იურიდიული ინფორმაცია' : 'Legal Information'}</span>
                 </div>
                 <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {currentContent.title}
                 </h1>
                 <p className={`text-xl max-w-2xl mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentContent.subtitle}
                 </p>
                 <p className={`text-sm font-medium opacity-70 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {currentContent.lastUpdated}
                 </p>
              </motion.div>
           </div>
        </section>

        {/* Content Section */}
        <section className={`py-16 relative z-10 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
           <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-12">
                 
                 {/* Sidebar Navigation */}
                 <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-32">
                       <h3 className={`font-bold mb-6 text-sm uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {language === 'ka' ? 'სარჩევი' : 'Table of Contents'}
                       </h3>
                       <ul className="space-y-1 relative border-l border-gray-200 dark:border-gray-800 ml-3">
                          {currentContent.sections.map((section) => (
                             <li key={section.id} className="relative pl-6">
                                <button 
                                   onClick={() => scrollToSection(section.id)}
                                   className={`text-sm font-medium transition-colors duration-200 text-left hover:text-[#5468E7] ${activeSection === section.id ? 'text-[#5468E7]' : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}
                                >
                                   {section.title}
                                </button>
                                {activeSection === section.id && (
                                   <motion.div 
                                     layoutId="activeIndicator"
                                     className="absolute left-[-1px] top-0 w-0.5 h-full bg-[#5468E7]"
                                   />
                                )}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 {/* Main Content */}
                 <div className="flex-1 max-w-4xl">
                    <div className="space-y-16">
                       {currentContent.sections.map((section, idx) => (
                          <motion.div 
                             key={section.id}
                             id={section.id}
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true, margin: "-100px" }}
                             transition={{ delay: idx * 0.1 }}
                             className="scroll-mt-32"
                          >
                             <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5 text-[#5468E7]' : 'bg-indigo-50 text-[#5468E7]'}`}>
                                   <section.icon className="w-6 h-6" />
                                </div>
                                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                                   {section.title}
                                </h2>
                             </div>
                             <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                                {section.content.split('\n').map((paragraph, i) => (
                                   <p key={i} className={`text-base leading-relaxed mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {paragraph}
                                   </p>
                                ))}
                             </div>
                          </motion.div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
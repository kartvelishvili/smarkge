import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Mail, Server, Globe, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePageContent } from '@/hooks/usePageContent';

const PrivacyPage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('introduction');
  const { content: pc } = usePageContent('privacy', {});

  // ICON_MAP for section icons (icons can't be stored in DB)
  const ICON_MAP = { introduction: Shield, collection: Server, usage: Eye, security: Lock, rights: Globe, contact: Mail };

  // Content Data
  const defaults = {
    en: {
      title: "Privacy Policy",
      subtitle: "Your privacy is our priority. Learn how we handle your data.",
      lastUpdated: "Last Updated: January 4, 2026",
      sections: [
        {
          id: 'introduction',
          icon: Shield,
          title: "1. Introduction",
          content: "Welcome to Smarketer. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you."
        },
        {
          id: 'collection',
          icon: Server,
          title: "2. Information We Collect",
          content: "We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:\n• Identity Data: includes first name, last name, username or similar identifier.\n• Contact Data: includes billing address, delivery address, email address and telephone numbers.\n• Technical Data: includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location."
        },
        {
          id: 'usage',
          icon: Eye,
          title: "3. How We Use Your Information",
          content: "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:\n• Where we need to perform the contract we are about to enter into or have entered into with you.\n• Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.\n• Where we need to comply with a legal or regulatory obligation."
        },
        {
          id: 'security',
          icon: Lock,
          title: "4. Data Security",
          content: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know."
        },
        {
          id: 'rights',
          icon: Globe,
          title: "5. Your Legal Rights",
          content: "Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent."
        },
        {
          id: 'contact',
          icon: Mail,
          title: "6. Contact Us",
          content: "If you have any questions about this privacy policy or our privacy practices, please contact us at:\nEmail: info@smarketer.ge\nPhone: +995 500 70 20 80\nAddress: Tbilisi, Georgia"
        }
      ]
    },
    ka: {
      title: "კონფიდენციალურობის პოლიტიკა",
      subtitle: "თქვენი უსაფრთხოება ჩვენი პრიორიტეტია. გაიგეთ მეტი მონაცემების დაცვის შესახებ.",
      lastUpdated: "ბოლო განახლება: 4 იანვარი, 2026",
      sections: [
        {
          id: 'introduction',
          icon: Shield,
          title: "1. შესავალი",
          content: "კეთილი იყოს თქვენი მობრძანება Smarketer-ში. ჩვენ პატივს ვცემთ თქვენს კონფიდენციალურობას და ვალდებულებას ვიღებთ დავიცვათ თქვენი პერსონალური მონაცემები. ეს პოლიტიკა განმარტავს, თუ როგორ ვამუშავებთ თქვენს მონაცემებს ჩვენს ვებ-გვერდზე ვიზიტისას და გაგაცნობთ თქვენს უფლებებს."
        },
        {
          id: 'collection',
          icon: Server,
          title: "2. ინფორმაცია, რომელსაც ვაგროვებთ",
          content: "ჩვენ შეიძლება შევაგროვოთ, გამოვიყენოთ და შევინახოთ სხვადასხვა სახის პერსონალური მონაცემები:\n• საიდენტიფიკაციო მონაცემები: სახელი, გვარი.\n• საკონტაქტო მონაცემები: ელ-ფოსტა, ტელეფონის ნომერი, მისამართი.\n• ტექნიკური მონაცემები: IP მისამართი, ბრაუზერის ტიპი, დროის სარტყელი და მდებარეობა."
        },
        {
          id: 'usage',
          icon: Eye,
          title: "3. როგორ ვიყენებთ თქვენს ინფორმაციას",
          content: "ჩვენ ვიყენებთ თქვენს მონაცემებს მხოლოდ კანონით დაშვებულ ფარგლებში, ძირითადად შემდეგ შემთხვევებში:\n• როდესაც ეს საჭიროა მომსახურების ხელშეკრულების შესასრულებლად.\n• როდესაც ეს შედის ჩვენს ლეგიტიმურ ინტერესებში და არ ლახავს თქვენს უფლებებს.\n• როდესაც გვჭირდება კანონიერი ან მარეგულირებელი ვალდებულებების შესრულება."
        },
        {
          id: 'security',
          icon: Lock,
          title: "4. მონაცემთა უსაფრთხოება",
          content: "ჩვენ ვიღებთ შესაბამის უსაფრთხოების ზომებს, რათა თავიდან ავიცილოთ თქვენი მონაცემების დაკარგვა, უნებართვო გამოყენება ან გამჟღავნება. თქვენს მონაცემებზე წვდომა შეზღუდულია მხოლოდ იმ თანამშრომლებისთვის, რომლებსაც ეს ესაჭიროებათ სამსახურებრივი მოვალეობის შესასრულებლად."
        },
        {
          id: 'rights',
          icon: Globe,
          title: "5. თქვენი უფლებები",
          content: "კანონმდებლობის შესაბამისად, თქვენ გაქვთ უფლება მოითხოვოთ თქვენს მონაცემებზე წვდომა, მათი შესწორება, წაშლა, დამუშავების შეზღუდვა ან შეწყვეტა. ასევე გაქვთ უფლება გაიტანოთ თქვენი მონაცემები (პორტირება) ან გამოითხოვოთ თანხმობა დამუშავებაზე."
        },
        {
          id: 'contact',
          icon: Mail,
          title: "6. დაგვიკავშირდით",
          content: "თუ გაქვთ კითხვები ჩვენს კონფიდენციალურობის პოლიტიკასთან დაკავშირებით, დაგვიკავშირდით:\nელ-ფოსტა: info@smarketer.ge\nტელეფონი: +995 500 70 20 80\nმისამართი: თბილისი, საქართველო"
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
        slug="/privacy" 
        fallbackTitle={language === 'ka' ? 'კონფიდენციალურობის პოლიტიკა - Smarketer' : 'Privacy Policy - Smarketer'} 
        fallbackDescription={currentContent.subtitle} 
      />
      <Header alwaysOpaque={true} />

      <main>
        {/* Hero Section */}
        <section className={`relative pt-32 pb-20 overflow-hidden ${darkMode ? 'bg-[#050810]' : 'bg-[#F0F4FF]'}`}>
           {/* Animated Background Elements */}
           <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent blur-3xl" />
              <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-teal-600/10 to-transparent blur-3xl" />
           </div>

           <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
                    <Shield className="w-4 h-4 text-[#5468E7]" />
                    <span className="text-sm font-semibold text-[#5468E7]">{language === 'ka' ? 'კონფიდენციალურობა' : 'Privacy & Security'}</span>
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
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5 text-[#5468E7]' : 'bg-blue-50 text-[#5468E7]'}`}>
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

export default PrivacyPage;
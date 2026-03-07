import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { usePageContent } from '@/hooks/usePageContent';
import { 
  Monitor, Share2, Rocket, Search, Globe, Smartphone, 
  BarChart, Target, PenTool, Layers, CheckCircle2, 
  ArrowRight, MessageCircle, TrendingUp, ShieldCheck, 
  Zap, Code, Palette, ChevronDown, ChevronUp
} from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick, darkMode }) => {
  return (
    <div className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} last:border-0`}>
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-lg lg:text-xl font-bold transition-colors ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-[#0A0F1C] group-hover:text-blue-600'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-white/5 group-hover:bg-blue-500/20 text-blue-400' : 'bg-blue-50 group-hover:bg-blue-100 text-blue-600'}`}>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className={`pb-6 text-base lg:text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ServiceCard = ({ icon: Icon, title, description, features, link, linkText, darkMode, delay, gradient }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`group relative p-1 rounded-[2.5rem] bg-gradient-to-br ${gradient} h-full`}
    >
      <div className={`h-full p-8 lg:p-10 rounded-[2.3rem] flex flex-col items-start relative overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
        {/* Background Glow */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${gradient} opacity-10 blur-[60px] rounded-full group-hover:opacity-30 transition-opacity duration-500`} />
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${gradient} text-white shadow-lg shadow-current group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-8 h-8" />
        </div>

        <h3 className={`text-2xl lg:text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
          {title}
        </h3>

        <p className={`text-base lg:text-lg mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>

        <ul className="space-y-4 mb-10 w-full">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm lg:text-base font-medium">
              <div className={`mt-1 min-w-[20px] h-5 rounded-full flex items-center justify-center bg-gradient-to-r ${gradient} opacity-80`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6 w-full border-t border-gray-100 dark:border-white/5">
          <Button 
            onClick={() => navigate(link)}
            className={`w-full py-6 text-lg font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg bg-gradient-to-r ${gradient} text-white hover:opacity-90`}
          >
            {linkText} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const ServicesPage = () => {
  const { darkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const { content: pc } = usePageContent('services', {});

  useEffect(() => {
    if (location.pathname === '/services-en') {
      setLanguage('en');
    }
  }, [location.pathname, setLanguage]);

  const ICON_MAP = { PenTool, Layers, MessageCircle, Code };

  const additionalServices = (pc.additional_services || [
    { title_ka: "ლოგოს დამზადება და დიზაინი", title_en: "Logo Design & Branding", desc_ka: "თქვენი ბრენდის უნიკალური ვიზუალური იდენტობის შექმნა. დასამახსოვრებელი ლოგო, რომელიც გამოხატავს კომპანიის ღირებულებებს.", desc_en: "Creation of your brand's unique visual identity. Memorable logo that expresses company values.", gradient: "from-pink-500 to-rose-500" },
    { title_ka: "სრული ბრენდინგი", title_en: "Full Branding", desc_ka: "ბრენდის სტრატეგია, ფერთა პალიტრა, შრიფტები და ვიზუალური სტილი.", desc_en: "Brand strategy, color palette, fonts, and visual style.", gradient: "from-purple-500 to-indigo-500" },
    { title_ka: "კონსულტაცია ციფრულ მარკეტინგში", title_en: "Digital Marketing Consultation", desc_ka: "სტრატეგიული დაგეგმვა და აუდიტი.", desc_en: "Strategic planning and audit.", gradient: "from-amber-500 to-orange-500" },
    { title_ka: "ტექნიკური მხარდაჭერა", title_en: "Technical Support", desc_ka: "ვებ-გვერდების გამართული მუშაობის უზრუნველყოფა.", desc_en: "Ensuring smooth website operation, security monitoring, and constant updates.", gradient: "from-cyan-500 to-blue-500" }
  ]).map((s, i) => ({
    icon: ICON_MAP[s.icon] || [PenTool, Layers, MessageCircle, Code][i] || PenTool,
    title_ka: s.title_ka, title_en: s.title_en,
    desc_ka: s.desc_ka, desc_en: s.desc_en,
    gradient: s.gradient || "from-blue-500 to-cyan-500"
  }));

  const faqItems = pc.faq_items || [
    { q_ka: "რა ღირს საიტის დამზადება და რა დრო სჭირდება?", q_en: "How much does a website cost and how long does it take?", a_ka: "საიტის დამზადების ფასი დამოკიდებულია პროექტის სირთულეზე.", a_en: "Website pricing depends on project complexity." },
    { q_ka: "რას მოიცავს სოციალური მედია მომსახურება?", q_en: "What does social media service include?", a_ka: "ჩვენი სოციალური მედია მომსახურება არის კომპლექსური.", a_en: "Our social media service is comprehensive." },
    { q_ka: "რატომ არის SEO ოპტიმიზაცია მნიშვნელოვანი?", q_en: "Why is SEO optimization important for my business?", a_ka: "SEO ეხმარება თქვენს საიტს მოხვდეს Google-ის პირველ გვერდზე.", a_en: "SEO helps your site rank on Google's first page organically." },
    { q_ka: "როგორ ხდება რეკლამის ბიუჯეტის განსაზღვრა?", q_en: "How is the ad budget determined?", a_ka: "ბიუჯეტი დამოკიდებულია თქვენს მიზნებზე.", a_en: "The budget depends on your goals." }
  ];

  // Helper: get from page content or use default
  const g = (key, def) => pc[key] || def;

  // Text Content Variables — read from Supabase or fallback to defaults
  const title = language === 'ka' ? g('meta_title_ka', "სერვისები | ვებ-გვერდების დამზადება & სოციალური მედია კამპანიები") : g('meta_title_en', "Services | Web Design & Social Media Campaigns");
  const desc = language === 'ka' ? g('meta_desc_ka', "ვებ-გვერდების დამზადება, SEO ოპტიმიზაცია და სოციალური მედია მომსახურება საქართველოში.") : g('meta_desc_en', "Web design, SEO optimization and social media services in Georgia.");
  
  const heroBadge = language === 'ka' ? g('hero_badge_ka', "სრული ციფრული სერვისი") : g('hero_badge_en', "Full Digital Service");
  const heroTitleStart = language === 'ka' ? g('hero_title_start_ka', "ციფრული სერვისები") : g('hero_title_start_en', "Digital Services");
  const heroTitleEnd = language === 'ka' ? g('hero_title_end_ka', "ბიზნესის ზრდისთვის საქართველოში") : g('hero_title_end_en', "for Business Growth in Georgia");
  const heroText = language === 'ka' 
    ? g('hero_text_ka', "ვებ-გვერდების დამზადება და სოციალური მედია კამპანიები, რომლებიც რეალურად ზრდის თქვენს ბიზნესს.")
    : g('hero_text_en', "Website creation and social media campaigns that actually grow your business.");
  
  const ctaServices = language === 'ka' ? g('cta_services_ka', "ჩვენი სერვისები") : g('cta_services_en', "Our Services");
  const ctaConsultation = language === 'ka' ? g('cta_consultation_ka', "უფასო კონსულტაცია") : g('cta_consultation_en', "Free Consultation");

  const webDesignBadge = language === 'ka' ? g('web_badge_ka', "ვებ-ტექნოლოგიები") : g('web_badge_en', "Web Technologies");
  const webDesignTitleStart = language === 'ka' ? g('web_title_start_ka', "საიტების დამზადება და") : g('web_title_start_en', "Website Creation and");
  const webDesignTitleEnd = language === 'ka' ? g('web_title_end_ka', "SEO ოპტიმიზაცია") : g('web_title_end_en', "SEO Optimization");
  const webDesignText = language === 'ka'
    ? g('web_text_ka', "საძიებო სისტემებში ოპტიმიზაცია (SEO) კრიტიკულია თქვენი ბიზნესის წარმატებისთვის.")
    : g('web_text_en', "Search Engine Optimization (SEO) is critical for your business success.");
  
  const speedTitle = language === 'ka' ? g('speed_title_ka', "სისწრაფე") : g('speed_title_en', "Speed");
  const speedDesc = language === 'ka' ? g('speed_desc_ka', "ელვისებური ჩატვირთვა") : g('speed_desc_en', "Lightning fast loading");
  const seoTitle = language === 'ka' ? g('seo_card_title_ka', "SEO") : g('seo_card_title_en', "SEO");
  const seoDesc = language === 'ka' ? g('seo_card_desc_ka', "Google-ის ტოპ პოზიციები") : g('seo_card_desc_en', "Google top positions");

  const socialBadge = language === 'ka' ? g('social_badge_ka', "სოციალური მედია მარკეტინგი") : g('social_badge_en', "Social Media Marketing");
  const socialTitleStart = language === 'ka' ? g('social_title_start_ka', "სოციალური მედია") : g('social_title_start_en', "Social Media");
  const socialTitleEnd = language === 'ka' ? g('social_title_end_ka', "მომსახურება და კამპანიები") : g('social_title_end_en', "Services & Campaigns");
  const socialText = language === 'ka'
    ? g('social_text_ka', "სოციალური მედია მომსახურება დღეს ბიზნესის ზრდის ერთ-ერთი ყველაზე ეფექტური ინსტრუმენტია.")
    : g('social_text_en', "Social media service is one of the most effective tools for business growth today.");
  
  const targetTitle = language === 'ka' ? g('target_title_ka', "ტარგეტირება") : g('target_title_en', "Targeting");
  const targetDesc = language === 'ka' ? g('target_desc_ka', "ზუსტი აუდიტორიის შერჩევა") : g('target_desc_en', "Precise audience selection");
  const analyticsTitle = language === 'ka' ? g('analytics_title_ka', "ანალიტიკა") : g('analytics_title_en', "Analytics");
  const analyticsDesc = language === 'ka' ? g('analytics_desc_ka', "დეტალური რეპორტინგი") : g('analytics_desc_en', "Detailed reporting");

  const additionalTitle = language === 'ka' ? g('additional_title_ka', "დამატებითი ციფრული სერვისები") : g('additional_title_en', "Additional Digital Services");
  const additionalSub = language === 'ka' ? g('additional_sub_ka', "ჩვენ გთავაზობთ სრულ სერვისს თქვენი ბრენდის წარმატებისთვის.") : g('additional_sub_en', "We offer full service for your brand's success in the digital world.");

  const whyTitle = language === 'ka' ? g('why_title_ka', "რატომ გვირჩევენ") : g('why_title_en', "Why Choose");
  const whyDesc = language === 'ka'
    ? g('why_desc_ka', "ჩვენ არ ვქმნით უბრალოდ საიტებს ან პოსტებს. ჩვენ ვქმნით ბიზნეს გადაწყვეტილებებს.")
    : g('why_desc_en', "We don't just create websites or posts. We create business solutions that increase your revenue.");

  const whyPointsRaw_ka = g('why_points_ka', "შედეგზე ორიენტირებული მიდგომა\nSEO-ზე მორგებული ტექნიკური გადაწყვეტილებები\nქართული ბაზრის ღრმა ცოდნა\nინდივიდუალური სტრატეგიები");
  const whyPointsRaw_en = g('why_points_en', "Results-oriented approach and ROI control\nSEO-tailored technical solutions\nDeep knowledge of the Georgian market\nIndividual and business-tailored strategies");
  const whyPoints = (language === 'ka' ? whyPointsRaw_ka : whyPointsRaw_en).split('\n').filter(Boolean);

  const statSiteValue = g('stat_sites_value', '150+');
  const statSite = language === 'ka' ? g('stat_sites_label_ka', "შექმნილი საიტი") : g('stat_sites_label_en', "Websites Created");
  const statBudgetValue = g('stat_budget_value', '$6.3M+');
  const statBudget = language === 'ka' ? g('stat_budget_label_ka', "მართული ბიუჯეტი") : g('stat_budget_label_en', "Budget Managed");
  const statSecureValue = g('stat_secure_value', '100%');
  const statSecure = language === 'ka' ? g('stat_secure_label_ka', "დაცული სისტემები") : g('stat_secure_label_en', "Secure Systems");
  const statExpValue = g('stat_exp_value', '16+');
  const statExp = language === 'ka' ? g('stat_exp_label_ka', "წლიანი გამოცდილება") : g('stat_exp_label_en', "Years Experience");

  const faqTitle = language === 'ka' ? g('faq_title_ka', "ხშირად დასმული კითხვები") : g('faq_title_en', "Frequently Asked Questions");
  const faqSub = language === 'ka' ? g('faq_sub_ka', "პასუხები ვებ-დიზაინისა და სოციალური მედიის შესახებ") : g('faq_sub_en', "Answers about web design and social media");

  const footerCtaTitle = language === 'ka' ? g('cta_footer_title_ka', "მზად ხართ წარმატებისთვის?") : g('cta_footer_title_en', "Ready for Success?");
  const footerCtaText = language === 'ka' 
    ? g('cta_footer_text_ka', "დაგვიკავშირდით და მიიღეთ უფასო კონსულტაცია.")
    : g('cta_footer_text_en', "Contact us and get a free consultation about your project.");
  const footerBtnContact = language === 'ka' ? g('cta_footer_btn1_ka', "დაგვიკავშირდით") : g('cta_footer_btn1_en', "Contact Us");
  const footerBtnPortfolio = language === 'ka' ? g('cta_footer_btn2_ka', "ნახეთ პორტფოლიო") : g('cta_footer_btn2_en', "View Portfolio");
  
  // Additional services and FAQ arrays from DB or defaults

  // Service + BreadcrumbList JSON-LD schemas (SEO-010, SEO-020)
  const serviceSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": language === 'ka' ? "ციფრული მარკეტინგი" : "Digital Marketing",
      "provider": {
        "@type": "Organization",
        "name": "Smarketer",
        "url": "https://smarketer.ge"
      },
      "areaServed": "GE",
      "description": desc
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": language === 'ka' ? "მთავარი" : "Home", "item": "https://smarketer.ge/" },
        { "@type": "ListItem", "position": 2, "name": language === 'ka' ? "სერვისები" : "Services", "item": "https://smarketer.ge/services" }
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'}`}>
      <SEO 
        slug="/services" 
        title={title}
        description={desc}
        jsonLd={serviceSchema}
      />
      <Header />

      {/* 1. HERO SECTION */}
      <section className={`pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
        {/* Abstract Background */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 border backdrop-blur-md ${darkMode ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}
            >
               <Zap className="w-4 h-4" />
               <span className="text-sm font-bold uppercase tracking-wider">
                 {heroBadge}
               </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl lg:text-7xl font-black mb-8 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}
            >
               {heroTitleStart} <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                 {heroTitleEnd}
               </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg lg:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
               {heroText}
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row justify-center gap-5"
            >
               <Button 
                 onClick={() => document.getElementById('web-design').scrollIntoView({ behavior: 'smooth' })}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
               >
                 {ctaServices}
               </Button>
               <Button 
                 variant="outline"
                 onClick={() => navigate('/contact')}
                 className={`px-10 py-7 rounded-xl font-bold text-lg border-2 transition-all hover:scale-105 ${darkMode ? 'border-gray-700 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
               >
                 {ctaConsultation}
               </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WEB DESIGN SERVICES */}
      <section id="web-design" className={`py-20 lg:py-32 relative z-10 ${darkMode ? 'bg-[#0D1126]' : 'bg-gray-50/50'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
               <div className="order-2 lg:order-1">
                  <ServiceCard 
                    icon={Monitor}
                    title={language === 'ka' ? g('web_card_title_ka', "ვებ-გვერდების დამზადება ბიზნესისთვის") : g('web_card_title_en', "Website Creation for Business")}
                    description={language === 'ka' 
                      ? g('web_card_desc_ka', "თანამედროვე ციფრულ სამყაროში საიტი თქვენი ბიზნესის სახეა.")
                      : g('web_card_desc_en', "In the modern digital world, a website is the face of your business.")}
                    features={(language === 'ka' ? g('web_card_features_ka', "თანამედროვე და სწრაფი ვებ-გვერდები\nმობილურზე მორგებული (Responsive) დიზაინი\nSEO ოპტიმიზირებული სტრუქტურა\nუსაფრთხო სისტემები\nUX/UI დიზაინი") : g('web_card_features_en', "Modern and fast websites\nMobile-friendly (Responsive) design\nSEO optimized structure\nSafe and secure systems\nConversion-oriented UX/UI design")).split('\n').filter(Boolean)}
                    link="/web-design"
                    linkText={language === 'ka' ? g('web_card_link_text_ka', "დეტალურად – საიტის დამზადება") : g('web_card_link_text_en', "Details - Website Creation")}
                    darkMode={darkMode}
                    delay={0.2}
                    gradient="from-blue-600 to-cyan-500"
                  />
               </div>
               
               <div className="order-1 lg:order-2">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                     <div className="inline-block px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold mb-6">
                        {webDesignBadge}
                     </div>
                     <h2 className={`text-3xl lg:text-5xl font-black mb-8 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {webDesignTitleStart} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                           {webDesignTitleEnd}
                        </span>
                     </h2>
                     <p className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {webDesignText}
                     </p>
                     
                     <div className="grid grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white shadow-md'}`}>
                           <Rocket className="w-8 h-8 text-blue-500 mb-3" />
                           <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{speedTitle}</h4>
                           <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{speedDesc}</p>
                        </div>
                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white shadow-md'}`}>
                           <Search className="w-8 h-8 text-cyan-500 mb-3" />
                           <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{seoTitle}</h4>
                           <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{seoDesc}</p>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. SOCIAL MEDIA SERVICES */}
      <section className={`py-20 lg:py-32 relative z-10 overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-white'}`}>
         {/* Decoration */}
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

         <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
               <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                     <div className="inline-block px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold mb-6">
                        {socialBadge}
                     </div>
                     <h2 className={`text-3xl lg:text-5xl font-black mb-8 leading-tight ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {socialTitleStart} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                           {socialTitleEnd}
                        </span>
                     </h2>
                     <p className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {socialText}
                     </p>
                     
                     <div className="grid grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50 shadow-md'}`}>
                           <Target className="w-8 h-8 text-purple-500 mb-3" />
                           <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{targetTitle}</h4>
                           <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{targetDesc}</p>
                        </div>
                        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50 shadow-md'}`}>
                           <BarChart className="w-8 h-8 text-pink-500 mb-3" />
                           <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{analyticsTitle}</h4>
                           <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analyticsDesc}</p>
                        </div>
                     </div>
                  </motion.div>
               </div>

               <div>
                  <ServiceCard 
                    icon={Share2}
                    title={language === 'ka' ? g('social_card_title_ka', "სოციალური მედია კამპანიები") : g('social_card_title_en', "Social Media Campaigns")}
                    description={language === 'ka' 
                      ? g('social_card_desc_ka', "გაზარდეთ თქვენი ბრენდის ცნობადობა და გაყიდვები პროფესიონალური სოციალური მედია კამპანიებით.")
                      : g('social_card_desc_en', "Increase your brand awareness and sales with professional social media campaigns.")}
                    features={(language === 'ka' ? g('social_card_features_ka', "Facebook და Instagram გვერდის მართვა\nკონტენტის დაგეგმვა და კოპირაიტინგი\nრეკლამა სოციალურ მედიაში\nაუდიტორიის ზრდა\nყოველთვიური ანალიზი") : g('social_card_features_en', "Facebook and Instagram page management\nContent planning and copywriting\nSocial media advertising\nAudience growth and engagement\nMonthly analysis and reporting")).split('\n').filter(Boolean)}
                    link="/social-media"
                    linkText={language === 'ka' ? g('social_card_link_text_ka', "დეტალურად – სოც. მედია") : g('social_card_link_text_en', "Details - Social Media")}
                    darkMode={darkMode}
                    delay={0.2}
                    gradient="from-purple-600 to-pink-500"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 4. ADDITIONAL SERVICES */}
      <section className={`py-24 ${darkMode ? 'bg-[#0D1126]' : 'bg-gray-50'}`}>
         <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}
               >
                 {additionalTitle}
               </motion.h2>
               <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {additionalSub}
               </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {additionalServices.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                       darkMode 
                         ? 'bg-[#0A0F1C] border-white/5 hover:border-blue-500/30' 
                         : 'bg-white border-white hover:border-blue-200 shadow-sm'
                    }`}
                  >
                     <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${service.gradient} text-white shadow-lg`}>
                        <service.icon className="w-7 h-7" />
                     </div>
                     <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {language === 'ka' ? service.title_ka : service.title_en}
                     </h3>
                     <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'ka' ? service.desc_ka : service.desc_en}
                     </p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. WHY SMARKETER */}
      <section className="py-24 relative overflow-hidden">
         <div className={`absolute inset-0 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F8FAFC]'}`}></div>
         {/* Glassmorphism Background Elements */}
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />

         <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="relative rounded-[3rem] p-10 lg:p-20 overflow-hidden backdrop-blur-3xl border border-white/20 bg-white/5 dark:bg-black/20 shadow-2xl">
               <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <h2 className={`text-3xl lg:text-5xl font-black mb-8 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                        {whyTitle} <br />
                        <span className="text-blue-600">Smarketer</span>?
                     </h2>
                     <p className={`text-lg mb-10 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {whyDesc}
                     </p>
                     
                     <div className="space-y-6">
                        {whyPoints.map((item, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-4"
                           >
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                                 <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                 {item}
                              </span>
                           </motion.div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="relative">
                      {/* Decorative Card Stack */}
                      <motion.div 
                        initial={{ rotate: -6, y: 20, opacity: 0 }}
                        whileInView={{ rotate: -6, y: 0, opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl opacity-20 transform translate-x-4 translate-y-4"
                      />
                      <motion.div 
                        initial={{ rotate: 0, scale: 0.9, opacity: 0 }}
                        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                        className={`relative p-8 rounded-3xl border backdrop-blur-xl ${darkMode ? 'bg-[#0A0F1C]/80 border-white/10' : 'bg-white/80 border-white'}`}
                      >
                         <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                               <TrendingUp className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                               <div className="text-3xl font-black mb-1 text-blue-600">{statSiteValue}</div>
                               <div className="text-xs uppercase font-bold text-gray-500">{statSite}</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                               <Target className="w-10 h-10 mx-auto mb-3 text-purple-500" />
                               <div className="text-3xl font-black mb-1 text-purple-600">{statBudgetValue}</div>
                               <div className="text-xs uppercase font-bold text-gray-500">{statBudget}</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                               <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-green-500" />
                               <div className="text-3xl font-black mb-1 text-green-600">{statSecureValue}</div>
                               <div className="text-xs uppercase font-bold text-gray-500">{statSecure}</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
                               <Globe className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                               <div className="text-3xl font-black mb-1 text-orange-600">{statExpValue}</div>
                               <div className="text-xs uppercase font-bold text-gray-500">{statExp}</div>
                            </div>
                         </div>
                      </motion.div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className={`py-24 ${darkMode ? 'bg-[#0D1126]' : 'bg-gray-50'}`}>
         <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="text-center mb-16">
               <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {faqTitle}
               </h2>
               <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {faqSub}
               </p>
            </div>

            <div className="space-y-2">
               {faqItems.map((item, idx) => (
                  <FAQItem 
                    key={idx}
                    question={language === 'ka' ? item.q_ka : item.q_en}
                    answer={language === 'ka' ? item.a_ka : item.a_en}
                    isOpen={openFaqIndex === idx}
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    darkMode={darkMode}
                  />
               ))}
            </div>
         </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24">
         <div className="container mx-auto px-4 lg:px-8">
            <div className="relative rounded-[3rem] p-10 lg:p-24 overflow-hidden text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               
               <div className="relative z-10">
                  <h2 className="text-3xl lg:text-6xl font-black text-white mb-8">
                     {footerCtaTitle}
                  </h2>
                  <p className="text-white/90 text-lg lg:text-xl max-w-2xl mx-auto mb-12 font-medium">
                     {footerCtaText}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                     <Button 
                       onClick={() => navigate('/contact')}
                       className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-8 rounded-full text-xl font-bold shadow-xl transition-all hover:scale-105"
                     >
                        {footerBtnContact}
                     </Button>
                     <Button 
                       variant="outline"
                       onClick={() => navigate('/portfolio')} 
                       className="border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 px-12 py-8 rounded-full text-xl font-bold transition-all hover:scale-105"
                     >
                        {footerBtnPortfolio}
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
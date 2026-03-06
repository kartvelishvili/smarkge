import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { useLanguage } from '@/contexts/LanguageContext';

const DEFAULTS = {
  title_en: 'Pricing & Packages',
  title_ka: 'ფასები და პაკეტები',
  subtitle_en: 'Flexible pricing tailored to your needs. Every project is unique, so we provide custom quotes based on your specific requirements.',
  subtitle_ka: 'მოქნილი ფასები თქვენს საჭიროებებზე მორგებული.',
  packages: [
    { name_en: 'Website Starter', name_ka: 'ვებ სტარტერი', description_en: 'Perfect for small businesses and startups', description_ka: 'იდეალურია მცირე ბიზნესისთვის', price_en: 'Custom Quote', price_ka: 'ინდივიდუალური', features_en: 'Landing page or 5-page website\nMobile-responsive design\nSEO foundation\nContact form integration\nBasic analytics setup\n30 days support', features_ka: 'ლენდინგი ან 5-გვერდიანი საიტი\nმობილურზე მორგებული\nSEO საფუძველი\nსაკონტაქტო ფორმა\nანალიტიკის მონტაჟი\n30 დღე მხარდაჭერა', btn_en: 'Request Custom Quote', btn_ka: 'მოითხოვეთ შეთავაზება' },
    { name_en: 'Web + Social Combo', name_ka: 'ვებ + სოციალური', description_en: 'Complete digital presence package', description_ka: 'სრული ციფრული პაკეტი', price_en: 'Custom Quote', price_ka: 'ინდივიდუალური', features_en: 'Full website (up to 10 pages)\nMonthly social media management\n12-16 posts per month\nPaid ads setup & management\nContent calendar\nMonthly performance reports\n90 days support', features_ka: 'სრული საიტი (10 გვერდამდე)\nყოველთვიური სმმ მართვა\n12-16 პოსტი თვეში\nრეკლამის მართვა\nკონტენტ კალენდარი\nყოველთვიური რეპორტი\n90 დღე მხარდაჭერა', popular: 'true', btn_en: 'Request Custom Quote', btn_ka: 'მოითხოვეთ შეთავაზება' },
    { name_en: 'Ongoing Marketing', name_ka: 'მუდმივი მარკეტინგი', description_en: 'Long-term partnership for growth', description_ka: 'გრძელვადიანი პარტნიორობა ზრდისთვის', price_en: 'Custom Quote', price_ka: 'ინდივიდუალური', features_en: 'Website maintenance & updates\nFull social media management\n20-30 posts per month\nAdvanced paid advertising\nA/B testing & optimization\nWeekly strategy calls\nPriority support\nDedicated account manager', features_ka: 'საიტის მოვლა და განახლება\nსრული სმმ მართვა\n20-30 პოსტი თვეში\nრეკლამის ოპტიმიზაცია\nA/B ტესტირება\nყოველკვირეული ზარები\nპრიორიტეტული მხარდაჭერა\nპერსონალური მენეჯერი', btn_en: 'Request Custom Quote', btn_ka: 'მოითხოვეთ შეთავაზება' }
  ]
};

const Pricing = ({ darkMode }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { content } = usePageContent('home_pricing', DEFAULTS);
  const lang = language === 'ka' ? 'ka' : 'en';

  const packages = (content.packages || DEFAULTS.packages).map(pkg => ({
    name: pkg[`name_${lang}`] || pkg.name_en,
    description: pkg[`description_${lang}`] || pkg.description_en,
    price: pkg[`price_${lang}`] || pkg.price_en,
    features: (pkg[`features_${lang}`] || pkg.features_en || '').split('\n').filter(Boolean),
    popular: pkg.popular === true || pkg.popular === 'true',
    btnText: pkg[`btn_${lang}`] || pkg.btn_en || 'Request Custom Quote'
  }));

  const handleQuote = (packageName) => {
    toast({
      title: `🚧 Request Quote: ${packageName}`,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-[#F4F7FF]'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl lg:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
            {content[`title_${lang}`] || content.title_en}
          </h2>
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {content[`subtitle_${lang}`] || content.subtitle_en}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-all hover:scale-105 ${
                pkg.popular
                  ? 'border-[#5468E7] shadow-2xl shadow-[#5468E7]/20'
                  : darkMode 
                    ? 'border-[#5468E7]/30' 
                    : 'border-gray-200'
              } ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] rounded-full text-white text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {pkg.name}
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {pkg.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                    {pkg.price}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[#5468E7]/20 flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#5468E7]" />
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleQuote(pkg.name)}
                className={`w-full py-6 rounded-lg font-medium transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-[#5468E7] to-[#3A4BCF] hover:from-[#3A4BCF] hover:to-[#5468E7] text-white shadow-lg'
                    : darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#0A0F1C]'
                }`}
              >
                {pkg.btnText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Lightbulb, Sparkles, Rocket, LineChart } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { useLanguage } from '@/contexts/LanguageContext';

const ICON_MAP = { Phone, Lightbulb, Sparkles, Rocket, LineChart };

const DEFAULTS = {
  title_en: 'How We Work',
  title_ka: 'როგორ ვმუშაობთ',
  subtitle_en: 'Our proven 5-step process ensures seamless collaboration and outstanding results from start to finish.',
  subtitle_ka: 'ჩვენი 5-საფეხურიანი პროცესი უზრუნველყოფს შეუფერხებელ თანამშრომლობას და შესანიშნავ შედეგებს.',
  steps: [
    { icon: 'Phone', title_en: 'Discovery Call', title_ka: 'აღმოჩენის ზარი', description_en: 'We start with a conversation to understand your business goals, target audience, and project requirements.', description_ka: 'ვიწყებთ საუბრით, რათა გავიგოთ თქვენი ბიზნეს მიზნები და მოთხოვნები.' },
    { icon: 'Lightbulb', title_en: 'Strategy & Planning', title_ka: 'სტრატეგია და დაგეგმვა', description_en: 'Our team develops a comprehensive strategy tailored to your needs, including timeline and deliverables.', description_ka: 'ჩვენი გუნდი ავითარებს სტრატეგიას თქვენს საჭიროებებზე მორგებულს.' },
    { icon: 'Sparkles', title_en: 'Design & Content Production', title_ka: 'დიზაინი და კონტენტი', description_en: 'We create stunning designs and compelling content that aligns with your brand and resonates with your audience.', description_ka: 'ვქმნით დიზაინს და კონტენტს, რომელიც ეხმიანება თქვენს აუდიტორიას.' },
    { icon: 'Rocket', title_en: 'Launch & Advertising', title_ka: 'გაშვება და რეკლამა', description_en: 'Your website goes live or your campaigns launch with optimized targeting and creative execution.', description_ka: 'თქვენი საიტის გაშვება ოპტიმიზირებული ტარგეტინგით.' },
    { icon: 'LineChart', title_en: 'Analytics & Long-term Partnership', title_ka: 'ანალიტიკა და გრძელვადიანი პარტნიორობა', description_en: 'We monitor performance, provide detailed reports, and continuously optimize for better results.', description_ka: 'ვაკვირდებით შედეგებს, ვაწოდებთ რეპორტებს და მუდმივად ვოპტიმიზირებთ.' }
  ]
};

const HowWeWork = ({ darkMode }) => {
  const { language } = useLanguage();
  const { content } = usePageContent('home_how_we_work', DEFAULTS);
  const lang = language === 'ka' ? 'ka' : 'en';

  const steps = (content.steps || DEFAULTS.steps).map(step => ({
    icon: ICON_MAP[step.icon] || Phone,
    title: step[`title_${lang}`] || step.title_en || '',
    description: step[`description_${lang}`] || step.description_en || ''
  }));

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

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#5468E7] via-[#3A4BCF] to-[#7A88F5] -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className={`relative z-10 p-6 rounded-2xl border transition-all hover:scale-105 ${
                  darkMode 
                    ? 'bg-[#0D1126] border-[#5468E7]/30 hover:border-[#5468E7]' 
                    : 'bg-white border-gray-200 hover:border-[#5468E7]'
                } shadow-xl hover:shadow-2xl`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center mb-4 shadow-lg">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5468E7] to-[#3A4BCF] flex items-center justify-center mb-4 text-white font-bold text-xl">
                      {index + 1}
                    </div>

                    <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                      {step.title}
                    </h3>

                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
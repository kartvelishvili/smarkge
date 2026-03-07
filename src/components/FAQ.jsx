import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { useLanguage } from '@/contexts/LanguageContext';

const DEFAULTS = {
  title_en: 'Frequently Asked Questions',
  title_ka: 'ხშირად დასმული კითხვები',
  subtitle_en: "Got questions? We've got answers. Find everything you need to know about working with us.",
  subtitle_ka: 'გაქვთ კითხვები? ჩვენ გვაქვს პასუხები.',
  items: [
    { question_en: 'How long does it take to build a website?', question_ka: 'რამდენ ხანს სჭირდება ვებ-გვერდის შექმნა?', answer_en: 'Timeline varies based on project complexity. A landing page typically takes 2-3 weeks, while a full corporate website may take 6-8 weeks. Custom web applications can take 2-3 months or more.', answer_ka: 'დრო დამოკიდებულია პროექტის სირთულეზე. ლენდინგ გვერდი მზადდება 2-3 კვირაში, კორპორატიული საიტი 6-8 კვირაში.' },
    { question_en: 'Do you provide ongoing support after launch?', question_ka: 'გაშვების შემდეგ აგრძელებთ მხარდაჭერას?', answer_en: 'Yes! All our packages include post-launch support. We offer maintenance plans for updates, security patches, and technical assistance to keep your website running smoothly.', answer_ka: 'დიახ! ყველა პაკეტს თან ახლავს გაშვების შემდგომი მხარდაჭერა.' },
    { question_en: 'What social media platforms do you manage?', question_ka: 'რომელ სოციალურ პლატფორმებს მართავთ?', answer_en: 'We specialize in Facebook, Instagram, TikTok, LinkedIn, and YouTube. We recommend platforms based on your target audience and business goals.', answer_ka: 'ჩვენ სპეციალიზირებული ვართ Facebook, Instagram, TikTok, LinkedIn და YouTube-ზე.' },
    { question_en: 'Can I see examples of your previous work?', question_ka: 'შემიძლია წინა ნამუშევრების ნახვა?', answer_en: 'Absolutely! Check out our portfolio section above to see case studies with real results. We can also provide specific examples relevant to your industry during consultation.', answer_ka: 'რა თქმა უნდა! ნახეთ ჩვენი პორტფოლიოს სექცია.' },
    { question_en: "What's included in your social media packages?", question_ka: 'რა შედის სოციალური მედია პაკეტებში?', answer_en: 'Our packages include content strategy, post design, copywriting, scheduling, community management, paid ads setup and optimization, and monthly performance reports.', answer_ka: 'ჩვენი პაკეტები მოიცავს კონტენტ სტრატეგიას, პოსტების დიზაინს, კოპირაიტინგს და ყოველთვიურ რეპორტებს.' },
    { question_en: 'Do you work with businesses outside your listed industries?', question_ka: 'მუშაობთ სხვა ინდუსტრიების ბიზნესებთანაც?', answer_en: 'Yes! While we have expertise in specific industries, we work with businesses across all sectors. Our process adapts to your unique needs and market.', answer_ka: 'დიახ! ჩვენ ვმუშაობთ ყველა სექტორის ბიზნესებთან.' },
    { question_en: "What's the difference between organic and paid social media?", question_ka: 'რა განხვავებაა ორგანულ და ფასიან სოციალურ მედიას შორის?', answer_en: 'Organic social media builds your presence through regular posts and engagement. Paid advertising targets specific audiences with promoted content for faster results. We recommend combining both for maximum impact.', answer_ka: 'ორგანული სოციალური მედია აშენებს ყოფნას რეგულარული პოსტებით, ფასიანი კი ტარგეტირებულ აუდიტორიას აკეთებს.' },
    { question_en: 'How do you measure success and ROI?', question_ka: 'როგორ ზომავთ წარმატებას და ROI-ს?', answer_en: "We track key metrics like website traffic, conversion rates, engagement rates, lead generation, and sales. You'll receive detailed monthly reports showing progress toward your goals.", answer_ka: 'ჩვენ ვაკვირდებით ტრაფიკს, კონვერსიას, ჩართულობას და გაყიდვებს. თქვენ მიიღებთ ყოველთვიურ დეტალურ რეპორტს.' }
  ]
};

const FAQ = ({ darkMode }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const { language } = useLanguage();
  const { content } = usePageContent('home_faq', DEFAULTS);

  const lang = language === 'ka' ? 'ka' : 'en';
  const faqs = (content.items || DEFAULTS.items).map(item => ({
    question: item[`question_${lang}`] || item.question_en || '',
    answer: item[`answer_${lang}`] || item.answer_en || ''
  }));

  // FAQPage JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className={`py-20 lg:py-32 ${darkMode ? 'bg-[#0D1126]' : 'bg-white'}`} aria-label="FAQ">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
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

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className={`rounded-xl border overflow-hidden ${
                darkMode 
                  ? 'bg-[#0A0F1C] border-[#5468E7]/30' 
                  : 'bg-white border-gray-200'
              } shadow-lg`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-label={faq.question}
                className="w-full p-6 flex items-center justify-between text-left transition-colors hover:bg-white/5"
              >
                <span className={`text-lg font-semibold pr-4 ${darkMode ? 'text-white' : 'text-[#0A0F1C]'}`}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className={darkMode ? 'text-[#5468E7]' : 'text-[#3A4BCF]'} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-6 pb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
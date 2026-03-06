import React from 'react';
import { motion } from 'framer-motion';
import { usePageContent } from '@/hooks/usePageContent';
import { useLanguage } from '@/contexts/LanguageContext';

const DEFAULTS = {
  heading_en: "Let's turn your ideas into reality",
  heading_ka: 'მოდით, თქვენი იდეები რეალობად ვაქციოთ',
};

const CallToAction = () => {
  const { language } = useLanguage();
  const { content } = usePageContent('home_cta', DEFAULTS);
  const lang = language === 'ka' ? 'ka' : 'en';

  return (
    <motion.h1
      className='text-xl font-bold text-white leading-8 w-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {content[`heading_${lang}`] || content.heading_en}
    </motion.h1>
  );
};

export default CallToAction;
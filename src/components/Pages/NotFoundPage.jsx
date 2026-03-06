import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NotFoundPage = () => {
  const { language } = useLanguage();

  const text = {
    en: {
      title: '404',
      subtitle: 'Page Not Found',
      description: 'The page you are looking for doesn\'t exist or has been moved.',
      homeButton: 'Go Home',
      backButton: 'Go Back'
    },
    ka: {
      title: '404',
      subtitle: 'გვერდი ვერ მოიძებნა',
      description: 'გვერდი რომელსაც ეძებთ არ არსებობს ან გადატანილია.',
      homeButton: 'მთავარი',
      backButton: 'უკან'
    }
  };

  const t = text[language] || text.en;

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-[#5468E7] mb-4">{t.title}</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">{t.subtitle}</h2>
        <p className="text-gray-400 mb-8">{t.description}</p>
        <div className="flex gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5468E7] hover:bg-[#3A4BCF] text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            {t.homeButton}
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#5468E7]/30 text-gray-300 hover:bg-[#5468E7]/10 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

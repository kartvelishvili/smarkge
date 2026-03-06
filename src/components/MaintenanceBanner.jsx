import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

const MaintenanceBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check localStorage on mount
    const checkVisibility = () => {
      try {
        const lastDismissed = localStorage.getItem('maintenance_last_dismissed');
        
        if (!lastDismissed) {
          setIsVisible(true);
          return;
        }

        const dismissedTime = parseInt(lastDismissed, 10);
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // If more than 24 hours have passed since dismissal, show it again
        if (currentTime - dismissedTime > twentyFourHours) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error checking maintenance banner visibility:", error);
        // Fallback to showing it if something goes wrong with storage
        setIsVisible(true);
      }
    };

    checkVisibility();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('maintenance_last_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  const content = {
    ka: "საიტზე მიმდინარეობს განახლების პროცესი, კიდევ გვეწვიეთ.",
    en: "Site update in progress, please visit us again."
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }} // Start from bottom, hidden
          animate={{ y: 0, opacity: 1 }}     // Slide up and become visible
          exit={{ y: '100%', opacity: 0 }}    // Slide down and disappear
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 bg-[#5468E7] text-white z-[100] border-t border-white/10 shadow-lg" // Position at bottom, add top border
        >
          <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8"> {/* Reduced vertical padding */}
            <div className="flex items-center justify-between gap-2"> {/* Reduced gap */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-center sm:justify-start"> {/* Reduced gap */}
                <span className="flex p-1 rounded-lg bg-white/20 shrink-0 backdrop-blur-sm"> {/* Reduced padding */}
                  <Info className="w-3 h-3 text-white" /> {/* Smaller icon */}
                </span>
                <p className="text-xs font-medium text-center sm:text-left text-white/95 tracking-wide"> {/* Smaller text */}
                  {language === 'ka' ? content.ka : content.en}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="flex p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200" // Reduced padding
                  aria-label="Dismiss notification"
                >
                  <X className="w-3 h-3 text-white" /> {/* Smaller icon */}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaintenanceBanner;
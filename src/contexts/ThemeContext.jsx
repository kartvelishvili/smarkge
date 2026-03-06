import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference, default to null initially to allow DB fetch
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return null; // Don't know yet, wait for DB or system pref
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch default theme from DB if no local preference
  useEffect(() => {
    const initTheme = async () => {
      // If user has a saved preference, we respect it and skip DB fetch for default
      const saved = localStorage.getItem('theme');
      if (saved) {
        setDarkMode(saved === 'dark');
        setIsLoaded(true);
        return;
      }

      // Otherwise, fetch default from DB
      try {
        const { data, error } = await supabase
          .from('theme_settings')
          .select('default_theme')
          .limit(1)
          .maybeSingle();

        if (error) {
          // If table or column doesn't exist yet, suppress error and fallback
          console.warn('Theme settings fetch warning:', error.message);
          setDarkMode(true); // Default to dark on error
        } else if (data && data.default_theme) {
          setDarkMode(data.default_theme === 'dark');
        } else {
          // Fallback to system preference if no DB setting
          setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
      } catch (error) {
        console.error('Error fetching default theme:', error);
        setDarkMode(true); 
      } finally {
        setIsLoaded(true);
      }
    };

    initTheme();
  }, []);

  // Apply theme class to HTML element whenever darkMode changes
  useEffect(() => {
    if (!isLoaded && darkMode === null) return; 
    
    const root = document.documentElement;
    // If isLoaded is false but we have a value (e.g. from localStorage), apply it.
    // If we are waiting for DB (darkMode is null), don't apply yet to avoid flash, 
    // but we set a default in state initialization so it shouldn't be null for long.
    
    const activeMode = darkMode === null ? true : darkMode; // Default to dark if still loading

    if (activeMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode, isLoaded]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode: !!darkMode, toggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
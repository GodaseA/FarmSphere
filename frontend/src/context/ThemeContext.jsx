import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  EMERALD: 'emerald', // Emerald Harvest (Lush Agri Green / Fresh Earth)
  AMBER: 'amber',     // Golden Sunset (Warm Amber / Sunlit Harvest)
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('agriconnect_theme') || THEMES.EMERALD;
  });

  useEffect(() => {
    localStorage.setItem('agriconnect_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === THEMES.AMBER) {
      document.body.classList.add('theme-amber');
      document.body.classList.remove('theme-emerald');
    } else {
      document.body.classList.add('theme-emerald');
      document.body.classList.remove('theme-amber');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === THEMES.EMERALD ? THEMES.AMBER : THEMES.EMERALD));
  };

  const isEmerald = theme === THEMES.EMERALD;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isEmerald }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

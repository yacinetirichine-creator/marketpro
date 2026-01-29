// ============================================
// MARKET PRO - Système de thème (Dark/Light Mode)
// ============================================

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Thèmes disponibles
export const themes = {
  dark: {
    name: 'dark',
    label: 'Mode sombre',
    colors: {
      // Backgrounds
      '--bg-primary': '#1a1a2e',
      '--bg-secondary': '#16162a',
      '--bg-tertiary': '#0f0f1a',
      '--card-bg': '#1e1e3f',
      '--sidebar-bg': '#12122a',
      '--sidebar-hover': 'rgba(0, 212, 170, 0.1)',
      
      // Primary colors
      '--primary-color': '#00D4AA',
      '--primary-hover': '#00b894',
      '--primary-light': 'rgba(0, 212, 170, 0.1)',
      
      // Text colors
      '--text-primary': '#ffffff',
      '--text-secondary': '#a0a0a0',
      '--text-muted': '#666666',
      
      // Border colors
      '--border-color': 'rgba(255, 255, 255, 0.1)',
      '--border-light': 'rgba(255, 255, 255, 0.05)',
      
      // Status colors
      '--success-color': '#4caf50',
      '--success-bg': 'rgba(76, 175, 80, 0.1)',
      '--warning-color': '#ff9800',
      '--warning-bg': 'rgba(255, 152, 0, 0.1)',
      '--danger-color': '#f44336',
      '--danger-bg': 'rgba(244, 67, 54, 0.1)',
      '--info-color': '#2196f3',
      '--info-bg': 'rgba(33, 150, 243, 0.1)',
      
      // Input colors
      '--input-bg': 'rgba(255, 255, 255, 0.05)',
      '--input-border': 'rgba(255, 255, 255, 0.1)',
      '--input-focus-border': '#00D4AA',
      
      // Shadow
      '--shadow': '0 4px 6px rgba(0, 0, 0, 0.3)',
      '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.4)',
      
      // Chart colors
      '--chart-1': '#00D4AA',
      '--chart-2': '#6C63FF',
      '--chart-3': '#FF6B6B',
      '--chart-4': '#FFD93D',
      '--chart-5': '#4ECDC4'
    }
  },
  
  light: {
    name: 'light',
    label: 'Mode clair',
    colors: {
      // Backgrounds
      '--bg-primary': '#f5f5f7',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e8e8ed',
      '--card-bg': '#ffffff',
      '--sidebar-bg': '#1e1e3f',
      '--sidebar-hover': 'rgba(0, 212, 170, 0.15)',
      
      // Primary colors
      '--primary-color': '#00a884',
      '--primary-hover': '#008f71',
      '--primary-light': 'rgba(0, 168, 132, 0.1)',
      
      // Text colors
      '--text-primary': '#1a1a2e',
      '--text-secondary': '#666666',
      '--text-muted': '#999999',
      
      // Border colors
      '--border-color': 'rgba(0, 0, 0, 0.1)',
      '--border-light': 'rgba(0, 0, 0, 0.05)',
      
      // Status colors
      '--success-color': '#2e7d32',
      '--success-bg': 'rgba(46, 125, 50, 0.1)',
      '--warning-color': '#ed6c02',
      '--warning-bg': 'rgba(237, 108, 2, 0.1)',
      '--danger-color': '#d32f2f',
      '--danger-bg': 'rgba(211, 47, 47, 0.1)',
      '--info-color': '#0288d1',
      '--info-bg': 'rgba(2, 136, 209, 0.1)',
      
      // Input colors
      '--input-bg': '#ffffff',
      '--input-border': 'rgba(0, 0, 0, 0.15)',
      '--input-focus-border': '#00a884',
      
      // Shadow
      '--shadow': '0 2px 8px rgba(0, 0, 0, 0.08)',
      '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      
      // Chart colors
      '--chart-1': '#00a884',
      '--chart-2': '#5B52D9',
      '--chart-3': '#E53935',
      '--chart-4': '#F9A825',
      '--chart-5': '#26A69A'
    }
  }
};

// Context
const ThemeContext = createContext(null);

/**
 * Provider du thème
 */
export const ThemeProvider = ({ children }) => {
  // Récupérer le thème sauvegardé ou utiliser la préférence système
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('marketpro_theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    
    // Préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Appliquer le thème au document
  useEffect(() => {
    const themeConfig = themes[theme];
    const root = document.documentElement;
    
    // Appliquer toutes les variables CSS
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Ajouter/retirer la classe du thème
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    
    // Meta theme-color pour mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeConfig.colors['--bg-primary']);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('marketpro_theme', theme);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem('marketpro_theme');
      // Ne changer que si l'utilisateur n'a pas fait de choix explicite
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fonctions de changement de thème
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const value = useMemo(() => ({
    theme,
    themeConfig: themes[theme],
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme,
    setLightTheme,
    setDarkTheme,
    themes
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook pour utiliser le thème
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Composant Toggle du thème
 */
export const ThemeToggle = ({ showLabel = true, size = 'medium' }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'theme-toggle-sm',
    medium: 'theme-toggle-md',
    large: 'theme-toggle-lg'
  };

  return (
    <button
      className={`theme-toggle ${sizeClasses[size]} ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? 'Mode sombre' : 'Mode clair'}
        </span>
      )}
    </button>
  );
};

/**
 * Composant de sélection de thème (dropdown)
 */
export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select">Thème :</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        <option value="dark">🌙 Mode sombre</option>
        <option value="light">☀️ Mode clair</option>
      </select>
    </div>
  );
};

/**
 * Styles CSS pour le thème
 */
export const ThemeStyles = `
/* Theme Toggle Button */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--sidebar-hover);
}

.theme-toggle-track {
  position: relative;
  width: 50px;
  height: 26px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 13px;
  transition: all 0.3s ease;
}

.theme-toggle.dark .theme-toggle-track {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-toggle.dark .theme-toggle-thumb {
  transform: translateX(24px);
}

.theme-icon {
  width: 14px;
  height: 14px;
  color: var(--primary-color);
}

.theme-toggle.dark .theme-icon {
  color: #ffc107;
}

.theme-toggle-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Sizes */
.theme-toggle-sm .theme-toggle-track {
  width: 40px;
  height: 22px;
}

.theme-toggle-sm .theme-toggle-thumb {
  width: 16px;
  height: 16px;
}

.theme-toggle-sm.dark .theme-toggle-thumb {
  transform: translateX(18px);
}

.theme-toggle-lg .theme-toggle-track {
  width: 60px;
  height: 32px;
  border-radius: 16px;
}

.theme-toggle-lg .theme-toggle-thumb {
  width: 26px;
  height: 26px;
}

.theme-toggle-lg.dark .theme-toggle-thumb {
  transform: translateX(28px);
}

/* Theme Selector Dropdown */
.theme-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-selector label {
  font-size: 14px;
  color: var(--text-secondary);
}

.theme-select {
  padding: 8px 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-select:hover {
  border-color: var(--primary-color);
}

.theme-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* Theme-specific overrides for light mode */
.theme-light .card {
  box-shadow: var(--shadow);
}

.theme-light .sidebar {
  color: #ffffff;
}

.theme-light .modal-content {
  background: var(--card-bg);
}

.theme-light input,
.theme-light select,
.theme-light textarea {
  background: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-primary);
}

.theme-light .table th {
  background: var(--bg-tertiary);
}

.theme-light .table tr:hover {
  background: var(--bg-tertiary);
}

/* Smooth transitions when changing theme */
body,
.card,
.sidebar,
.header,
input,
select,
textarea,
button,
.modal-content,
.dropdown-menu {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease,
              box-shadow 0.3s ease;
}
`;

export default { ThemeProvider, useTheme, ThemeToggle, ThemeSelector, themes };

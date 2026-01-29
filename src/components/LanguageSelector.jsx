// ============================================
// MARKET PRO - Composant de sélection de langue
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages } from '../i18n';

/**
 * Sélecteur de langue dropdown
 */
export const LanguageSelector = ({ variant = 'dropdown', showLabel = true }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = supportedLanguages[i18n.language] || supportedLanguages.fr;

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className="language-buttons">
        {Object.entries(supportedLanguages).map(([code, lang]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`language-btn ${i18n.language === code ? 'active' : ''}`}
            title={lang.name}
          >
            <span className="language-flag">{lang.flag}</span>
            {showLabel && <span className="language-code">{code.toUpperCase()}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={18} />
        <span className="current-language">
          <span className="language-flag">{currentLang.flag}</span>
          {showLabel && <span className="language-name">{currentLang.nativeName}</span>}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown" role="listbox">
          {Object.entries(supportedLanguages).map(([code, lang]) => (
            <button
              key={code}
              role="option"
              aria-selected={i18n.language === code}
              className={`language-option ${i18n.language === code ? 'selected' : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.nativeName}</span>
              {i18n.language === code && <Check size={16} className="check-icon" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Hook pour formater les montants selon la locale
 */
export const useFormatCurrency = () => {
  const { i18n } = useTranslation();

  return (amount, currency = 'EUR') => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  };
};

/**
 * Hook pour formater les dates selon la locale
 */
export const useFormatDate = () => {
  const { i18n } = useTranslation();

  return (date, options = {}) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
  };
};

/**
 * Hook pour formater les nombres selon la locale
 */
export const useFormatNumber = () => {
  const { i18n } = useTranslation();

  return (number, options = {}) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, options).format(number);
  };
};

/**
 * Composant pour afficher du texte traduit avec interpolation
 */
export const Trans = ({ i18nKey, values, components, children }) => {
  const { t } = useTranslation();
  
  if (children) {
    return <>{children}</>;
  }

  return <>{t(i18nKey, values)}</>;
};

/**
 * Styles CSS pour le sélecteur de langue
 */
export const LanguageSelectorStyles = `
/* Sélecteur de langue dropdown */
.language-selector {
  position: relative;
  display: inline-block;
}

.language-selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--sidebar-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-selector-trigger:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.current-language {
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-flag {
  font-size: 1.2em;
}

.language-name {
  font-size: 14px;
  font-weight: 500;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

[dir="rtl"] .language-dropdown {
  right: auto;
  left: 0;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.language-option:hover {
  background: var(--sidebar-hover);
}

.language-option.selected {
  background: rgba(0, 212, 170, 0.1);
  color: var(--primary-color);
}

.check-icon {
  margin-left: auto;
  color: var(--primary-color);
}

[dir="rtl"] .check-icon {
  margin-left: 0;
  margin-right: auto;
}

/* Boutons de langue */
.language-buttons {
  display: flex;
  gap: 4px;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--sidebar-hover);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-btn:hover {
  border-color: var(--border-color);
  color: var(--text-primary);
}

.language-btn.active {
  background: var(--primary-color);
  color: white;
}

.language-code {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Support RTL global */
body.rtl {
  direction: rtl;
  text-align: right;
}

body.rtl .sidebar {
  left: auto;
  right: 0;
  border-left: 1px solid var(--border-color);
  border-right: none;
}

body.rtl .main-content {
  margin-left: 0;
  margin-right: 250px;
}

body.rtl .sidebar.collapsed ~ .main-content {
  margin-right: 70px;
}

body.rtl .header {
  flex-direction: row-reverse;
}

body.rtl .search-input {
  padding-right: 40px;
  padding-left: 16px;
}

body.rtl .search-icon {
  right: auto;
  left: 12px;
}

body.rtl table {
  text-align: right;
}

body.rtl .modal-close {
  right: auto;
  left: 16px;
}

body.rtl .icon-left {
  margin-right: 0;
  margin-left: 8px;
}

body.rtl .icon-right {
  margin-left: 0;
  margin-right: 8px;
}
`;

export default LanguageSelector;

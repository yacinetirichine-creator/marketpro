// ============================================
// MARKET PRO - Configuration i18n
// ============================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importation des traductions
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Liste des langues supportées
export const supportedLanguages = {
  fr: { name: 'Français', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' }
};

// Configuration i18n
i18n
  // Détection automatique de la langue
  .use(LanguageDetector)
  // Plugin React
  .use(initReactI18next)
  // Initialisation
  .init({
    // Ressources de traduction
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar }
    },

    // Langue par défaut
    fallbackLng: 'fr',
    
    // Langue supportées
    supportedLngs: Object.keys(supportedLanguages),

    // Debug (désactivé en production)
    debug: process.env.NODE_ENV === 'development',

    // Options d'interpolation
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
      formatSeparator: ','
    },

    // Options de détection
    detection: {
      // Ordre de détection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Où sauvegarder la langue
      caches: ['localStorage'],
      // Clé dans localStorage
      lookupLocalStorage: 'marketpro_language'
    },

    // React Suspense
    react: {
      useSuspense: true
    }
  });

// Fonction pour changer la direction du document (RTL/LTR)
export const updateDocumentDirection = (language) => {
  const dir = supportedLanguages[language]?.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  
  // Ajouter/retirer la classe RTL pour le styling
  if (dir === 'rtl') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
};

// Écouter les changements de langue
i18n.on('languageChanged', (language) => {
  updateDocumentDirection(language);
  // Sauvegarder dans localStorage
  localStorage.setItem('marketpro_language', language);
});

// Initialiser la direction au chargement
updateDocumentDirection(i18n.language);

export default i18n;

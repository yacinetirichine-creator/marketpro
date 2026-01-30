// ============================================
// MARKET PRO - UTILITAIRES ACCESSIBILITÉ
// Hooks et helpers pour l'accessibilité WCAG 2.1
// ============================================

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// CONSTANTES
// ============================================

export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

// Rôles ARIA courants
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  MENUBAR: 'menubar',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  MAIN: 'main',
  REGION: 'region',
  LISTBOX: 'listbox',
  OPTION: 'option',
  GRID: 'grid',
  ROW: 'row',
  CELL: 'gridcell',
  PROGRESSBAR: 'progressbar'
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour la gestion du focus dans un conteneur
 * (navigation clavier dans les menus, listes, etc.)
 */
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus le premier élément
    firstElement?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== KEYS.TAB) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
};

/**
 * Hook pour la navigation clavier dans une liste
 */
export const useArrowNavigation = (itemsCount, options = {}) => {
  const {
    vertical = true,
    horizontal = false,
    loop = true,
    onSelect,
    initialIndex = 0
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemsRef = useRef([]);

  const setItemRef = useCallback((index) => (el) => {
    itemsRef.current[index] = el;
  }, []);

  const focusItem = useCallback((index) => {
    const clampedIndex = loop
      ? ((index % itemsCount) + itemsCount) % itemsCount
      : Math.max(0, Math.min(index, itemsCount - 1));

    setActiveIndex(clampedIndex);
    itemsRef.current[clampedIndex]?.focus();
  }, [itemsCount, loop]);

  const handleKeyDown = useCallback((e) => {
    let newIndex = activeIndex;

    switch (e.key) {
      case KEYS.ARROW_DOWN:
        if (vertical) {
          e.preventDefault();
          newIndex = activeIndex + 1;
        }
        break;
      case KEYS.ARROW_UP:
        if (vertical) {
          e.preventDefault();
          newIndex = activeIndex - 1;
        }
        break;
      case KEYS.ARROW_RIGHT:
        if (horizontal) {
          e.preventDefault();
          newIndex = activeIndex + 1;
        }
        break;
      case KEYS.ARROW_LEFT:
        if (horizontal) {
          e.preventDefault();
          newIndex = activeIndex - 1;
        }
        break;
      case KEYS.HOME:
        e.preventDefault();
        newIndex = 0;
        break;
      case KEYS.END:
        e.preventDefault();
        newIndex = itemsCount - 1;
        break;
      case KEYS.ENTER:
      case KEYS.SPACE:
        e.preventDefault();
        onSelect?.(activeIndex);
        return;
      default:
        return;
    }

    focusItem(newIndex);
  }, [activeIndex, itemsCount, vertical, horizontal, loop, focusItem, onSelect]);

  return {
    activeIndex,
    setActiveIndex,
    setItemRef,
    handleKeyDown,
    focusItem,
    getItemProps: (index) => ({
      ref: setItemRef(index),
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      onKeyDown: handleKeyDown,
      onClick: () => {
        setActiveIndex(index);
        onSelect?.(index);
      }
    })
  };
};

/**
 * Hook pour les annonces live region
 */
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState('polite');

  const announce = useCallback((message, priority = 'polite') => {
    setPoliteness(priority);
    // Reset puis set pour forcer l'annonce même si le message est identique
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {announcement}
    </div>
  ), [announcement, politeness]);

  return { announce, LiveRegion };
};

/**
 * Hook pour la détection de la préférence de mouvement réduit
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook pour la gestion du focus visible
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [hadKeyboardEvent, setHadKeyboardEvent] = useState(false);

  useEffect(() => {
    const onKeyDown = () => setHadKeyboardEvent(true);
    const onPointerDown = () => setHadKeyboardEvent(false);

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, []);

  const onFocus = useCallback(() => {
    setIsFocusVisible(hadKeyboardEvent);
  }, [hadKeyboardEvent]);

  const onBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return { isFocusVisible, onFocus, onBlur };
};

// ============================================
// HELPERS
// ============================================

/**
 * Génère un ID unique pour les associations ARIA
 */
let idCounter = 0;
export const generateId = (prefix = 'a11y') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * Vérifie si un élément est focusable
 */
export const isFocusable = (element) => {
  if (!element || element.disabled) return false;

  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');

  if (tabIndex === '-1') return false;

  if (['button', 'input', 'select', 'textarea'].includes(tagName)) {
    return true;
  }

  if (tagName === 'a' && element.hasAttribute('href')) {
    return true;
  }

  if (tabIndex !== null && tabIndex !== '-1') {
    return true;
  }

  return false;
};

/**
 * Récupère tous les éléments focusables dans un conteneur
 */
export const getFocusableElements = (container) => {
  if (!container) return [];

  const elements = container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
  );

  return Array.from(elements).filter(isFocusable);
};

/**
 * Props ARIA pour les modals/dialogs
 */
export const getDialogProps = (isOpen, labelId, descriptionId) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-hidden': !isOpen,
  'aria-labelledby': labelId,
  'aria-describedby': descriptionId
});

/**
 * Props ARIA pour les boutons de menu
 */
export const getMenuButtonProps = (isExpanded, menuId) => ({
  'aria-haspopup': 'menu',
  'aria-expanded': isExpanded,
  'aria-controls': menuId
});

/**
 * Props ARIA pour les tabs
 */
export const getTabProps = (id, isSelected, panelId) => ({
  role: 'tab',
  id,
  'aria-selected': isSelected,
  'aria-controls': panelId,
  tabIndex: isSelected ? 0 : -1
});

/**
 * Props ARIA pour les tab panels
 */
export const getTabPanelProps = (id, isVisible, tabId) => ({
  role: 'tabpanel',
  id,
  'aria-labelledby': tabId,
  hidden: !isVisible,
  tabIndex: 0
});

/**
 * Props ARIA pour les inputs avec erreur
 */
export const getErrorInputProps = (inputId, errorId, hasError, errorMessage) => ({
  'aria-invalid': hasError,
  'aria-errormessage': hasError ? errorId : undefined,
  'aria-describedby': hasError ? errorId : undefined
});

/**
 * Props ARIA pour les champs de recherche
 */
export const getSearchProps = (label = 'Rechercher') => ({
  role: 'search',
  'aria-label': label
});

/**
 * Props ARIA pour les éléments de navigation
 */
export const getNavProps = (label) => ({
  role: 'navigation',
  'aria-label': label
});

/**
 * Props ARIA pour les barres de progression
 */
export const getProgressProps = (value, min = 0, max = 100, label) => ({
  role: 'progressbar',
  'aria-valuenow': value,
  'aria-valuemin': min,
  'aria-valuemax': max,
  'aria-valuetext': `${Math.round((value / max) * 100)}%`,
  'aria-label': label
});

/**
 * Props ARIA pour les tooltips
 */
export const getTooltipProps = (id) => ({
  role: 'tooltip',
  id
});

/**
 * Props ARIA pour les éléments déclenchant un tooltip
 */
export const getTooltipTriggerProps = (tooltipId, isVisible) => ({
  'aria-describedby': isVisible ? tooltipId : undefined
});

/**
 * Composant VisuallyHidden pour le texte accessible uniquement aux lecteurs d'écran
 */
export const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
};

/**
 * Skip link pour la navigation au clavier
 */
export const SkipLink = ({ href = '#main-content', children = 'Aller au contenu principal' }) => (
  <a
    href={href}
    className="skip-link"
    style={{
      position: 'absolute',
      top: '-40px',
      left: 0,
      padding: '8px 16px',
      backgroundColor: '#1a73e8',
      color: 'white',
      textDecoration: 'none',
      zIndex: 10000,
      transition: 'top 0.2s'
    }}
    onFocus={(e) => { e.target.style.top = '0'; }}
    onBlur={(e) => { e.target.style.top = '-40px'; }}
  >
    {children}
  </a>
);

// Export par défaut des utilitaires les plus courants
export default {
  useFocusTrap,
  useArrowNavigation,
  useAnnounce,
  useReducedMotion,
  useFocusVisible,
  generateId,
  getFocusableElements,
  getDialogProps,
  getMenuButtonProps,
  getTabProps,
  getTabPanelProps,
  getSearchProps,
  getNavProps,
  getProgressProps,
  SkipLink,
  KEYS,
  ARIA_ROLES
};

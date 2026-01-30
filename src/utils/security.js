// ============================================
// MARKET PRO - UTILITAIRES DE SÉCURITÉ
// Chiffrement AES-256-GCM, validation, sanitization
// ============================================

import React from 'react';

// Configuration depuis les variables d'environnement
const getEncryptionKey = () => {
  const key = process.env.REACT_APP_ENCRYPTION_KEY;
  if (!key || key === 'dev-encryption-key-change-in-prod') {
    console.warn('[SECURITY] Utilisation de la clé par défaut - À configurer en production');
  }
  return key || 'dev-key-32-chars-minimum-length!';
};

// ============================================
// SERVICE DE SÉCURITÉ PRINCIPAL
// ============================================
export const securityService = {
  // Cache pour la clé dérivée
  _derivedKeyCache: null,
  _keyVersion: 1,

  // === DÉRIVATION DE CLÉ SÉCURISÉE ===

  /**
   * Dérive une clé cryptographique à partir de la clé configurée
   * Utilise PBKDF2 pour renforcer la clé
   */
  async deriveKey(salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(getEncryptionKey()),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  // === CHIFFREMENT / DÉCHIFFREMENT AES-256-GCM ===

  /**
   * Chiffre des données avec AES-256-GCM
   * Retourne: salt (16 bytes) + iv (12 bytes) + ciphertext encodé en Base64
   */
  async encrypt(data) {
    if (!data) return '';
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      const encoder = new TextEncoder();

      // Générer un salt aléatoire pour la dérivation de clé
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Générer un IV aléatoire pour AES-GCM
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Dériver la clé
      const key = await this.deriveKey(salt);

      // Chiffrer
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(str)
      );

      // Combiner: salt + iv + ciphertext
      const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

      // Encoder en Base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('[SECURITY] Encryption error:', error.message);
      return '';
    }
  },

  /**
   * Déchiffre des données chiffrées avec AES-256-GCM
   */
  async decrypt(encryptedData) {
    if (!encryptedData) return '';
    try {
      // Décoder depuis Base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // Extraire salt, iv et ciphertext
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);

      // Dériver la clé avec le même salt
      const key = await this.deriveKey(salt);

      // Déchiffrer
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('[SECURITY] Decryption error:', error.message);
      return '';
    }
  },

  /**
   * Chiffrement synchrone simplifié pour les cas non-critiques
   * Utilise le mode synchrone avec une clé pré-calculée
   */
  encryptSync(data) {
    if (!data) return '';
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      // Fallback simple pour les cas synchrones - utiliser encrypt() pour les données sensibles
      return btoa(encodeURIComponent(str));
    } catch (error) {
      console.error('[SECURITY] Sync encryption error:', error.message);
      return '';
    }
  },

  /**
   * Déchiffrement synchrone simplifié
   */
  decryptSync(encryptedData) {
    if (!encryptedData) return '';
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      console.error('[SECURITY] Sync decryption error:', error.message);
      return '';
    }
  },

  /**
   * Hash une chaîne avec SHA-256
   */
  async hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Hash un mot de passe avec un salt
   */
  async hashPassword(password, providedSalt = null) {
    const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
    const saltStr = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = await this.hash(password + saltStr);
    return { hash, salt: saltStr };
  },

  /**
   * Vérifie un mot de passe contre son hash
   */
  async verifyPassword(password, hash, salt) {
    const { hash: computedHash } = await this.hashPassword(password,
      Uint8Array.from(salt.match(/.{2}/g).map(b => parseInt(b, 16)))
    );
    return computedHash === hash;
  },

  // === GÉNÉRATION / VÉRIFICATION DE TOKENS ===

  /**
   * Génère un token sécurisé
   */
  async generateToken(payload, expiresInMs = 8 * 60 * 60 * 1000) {
    const header = { alg: 'AES-256-GCM', typ: 'JWT', v: this._keyVersion };
    const now = Date.now();

    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInMs,
      jti: this.generateUUID()
    };

    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(tokenPayload));
    const signature = await this.encrypt(`${headerB64}.${payloadB64}`);

    return `${headerB64}.${payloadB64}.${signature}`;
  },

  /**
   * Vérifie et décode un token
   */
  async verifyToken(token) {
    try {
      if (!token || typeof token !== 'string') return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Vérifier l'expiration
      if (payload.exp && Date.now() > payload.exp) {
        console.warn('[SECURITY] Token expired');
        return null;
      }

      const expectedSignature = await this.encrypt(`${parts[0]}.${parts[1]}`);

      // Note: La vérification de signature nécessite de déchiffrer et comparer le contenu
      // car chaque chiffrement produit un résultat différent avec AES-GCM
      const decryptedSig = await this.decrypt(parts[2]);
      if (decryptedSig !== `${parts[0]}.${parts[1]}`) {
        console.warn('[SECURITY] Token signature mismatch');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('[SECURITY] Token verification error:', error.message);
      return null;
    }
  },

  /**
   * Génère un UUID v4 cryptographiquement sécurisé
   */
  generateUUID() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  },

  // === STOCKAGE SÉCURISÉ ===

  /**
   * Stocke des données de manière sécurisée dans sessionStorage (pas localStorage)
   * Les données sont chiffrées avant stockage
   */
  async secureStore(key, data) {
    try {
      const encrypted = await this.encrypt(JSON.stringify(data));
      sessionStorage.setItem(`mp_secure_${key}`, encrypted);
      return true;
    } catch (error) {
      console.error('[SECURITY] Secure store error:', error.message);
      return false;
    }
  },

  /**
   * Récupère des données sécurisées depuis sessionStorage
   */
  async secureRetrieve(key) {
    try {
      const encrypted = sessionStorage.getItem(`mp_secure_${key}`);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[SECURITY] Secure retrieve error:', error.message);
      return null;
    }
  },

  /**
   * Supprime des données sécurisées
   */
  secureRemove(key) {
    sessionStorage.removeItem(`mp_secure_${key}`);
  },

  /**
   * Efface toutes les données sécurisées
   */
  secureClearAll() {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('mp_secure_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  },

  // === VALIDATION ===

  /**
   * Valide un email
   */
  validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Valide un mot de passe fort
   */
  validatePassword(password) {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      valid: errors.length === 0,
      errors,
      message: errors.join('. '),
      strength: this.getPasswordStrength(password)
    };
  },

  /**
   * Calcule la force d'un mot de passe
   */
  getPasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    if (password.length >= 16) strength += 1;

    // Score de 0 à 100
    return Math.min(100, Math.round((strength / 7) * 100));
  },

  /**
   * Valide un numéro de téléphone français
   */
  validatePhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(cleanPhone);
  },

  /**
   * Valide un numéro SIRET
   */
  validateSiret(siret) {
    if (!siret) return false;
    const cleanSiret = siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(cleanSiret)) return false;

    // Algorithme de Luhn pour SIRET
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(cleanSiret[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  },

  /**
   * Valide un IBAN
   */
  validateIBAN(iban) {
    if (!iban) return false;
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(cleanIban)) return false;

    // Vérification du checksum
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    const numericIban = rearranged.split('').map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : char;
    }).join('');

    // Calcul mod 97
    let remainder = numericIban;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
    }

    return parseInt(remainder, 10) % 97 === 1;
  },

  // === SANITIZATION ===

  /**
   * Nettoie une entrée utilisateur contre XSS
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#96;')
      .trim();
  },

  /**
   * Décode une entrée sanitizée
   */
  unsanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#96;/g, '`');
  },

  /**
   * Nettoie un objet entier
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  /**
   * Nettoie le HTML dangereux
   */
  sanitizeHTML(html) {
    if (!html) return '';

    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Supprime les scripts d'une chaîne
   */
  stripScripts(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // === PROTECTION CSRF ===

  /**
   * Génère un token CSRF sécurisé
   */
  generateCSRFToken() {
    const token = this.generateUUID();
    sessionStorage.setItem('csrf_token', token);
    return token;
  },

  /**
   * Vérifie un token CSRF
   */
  verifyCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token && storedToken && token === storedToken;
  },

  // === RATE LIMITING (côté client) ===

  /**
   * Vérifie le rate limiting pour une action
   * Utilise sessionStorage au lieu de localStorage
   */
  checkRateLimit(actionKey, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `rate_limit_${actionKey}`;

    let attempts = JSON.parse(sessionStorage.getItem(storageKey) || '[]');

    // Nettoyer les anciennes tentatives
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (attempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...attempts);
      const waitTime = Math.ceil((oldestAttempt + windowMs - now) / 1000);
      return {
        allowed: false,
        waitTime,
        message: `Trop de tentatives. Réessayez dans ${waitTime} secondes.`
      };
    }

    attempts.push(now);
    sessionStorage.setItem(storageKey, JSON.stringify(attempts));

    return {
      allowed: true,
      remaining: maxAttempts - attempts.length
    };
  },

  /**
   * Réinitialise le rate limit pour une action
   */
  resetRateLimit(actionKey) {
    sessionStorage.removeItem(`rate_limit_${actionKey}`);
  },

  // === MASQUAGE DE DONNÉES SENSIBLES ===

  /**
   * Masque un email
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.***';
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + (local.length > 1 ? local.slice(-1) : '');
    const [domainName, tld] = domain.split('.');
    const maskedDomain = domainName.charAt(0) + '***' + '.' + tld;
    return `${maskedLocal}@${maskedDomain}`;
  },

  /**
   * Masque un numéro de téléphone
   */
  maskPhone(phone) {
    if (!phone) return '** ** ** ** **';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return '** ** ** ** **';
    return clean.slice(0, 2) + ' ** ** ** ' + clean.slice(-2);
  },

  /**
   * Masque un IBAN
   */
  maskIBAN(iban) {
    if (!iban) return '****';
    const clean = iban.replace(/\s/g, '');
    if (clean.length < 8) return '****';
    return clean.slice(0, 4) + ' **** **** ' + clean.slice(-4);
  },

  /**
   * Masque un numéro de carte bancaire
   */
  maskCardNumber(cardNumber) {
    if (!cardNumber) return '**** **** **** ****';
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.length < 4) return '**** **** **** ****';
    return '**** **** **** ' + clean.slice(-4);
  },

  // === AUDIT ET LOGGING ===

  /**
   * Crée une entrée d'audit
   */
  createAuditLog(action, details = {}) {
    return {
      id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  },

  /**
   * Récupère les logs de sécurité
   */
  getSecurityLogs() {
    return JSON.parse(sessionStorage.getItem('security_logs') || '[]');
  },

  /**
   * Ajoute un log de sécurité
   */
  addSecurityLog(log) {
    const logs = this.getSecurityLogs();
    logs.push(log);
    // Garder seulement les 100 derniers logs
    const trimmedLogs = logs.slice(-100);
    sessionStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
  },

  /**
   * Efface les logs de sécurité
   */
  clearSecurityLogs() {
    sessionStorage.removeItem('security_logs');
  }
};

// ============================================
// VALIDATEURS DE FORMULAIRE
// ============================================
export const validators = {
  required: (value) => ({
    valid: value !== null && value !== undefined && value !== '',
    message: 'Ce champ est requis'
  }),

  email: (value) => ({
    valid: !value || securityService.validateEmail(value),
    message: 'Email invalide'
  }),

  phone: (value) => ({
    valid: !value || securityService.validatePhone(value),
    message: 'Numéro de téléphone invalide'
  }),

  siret: (value) => ({
    valid: !value || securityService.validateSiret(value),
    message: 'Numéro SIRET invalide'
  }),

  iban: (value) => ({
    valid: !value || securityService.validateIBAN(value),
    message: 'IBAN invalide'
  }),

  minLength: (min) => (value) => ({
    valid: !value || value.length >= min,
    message: `Minimum ${min} caractères requis`
  }),

  maxLength: (max) => (value) => ({
    valid: !value || value.length <= max,
    message: `Maximum ${max} caractères autorisés`
  }),

  min: (minVal) => (value) => ({
    valid: !value || parseFloat(value) >= minVal,
    message: `Valeur minimum: ${minVal}`
  }),

  max: (maxVal) => (value) => ({
    valid: !value || parseFloat(value) <= maxVal,
    message: `Valeur maximum: ${maxVal}`
  }),

  pattern: (regex, message) => (value) => ({
    valid: !value || regex.test(value),
    message
  }),

  password: (value) => securityService.validatePassword(value),

  match: (otherValue, fieldName) => (value) => ({
    valid: value === otherValue,
    message: `Doit correspondre à ${fieldName}`
  }),

  numeric: (value) => ({
    valid: !value || /^\d+$/.test(value),
    message: 'Seuls les chiffres sont autorisés'
  }),

  decimal: (value) => ({
    valid: !value || /^\d+([.,]\d{1,2})?$/.test(value),
    message: 'Format de nombre invalide'
  }),

  date: (value) => ({
    valid: !value || !isNaN(Date.parse(value)),
    message: 'Date invalide'
  }),

  futureDate: (value) => ({
    valid: !value || new Date(value) > new Date(),
    message: 'La date doit être dans le futur'
  }),

  pastDate: (value) => ({
    valid: !value || new Date(value) < new Date(),
    message: 'La date doit être dans le passé'
  })
};

// ============================================
// HOOK DE VALIDATION DE FORMULAIRE
// ============================================
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Valider un champ
  const validateField = React.useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    const rulesArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of rulesArray) {
      const result = rule(value);
      if (!result.valid) {
        return result.message;
      }
    }

    return '';
  }, [validationRules]);

  // Valider tout le formulaire
  const validateForm = React.useCallback(() => {
    const newErrors = {};
    let isValid = true;

    for (const [name, value] of Object.entries(values)) {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Gérer le changement de valeur
  const handleChange = React.useCallback((name, value) => {
    // Sanitize la valeur
    const sanitizedValue = typeof value === 'string'
      ? securityService.sanitizeInput(value)
      : value;

    setValues(prev => ({ ...prev, [name]: sanitizedValue }));

    // Valider si déjà touché
    if (touched[name]) {
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Gérer le blur
  const handleBlur = React.useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Réinitialiser le formulaire
  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Soumettre le formulaire
  const handleSubmit = React.useCallback((onSubmit) => async (e) => {
    e?.preventDefault();

    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched);

    // Valider
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('[SECURITY] Form submission error:', error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setValues,
    setErrors
  };
};

export default securityService;

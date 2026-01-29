// ============================================
// MARKET PRO - UTILITAIRES DE SÉCURITÉ
// Chiffrement, validation, sanitization
// ============================================

// Clé de chiffrement (en production, utiliser une variable d'environnement)
const ENCRYPTION_KEY = 'market-pro-secure-key-2025';
const SALT = 'mp-salt-v2';

// ============================================
// SERVICE DE SÉCURITÉ PRINCIPAL
// ============================================
export const securityService = {
  // === CHIFFREMENT / DÉCHIFFREMENT ===
  
  /**
   * Chiffre une chaîne de caractères
   * Utilise XOR avec la clé + Base64 (simple pour le client)
   * En production, utiliser Web Crypto API ou une lib comme crypto-js
   */
  encrypt(data) {
    if (!data) return '';
    try {
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      const key = ENCRYPTION_KEY + SALT;
      let result = '';
      
      for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(
          str.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encodeURIComponent(result));
    } catch (error) {
      console.error('Encryption error:', error);
      return '';
    }
  },

  /**
   * Déchiffre une chaîne chiffrée
   */
  decrypt(encryptedData) {
    if (!encryptedData) return '';
    try {
      const key = ENCRYPTION_KEY + SALT;
      const decoded = decodeURIComponent(atob(encryptedData));
      let result = '';
      
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  },

  /**
   * Hash une chaîne (pour les mots de passe, etc.)
   * Utilise SHA-256 via Web Crypto API
   */
  async hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // === GÉNÉRATION / VÉRIFICATION DE TOKENS ===

  /**
   * Génère un token JWT-like (simplifié pour le client)
   */
  generateToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Date.now();
    
    const tokenPayload = {
      ...payload,
      iat: now,
      jti: this.generateUUID()
    };
    
    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(tokenPayload));
    const signature = this.encrypt(`${headerB64}.${payloadB64}`);
    
    return `${headerB64}.${payloadB64}.${signature}`;
  },

  /**
   * Vérifie et décode un token
   */
  verifyToken(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      const expectedSignature = this.encrypt(`${parts[0]}.${parts[1]}`);
      
      if (parts[2] !== expectedSignature) {
        console.warn('Token signature mismatch');
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  },

  /**
   * Génère un UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
   * Génère un token CSRF
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
   */
  checkRateLimit(actionKey, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `rate_limit_${actionKey}`;
    
    let attempts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
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
    localStorage.setItem(storageKey, JSON.stringify(attempts));
    
    return {
      allowed: true,
      remaining: maxAttempts - attempts.length
    };
  },

  /**
   * Réinitialise le rate limit pour une action
   */
  resetRateLimit(actionKey) {
    localStorage.removeItem(`rate_limit_${actionKey}`);
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
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  },

  /**
   * Efface les logs de sécurité
   */
  clearSecurityLogs() {
    localStorage.removeItem('security_logs');
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
      console.error('Form submission error:', error);
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

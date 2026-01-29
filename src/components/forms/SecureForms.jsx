// ============================================
// MARKET PRO - COMPOSANTS DE FORMULAIRE SÉCURISÉS
// Validation, protection XSS/CSRF, UX
// ============================================

import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { 
  Eye, EyeOff, AlertCircle, CheckCircle, X, 
  Info, Calendar, Search, ChevronDown, Loader2
} from 'lucide-react';
import { securityService, validators } from '../utils/security';

// ============================================
// INPUT SÉCURISÉ
// ============================================
export const SecureInput = forwardRef(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  hint,
  icon: Icon,
  maxLength,
  minLength,
  pattern,
  autoComplete = 'off',
  sanitize = true,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = useCallback((e) => {
    let newValue = e.target.value;
    
    // Sanitization XSS
    if (sanitize && type !== 'password') {
      newValue = securityService.sanitizeInput(newValue);
    }

    onChange?.(name, newValue);
  }, [name, onChange, sanitize, type]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(name);
  }, [name, onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`secure-input-group ${className} ${error ? 'has-error' : ''} ${isFocused ? 'focused' : ''}`}>
      {label && (
        <label className="secure-input-label" htmlFor={name}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className="secure-input-wrapper">
        {Icon && (
          <span className="input-icon left">
            <Icon size={18} />
          </span>
        )}
        
        <input
          ref={ref || inputRef}
          id={name}
          name={name}
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`secure-input ${Icon ? 'has-icon-left' : ''} ${type === 'password' ? 'has-icon-right' : ''}`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {error && (
          <span className="input-icon right error-icon">
            <AlertCircle size={18} />
          </span>
        )}
      </div>

      {(error || hint) && (
        <div className={`secure-input-message ${error ? 'error' : 'hint'}`}>
          {error || hint}
        </div>
      )}

      <style>{`
        .secure-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .secure-input-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .required-mark {
          color: var(--color-accent-danger);
          margin-left: 0.25rem;
        }

        .secure-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .secure-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .secure-input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
        }

        .secure-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secure-input.has-icon-left {
          padding-left: 2.75rem;
        }

        .secure-input.has-icon-right {
          padding-right: 2.75rem;
        }

        .input-icon {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .input-icon.left {
          left: 1rem;
        }

        .input-icon.right {
          right: 1rem;
        }

        .input-icon.error-icon {
          color: var(--color-accent-danger);
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: var(--color-text-primary);
        }

        .secure-input-group.has-error .secure-input {
          border-color: var(--color-accent-danger);
        }

        .secure-input-group.has-error .secure-input:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .secure-input-message {
          font-size: 0.8125rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .secure-input-message.error {
          color: var(--color-accent-danger);
        }

        .secure-input-message.hint {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

// ============================================
// TEXTAREA SÉCURISÉ
// ============================================
export const SecureTextarea = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  rows = 4,
  maxLength,
  sanitize = true,
  showCharCount = false,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value?.length || 0;

  const handleChange = useCallback((e) => {
    let newValue = e.target.value;
    
    if (sanitize) {
      newValue = securityService.sanitizeInput(newValue);
    }

    onChange?.(name, newValue);
  }, [name, onChange, sanitize]);

  return (
    <div className={`secure-textarea-group ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="secure-textarea-label" htmlFor={name}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={() => { setIsFocused(false); onBlur?.(name); }}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="secure-textarea"
        {...props}
      />

      <div className="secure-textarea-footer">
        {(error || hint) && (
          <span className={`message ${error ? 'error' : 'hint'}`}>
            {error || hint}
          </span>
        )}
        {showCharCount && maxLength && (
          <span className={`char-count ${charCount >= maxLength ? 'limit' : ''}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <style>{`
        .secure-textarea-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .secure-textarea-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .secure-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
          min-height: 100px;
        }

        .secure-textarea:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
        }

        .secure-textarea-group.has-error .secure-textarea {
          border-color: var(--color-accent-danger);
        }

        .secure-textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .secure-textarea-footer .message {
          font-size: 0.8125rem;
        }

        .secure-textarea-footer .message.error {
          color: var(--color-accent-danger);
        }

        .secure-textarea-footer .message.hint {
          color: var(--color-text-muted);
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .char-count.limit {
          color: var(--color-accent-danger);
        }
      `}</style>
    </div>
  );
});

SecureTextarea.displayName = 'SecureTextarea';

// ============================================
// SELECT SÉCURISÉ
// ============================================
export const SecureSelect = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Sélectionner...',
  required = false,
  disabled = false,
  error,
  hint,
  searchable = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectRef = useRef(null);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable && search
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange?.(name, optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`secure-select-group ${className} ${error ? 'has-error' : ''}`} ref={selectRef}>
      {label && (
        <label className="secure-select-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}

      <div className={`secure-select-wrapper ${isOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="secure-select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className={`select-arrow ${isOpen ? 'rotated' : ''}`} />
        </button>

        {isOpen && (
          <div className="secure-select-dropdown">
            {searchable && (
              <div className="select-search">
                <Search size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  autoFocus
                />
              </div>
            )}
            
            <div className="select-options">
              {filteredOptions.length === 0 ? (
                <div className="select-empty">Aucun résultat</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`select-option ${option.value === value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                    {option.value === value && <CheckCircle size={16} />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(error || hint) && (
        <div className={`secure-select-message ${error ? 'error' : 'hint'}`}>
          {error || hint}
        </div>
      )}

      <style>{`
        .secure-select-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }

        .secure-select-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .secure-select-wrapper {
          position: relative;
        }

        .secure-select-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .secure-select-trigger:hover:not(:disabled) {
          border-color: var(--color-accent-primary);
        }

        .secure-select-trigger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secure-select-wrapper.open .secure-select-trigger {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
        }

        .select-value.placeholder {
          color: var(--color-text-muted);
        }

        .select-arrow {
          color: var(--color-text-muted);
          transition: transform 0.2s;
        }

        .select-arrow.rotated {
          transform: rotate(180deg);
        }

        .secure-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .select-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .select-search input {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
        }

        .select-search svg {
          color: var(--color-text-muted);
        }

        .select-options {
          max-height: 200px;
          overflow-y: auto;
        }

        .select-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .select-option:hover {
          background: var(--color-bg-secondary);
        }

        .select-option.selected {
          color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.1);
        }

        .select-empty {
          padding: 1rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .secure-select-message {
          font-size: 0.8125rem;
        }

        .secure-select-message.error {
          color: var(--color-accent-danger);
        }

        .secure-select-message.hint {
          color: var(--color-text-muted);
        }

        .secure-select-group.has-error .secure-select-trigger {
          border-color: var(--color-accent-danger);
        }
      `}</style>
    </div>
  );
});

SecureSelect.displayName = 'SecureSelect';

// ============================================
// FORMULAIRE SÉCURISÉ AVEC CSRF
// ============================================
export const SecureForm = ({ 
  children, 
  onSubmit, 
  className = '',
  resetOnSubmit = false,
  ...props 
}) => {
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Générer un token CSRF
    const token = securityService.generateCSRFToken();
    setCsrfToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier le token CSRF
    if (!securityService.verifyCSRFToken(csrfToken)) {
      console.error('CSRF token validation failed');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(e);
      
      if (resetOnSubmit) {
        e.target.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
      // Régénérer le token après soumission
      setCsrfToken(securityService.generateCSRFToken());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`secure-form ${className}`}
      {...props}
    >
      <input type="hidden" name="_csrf" value={csrfToken} />
      {typeof children === 'function' 
        ? children({ isSubmitting, csrfToken }) 
        : children
      }
    </form>
  );
};

// ============================================
// INDICATEUR DE FORCE DE MOT DE PASSE
// ============================================
export const PasswordStrengthMeter = ({ password }) => {
  const validation = securityService.validatePassword(password || '');
  const strength = validation.strength;

  const getStrengthLabel = () => {
    if (strength < 25) return { label: 'Très faible', color: '#ef4444' };
    if (strength < 50) return { label: 'Faible', color: '#f59e0b' };
    if (strength < 75) return { label: 'Moyen', color: '#eab308' };
    if (strength < 100) return { label: 'Fort', color: '#22c55e' };
    return { label: 'Très fort', color: '#00d4aa' };
  };

  const { label, color } = getStrengthLabel();

  return (
    <div className="password-strength-meter">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="strength-bar"
            style={{
              background: strength >= level * 25 ? color : 'var(--color-border)',
            }}
          />
        ))}
      </div>
      
      <div className="strength-info">
        <span className="strength-label" style={{ color }}>
          {password ? label : ''}
        </span>
      </div>

      {password && validation.errors.length > 0 && (
        <ul className="strength-requirements">
          {validation.errors.map((error, index) => (
            <li key={index} className="requirement error">
              <X size={12} />
              {error}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .password-strength-meter {
          margin-top: 0.5rem;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        .strength-info {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.25rem;
        }

        .strength-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .strength-requirements {
          margin-top: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          padding: 0.125rem 0;
        }

        .requirement.error {
          color: var(--color-accent-danger);
        }

        .requirement.valid {
          color: var(--color-accent-success);
        }
      `}</style>
    </div>
  );
};

// ============================================
// CHECKBOX SÉCURISÉ
// ============================================
export const SecureCheckbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <label className={`secure-checkbox ${className} ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange?.(name, e.target.checked)}
        disabled={disabled}
      />
      <span className="checkbox-custom">
        {checked && <CheckCircle size={14} />}
      </span>
      <span className="checkbox-label">{label}</span>
      
      {error && <span className="checkbox-error">{error}</span>}

      <style>{`
        .secure-checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .secure-checkbox.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secure-checkbox input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          background: var(--color-bg-secondary);
        }

        .secure-checkbox input:checked + .checkbox-custom {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: var(--color-bg-primary);
        }

        .secure-checkbox:hover:not(.disabled) .checkbox-custom {
          border-color: var(--color-accent-primary);
        }

        .checkbox-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .checkbox-error {
          font-size: 0.75rem;
          color: var(--color-accent-danger);
          margin-left: auto;
        }
      `}</style>
    </label>
  );
};

export default {
  SecureInput,
  SecureTextarea,
  SecureSelect,
  SecureForm,
  SecureCheckbox,
  PasswordStrengthMeter,
};

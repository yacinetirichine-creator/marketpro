// ============================================
// MARKET PRO - PAGE DE CONNEXION
// Interface de connexion sécurisée
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, 
  Loader2, Shield, ArrowRight, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { securityService } from '../utils/security';

const LoginPage = ({ onLoginSuccess }) => {
  // État du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // État UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Auth context
  const { login } = useAuth();

  // Validation en temps réel
  useEffect(() => {
    if (password) {
      setPasswordStrength(securityService.getPasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Nettoyage des erreurs au changement
  useEffect(() => {
    if (error) setError('');
  }, [email, password]);

  // Gestion de la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!securityService.validateEmail(email)) {
      setError('Format d\'email invalide');
      return;
    }

    // Rate limiting
    const rateCheck = securityService.checkRateLimit('login', 5, 60000);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      setSuccess(`Bienvenue, ${user.firstName} !`);
      
      // Réinitialiser le rate limit après succès
      securityService.resetRateLimit('login');
      
      // Callback après connexion
      setTimeout(() => {
        onLoginSuccess?.(user);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Comptes de démonstration
  const demoAccounts = [
    { email: 'admin@marketpro.fr', role: 'Administrateur', color: '#ef4444' },
    { email: 'manager@marketpro.fr', role: 'Manager', color: '#8b5cf6' },
    { email: 'commercial@marketpro.fr', role: 'Commercial', color: '#3b82f6' },
    { email: 'comptable@marketpro.fr', role: 'Comptable', color: '#06b6d4' },
  ];

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(demoEmail.split('@')[0] + '123');
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: var(--color-bg-primary);
          overflow: hidden;
        }

        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
          position: relative;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(0, 212, 170, 0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .login-branding {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 500px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .login-logo-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(0, 212, 170, 0.3);
        }

        .login-logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .login-tagline {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }

        .login-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 212, 170, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-primary);
        }

        .login-feature-text h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .login-feature-text p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .login-right {
          width: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          background: var(--color-bg-card);
          border-left: 1px solid var(--color-border);
        }

        .login-form-container {
          max-width: 360px;
          margin: 0 auto;
          width: 100%;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          font-size: 1.75rem;
          margin: 0 0 0.5rem 0;
        }

        .login-header p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          color: var(--color-text-primary);
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
        }

        .form-input.error {
          border-color: var(--color-accent-danger);
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
        }

        .password-toggle:hover {
          color: var(--color-text-primary);
        }

        .password-strength {
          display: flex;
          gap: 4px;
          margin-top: 0.5rem;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          transition: background 0.3s;
        }

        .strength-bar.active {
          background: var(--color-accent-primary);
        }

        .strength-bar.active.medium {
          background: var(--color-accent-warning);
        }

        .strength-bar.active.weak {
          background: var(--color-accent-danger);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .remember-me input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-accent-primary);
        }

        .remember-me span {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .forgot-password {
          font-size: 0.875rem;
          color: var(--color-accent-primary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--gradient-primary);
          border: none;
          border-radius: 10px;
          color: var(--color-bg-primary);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 212, 170, 0.4);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-accent-danger);
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--color-accent-success);
        }

        .demo-accounts {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .demo-accounts h4 {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .demo-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .demo-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.75rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-button:hover {
          border-color: var(--color-accent-primary);
          color: var(--color-text-primary);
        }

        .demo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 0.75rem;
          background: rgba(0, 212, 170, 0.05);
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .security-notice svg {
          color: var(--color-accent-primary);
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .login-left {
            display: none;
          }
          
          .login-right {
            width: 100%;
            border-left: none;
          }
        }

        @media (max-width: 480px) {
          .login-right {
            padding: 2rem 1.5rem;
          }

          .demo-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Partie gauche - Branding */}
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Package size={32} color="#0a0f1a" />
            </div>
            <h1>Market Pro</h1>
          </div>
          
          <p className="login-tagline">
            La solution ERP complète pour les professionnels de l'agroalimentaire
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">
                <Shield size={20} />
              </div>
              <div className="login-feature-text">
                <h4>Sécurité renforcée</h4>
                <p>Chiffrement AES-256, authentification multi-facteur</p>
              </div>
            </div>
            
            <div className="login-feature">
              <div className="login-feature-icon">
                <Lock size={20} />
              </div>
              <div className="login-feature-text">
                <h4>Protection des données</h4>
                <p>Conforme RGPD, données hébergées en France</p>
              </div>
            </div>
            
            <div className="login-feature">
              <div className="login-feature-icon">
                <CheckCircle size={20} />
              </div>
              <div className="login-feature-text">
                <h4>Traçabilité complète</h4>
                <p>Audit logs, historique des actions, alertes temps réel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace de gestion</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Formulaire */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Indicateur de force */}
              {password && (
                <div className="password-strength">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${
                        passwordStrength >= level * 25 ? 'active' : ''
                      } ${
                        passwordStrength < 50 ? 'weak' : passwordStrength < 75 ? 'medium' : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Se souvenir de moi</span>
              </label>
              
              <button type="button" className="forgot-password">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Comptes de démonstration */}
          <div className="demo-accounts">
            <h4>Comptes de démonstration</h4>
            <div className="demo-buttons">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-button"
                  onClick={() => fillDemoAccount(account.email)}
                  disabled={isLoading}
                >
                  <span className="demo-dot" style={{ background: account.color }} />
                  <span>{account.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notice de sécurité */}
          <div className="security-notice">
            <Shield size={16} />
            <span>
              Connexion sécurisée avec chiffrement SSL. Vos données sont protégées.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

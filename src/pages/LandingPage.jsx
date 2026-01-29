import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, BarChart3, Shield, Smartphone, Zap, 
  ChevronRight, Check, ArrowRight, Play, Star, Users, 
  TrendingUp, Clock, Award, Menu, X
} from 'lucide-react';

const LandingPage = ({ onEnter }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Package,
      title: 'Gestion des Stocks',
      description: 'Traçabilité temps réel, multi-entrepôts, FIFO/FEFO automatique, alertes intelligentes',
      color: '#00d4aa',
    },
    {
      icon: BarChart3,
      title: 'OCR & Scan Intelligent',
      description: 'Lecture automatique des BL, matching commandes, reconnaissance multi-formats',
      color: '#3b82f6',
    },
    {
      icon: Shield,
      title: 'Conformité HACCP',
      description: 'Traçabilité sanitaire complète, contrôle températures IoT, registres automatisés',
      color: '#8b5cf6',
    },
    {
      icon: Smartphone,
      title: 'App Mobile B2B',
      description: 'Commandes clients en temps réel, paiements intégrés, notifications push',
      color: '#f59e0b',
    },
  ];

  const stats = [
    { value: '98%', label: 'Satisfaction client', icon: Star },
    { value: '+45%', label: 'Gain productivité', icon: TrendingUp },
    { value: '850+', label: 'Entreprises', icon: Users },
    { value: '24/7', label: 'Disponibilité', icon: Clock },
  ];

  const testimonials = [
    {
      name: 'Marie Dupont',
      role: 'Directrice Logistique, Carrefour Lyon',
      content: 'Market Pro a transformé notre gestion des stocks. La traçabilité HACCP est impeccable.',
      avatar: 'MD',
    },
    {
      name: 'Jean-Pierre Martin',
      role: 'Gérant, Restaurant Le Gourmet',
      content: 'L\'application mobile est un game-changer. Je commande en 2 clics depuis ma cuisine.',
      avatar: 'JM',
    },
    {
      name: 'Sophie Bernard',
      role: 'Responsable Achats, Intermarché',
      content: 'L\'OCR nous fait gagner 4h par jour sur la saisie des bons de livraison.',
      avatar: 'SB',
    },
  ];

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          background: var(--color-bg-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Hero Background */
        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .hero-gradient {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
        }

        .hero-gradient-1 {
          top: -200px;
          right: -200px;
          background: var(--color-accent-primary);
        }

        .hero-gradient-2 {
          bottom: -300px;
          left: -200px;
          background: var(--color-accent-secondary);
        }

        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          transition: all 0.3s ease;
        }

        .nav.scrolled {
          background: rgba(10, 15, 26, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--gradient-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--color-text-secondary);
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--color-accent-primary);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--color-text-primary);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-menu-btn { display: block; }
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 8rem 2rem 4rem;
        }

        .hero-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(0, 212, 170, 0.1);
          border: 1px solid rgba(0, 212, 170, 0.3);
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--color-accent-primary);
          margin-bottom: 1.5rem;
          animation: fadeIn 0.6s ease;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          animation: fadeIn 0.6s ease 0.1s backwards;
        }

        .hero-title span {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.2rem;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
          max-width: 540px;
          animation: fadeIn 0.6s ease 0.2s backwards;
        }

        @media (max-width: 1024px) {
          .hero-description { margin-inline: auto; }
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          animation: fadeIn 0.6s ease 0.3s backwards;
        }

        @media (max-width: 1024px) {
          .hero-cta { justify-content: center; }
        }

        .btn-demo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--gradient-primary);
          color: var(--color-bg-primary);
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 40px rgba(0, 212, 170, 0.3);
        }

        .btn-demo:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 60px rgba(0, 212, 170, 0.5);
        }

        .btn-video {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--color-text-primary);
          font-weight: 500;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-video:hover {
          border-color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.1);
        }

        .play-icon {
          width: 24px;
          height: 24px;
          background: var(--color-accent-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .dashboard-preview {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }

        .preview-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .preview-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .preview-dot:nth-child(1) { background: #ef4444; }
        .preview-dot:nth-child(2) { background: #f59e0b; }
        .preview-dot:nth-child(3) { background: #10b981; }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .preview-stat {
          background: var(--color-bg-tertiary);
          padding: 1rem;
          border-radius: 12px;
        }

        .preview-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--color-accent-primary);
        }

        .preview-stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }

        .preview-chart {
          height: 120px;
          background: var(--color-bg-tertiary);
          border-radius: 12px;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
          gap: 0.5rem;
        }

        .chart-bar {
          flex: 1;
          background: var(--gradient-primary);
          border-radius: 4px;
          animation: growUp 1s ease forwards;
          animation-delay: calc(var(--i) * 0.1s);
          transform-origin: bottom;
        }

        @keyframes growUp {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 2rem;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .stat-item {
          text-align: center;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          background: rgba(0, 212, 170, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-primary);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--color-accent-secondary);
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .section-description {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
          font-size: 1.1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        .feature-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          border-color: var(--color-accent-primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .feature-card.active {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 40px rgba(0, 212, 170, 0.2);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-primary);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-card.active::before {
          transform: scaleX(1);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        /* Testimonials */
        .testimonials-section {
          padding: 6rem 2rem;
          background: var(--color-bg-secondary);
        }

        .testimonials-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }

        .testimonial-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 2rem;
        }

        .testimonial-content {
          color: var(--color-text-secondary);
          font-style: italic;
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--color-bg-primary);
        }

        .testimonial-name {
          font-weight: 600;
        }

        .testimonial-role {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .testimonial-stars {
          display: flex;
          gap: 0.25rem;
          color: #f59e0b;
          margin-bottom: 1rem;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
        }

        .cta-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0, 212, 170, 0.1) 0%, transparent 70%);
        }

        .cta-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-description {
          color: var(--color-text-secondary);
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Footer */
        .footer {
          padding: 3rem 2rem;
          border-top: 1px solid var(--color-border);
          text-align: center;
          color: var(--color-text-muted);
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .footer-link {
          color: var(--color-text-secondary);
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: var(--color-accent-primary);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">
              <Package size={24} color="#0a192f" />
            </div>
            <span>Market<span style={{ color: 'var(--color-accent-primary)' }}>Pro</span></span>
          </div>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#testimonials" className="nav-link">Témoignages</a>
            <a href="#pricing" className="nav-link">Tarifs</a>
            <button className="btn btn-primary" onClick={onEnter}>
              Accéder à la démo
              <ChevronRight size={18} />
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient hero-gradient-1" />
          <div className="hero-gradient hero-gradient-2" />
          <div className="grid-pattern" />
        </div>

        <div className="hero-content">
          <div>
            <div className="hero-badge">
              <Zap size={16} />
              Nouveau : Prédictions IA intégrées
            </div>
            
            <h1 className="hero-title">
              La plateforme <span>logistique</span> qui révolutionne l'agroalimentaire
            </h1>
            
            <p className="hero-description">
              Gestion des stocks, traçabilité HACCP, OCR intelligent et analyse financière prédictive. 
              Tout ce dont vous avez besoin pour piloter votre activité grossiste.
            </p>

            <div className="hero-cta">
              <button className="btn-demo" onClick={onEnter}>
                Démarrer gratuitement
                <ArrowRight size={20} />
              </button>
              <button className="btn-video">
                <span className="play-icon">
                  <Play size={12} fill="currentColor" />
                </span>
                Voir la démo
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dot" />
                <div className="preview-dot" />
                <div className="preview-dot" />
              </div>
              
              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="preview-stat-value">€498K</div>
                  <div className="preview-stat-label">CA Mensuel</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-value">+12.4%</div>
                  <div className="preview-stat-label">Croissance</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-value">1,045</div>
                  <div className="preview-stat-label">Commandes</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-value">847</div>
                  <div className="preview-stat-label">Clients actifs</div>
                </div>
              </div>

              <div className="preview-chart">
                {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80, 88].map((h, i) => (
                  <div 
                    key={i} 
                    className="chart-bar" 
                    style={{ height: `${h}%`, '--i': i }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon">
                <stat.icon size={24} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-badge">
            <Award size={16} />
            Fonctionnalités clés
          </div>
          <h2 className="section-title">
            Tout ce qu'il faut pour <span className="text-gradient">exceller</span>
          </h2>
          <p className="section-description">
            Une suite complète d'outils conçus spécifiquement pour les grossistes agroalimentaires
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
              onClick={() => setActiveFeature(index)}
            >
              <div 
                className="feature-icon"
                style={{ background: `${feature.color}20`, color: feature.color }}
              >
                <feature.icon size={28} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-header">
          <div className="section-badge">
            <Users size={16} />
            Témoignages
          </div>
          <h2 className="section-title">
            Ils nous font <span className="text-gradient">confiance</span>
          </h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-content">
          <h2 className="cta-title">
            Prêt à transformer votre <span className="text-gradient">logistique</span> ?
          </h2>
          <p className="cta-description">
            Rejoignez plus de 850 entreprises qui optimisent déjà leur activité avec Market Pro
          </p>
          <div className="cta-buttons">
            <button className="btn-demo" onClick={onEnter}>
              Commencer maintenant
              <ArrowRight size={20} />
            </button>
            <button className="btn-video">
              Demander une démo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#" className="footer-link">À propos</a>
          <a href="#" className="footer-link">Fonctionnalités</a>
          <a href="#" className="footer-link">Tarifs</a>
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">CGV</a>
        </div>
        <p>© 2024 Market Pro. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import {
  Building2, User, Mail, Phone, MapPin, FileText, Upload, Check,
  Eye, EyeOff, AlertCircle, ChevronRight, Lock, Shield, CreditCard,
  Package, Clock, Euro, ArrowLeft, Loader2, CheckCircle2, Info
} from 'lucide-react';

// Formulaire d'inscription client avec KBIS
function ClientRegistration({ onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 - Informations entreprise
    companyName: '',
    siret: '',
    tvaNumber: '',
    apeCode: '',
    legalForm: '',
    capital: '',
    
    // Étape 2 - KBIS
    kbisFile: null,
    kbisFileName: '',
    kbisDate: '',
    
    // Étape 3 - Contact
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    contactPosition: '',
    
    // Étape 4 - Adresse
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    deliveryAddress: '',
    sameAsMain: true,
    
    // Étape 5 - Compte
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNewsletter: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateStep = (stepNum) => {
    const newErrors = {};
    
    if (stepNum === 1) {
      if (!formData.companyName) newErrors.companyName = 'Raison sociale requise';
      if (!formData.siret) newErrors.siret = 'SIRET requis';
      else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) newErrors.siret = 'SIRET invalide (14 chiffres)';
      if (!formData.legalForm) newErrors.legalForm = 'Forme juridique requise';
    }
    
    if (stepNum === 2) {
      if (!formData.kbisFile) newErrors.kbisFile = 'Extrait KBIS requis';
      if (!formData.kbisDate) newErrors.kbisDate = 'Date du KBIS requise';
      else {
        const kbisDate = new Date(formData.kbisDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (kbisDate < threeMonthsAgo) newErrors.kbisDate = 'KBIS de moins de 3 mois requis';
      }
    }
    
    if (stepNum === 3) {
      if (!formData.contactFirstName) newErrors.contactFirstName = 'Prénom requis';
      if (!formData.contactLastName) newErrors.contactLastName = 'Nom requis';
      if (!formData.contactEmail) newErrors.contactEmail = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = 'Email invalide';
      if (!formData.contactPhone) newErrors.contactPhone = 'Téléphone requis';
    }
    
    if (stepNum === 4) {
      if (!formData.address) newErrors.address = 'Adresse requise';
      if (!formData.postalCode) newErrors.postalCode = 'Code postal requis';
      else if (!/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = 'Code postal invalide';
      if (!formData.city) newErrors.city = 'Ville requise';
    }
    
    if (stepNum === 5) {
      if (!formData.email) newErrors.email = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mots de passe différents';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les CGV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onSuccess?.(formData);
  };
  
  const handleKbisUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, kbisFile: 'Fichier trop volumineux (max 5 Mo)' }));
        return;
      }
      updateField('kbisFile', file);
      updateField('kbisFileName', file.name);
    }
  };
  
  const legalForms = [
    { value: 'sarl', label: 'SARL - Société à responsabilité limitée' },
    { value: 'sas', label: 'SAS - Société par actions simplifiée' },
    { value: 'sa', label: 'SA - Société anonyme' },
    { value: 'eurl', label: 'EURL - Entreprise unipersonnelle à responsabilité limitée' },
    { value: 'sasu', label: 'SASU - Société par actions simplifiée unipersonnelle' },
    { value: 'ei', label: 'EI - Entreprise individuelle' },
    { value: 'micro', label: 'Micro-entreprise' },
    { value: 'snc', label: 'SNC - Société en nom collectif' },
    { value: 'scop', label: 'SCOP - Société coopérative' },
    { value: 'association', label: 'Association loi 1901' }
  ];
  
  const steps = [
    { num: 1, label: 'Entreprise', icon: Building2 },
    { num: 2, label: 'KBIS', icon: FileText },
    { num: 3, label: 'Contact', icon: User },
    { num: 4, label: 'Adresse', icon: MapPin },
    { num: 5, label: 'Compte', icon: Lock }
  ];
  
  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };
  
  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)'
  };
  
  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBack}
              style={{ width: 40, height: 40, borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 style={{ margin: 0, color: 'white' }}>Inscription Compte Professionnel</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Créez votre compte pour commander en ligne</p>
            </div>
          </div>
        </div>
        
        {/* Stepper */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {steps.map((s, idx) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: step >= s.num ? 'var(--primary-color)' : 'var(--card-bg)',
                    border: step >= s.num ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: step >= s.num ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.3s'
                  }}>
                    {step > s.num ? <Check size={20} /> : <s.icon size={20} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: step > s.num ? 'var(--primary-color)' : 'var(--border-color)',
                    margin: '0 1rem',
                    marginBottom: '1.5rem',
                    transition: 'background 0.3s'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form content */}
        <div style={{ padding: '2rem' }}>
          {/* Étape 1 - Entreprise */}
          {step === 1 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Informations de l'entreprise</h3>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Raison sociale *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Nom de votre entreprise"
                    style={{ ...inputStyle, borderColor: errors.companyName ? '#ef4444' : undefined }}
                  />
                  {errors.companyName && <div style={errorStyle}><AlertCircle size={12} /> {errors.companyName}</div>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>SIRET *</label>
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={(e) => updateField('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
                      placeholder="14 chiffres"
                      style={{ ...inputStyle, borderColor: errors.siret ? '#ef4444' : undefined }}
                    />
                    {errors.siret && <div style={errorStyle}><AlertCircle size={12} /> {errors.siret}</div>}
                  </div>
                  
                  <div>
                    <label style={labelStyle}>N° TVA intracommunautaire</label>
                    <input
                      type="text"
                      value={formData.tvaNumber}
                      onChange={(e) => updateField('tvaNumber', e.target.value.toUpperCase())}
                      placeholder="FR12345678901"
                      style={inputStyle}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={labelStyle}>Forme juridique *</label>
                  <select
                    value={formData.legalForm}
                    onChange={(e) => updateField('legalForm', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.legalForm ? '#ef4444' : undefined }}
                  >
                    <option value="">Sélectionnez...</option>
                    {legalForms.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  {errors.legalForm && <div style={errorStyle}><AlertCircle size={12} /> {errors.legalForm}</div>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Code APE/NAF</label>
                    <input
                      type="text"
                      value={formData.apeCode}
                      onChange={(e) => updateField('apeCode', e.target.value)}
                      placeholder="Ex: 4711D"
                      style={inputStyle}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Capital social</label>
                    <input
                      type="text"
                      value={formData.capital}
                      onChange={(e) => updateField('capital', e.target.value)}
                      placeholder="Ex: 10 000 €"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 2 - KBIS */}
          {step === 2 && (
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Extrait KBIS</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
                Document obligatoire pour l'ouverture d'un compte professionnel
              </p>
              
              <div style={{
                padding: '1.25rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem'
              }}>
                <Info size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem' }}>
                  <strong style={{ color: '#3b82f6' }}>Qu'est-ce que le KBIS ?</strong>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                    L'extrait KBIS est la "carte d'identité" de votre entreprise. Il atteste de l'existence juridique 
                    de votre société et contient toutes les informations légales. Vous pouvez l'obtenir sur 
                    <a href="https://www.infogreffe.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}> infogreffe.fr</a> ou 
                    <a href="https://www.monidenum.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}> monidenum.fr</a>.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Télécharger votre KBIS *</label>
                  <div
                    onClick={() => document.getElementById('kbis-upload').click()}
                    style={{
                      border: `2px dashed ${errors.kbisFile ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: formData.kbisFile ? 'rgba(16,185,129,0.1)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      id="kbis-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleKbisUpload}
                      style={{ display: 'none' }}
                    />
                    {formData.kbisFile ? (
                      <>
                        <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: 500, color: '#10b981' }}>Fichier sélectionné</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{formData.kbisFileName}</div>
                      </>
                    ) : (
                      <>
                        <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: 500 }}>Cliquez pour sélectionner votre KBIS</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PDF, JPG ou PNG (max 5 Mo)</div>
                      </>
                    )}
                  </div>
                  {errors.kbisFile && <div style={errorStyle}><AlertCircle size={12} /> {errors.kbisFile}</div>}
                </div>
                
                <div>
                  <label style={labelStyle}>Date de délivrance du KBIS *</label>
                  <input
                    type="date"
                    value={formData.kbisDate}
                    onChange={(e) => updateField('kbisDate', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.kbisDate ? '#ef4444' : undefined }}
                  />
                  {errors.kbisDate && <div style={errorStyle}><AlertCircle size={12} /> {errors.kbisDate}</div>}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Le KBIS doit dater de moins de 3 mois
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 3 - Contact */}
          {step === 3 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Contact principal</h3>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input
                      type="text"
                      value={formData.contactFirstName}
                      onChange={(e) => updateField('contactFirstName', e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.contactFirstName ? '#ef4444' : undefined }}
                    />
                    {errors.contactFirstName && <div style={errorStyle}><AlertCircle size={12} /> {errors.contactFirstName}</div>}
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Nom *</label>
                    <input
                      type="text"
                      value={formData.contactLastName}
                      onChange={(e) => updateField('contactLastName', e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.contactLastName ? '#ef4444' : undefined }}
                    />
                    {errors.contactLastName && <div style={errorStyle}><AlertCircle size={12} /> {errors.contactLastName}</div>}
                  </div>
                </div>
                
                <div>
                  <label style={labelStyle}>Fonction</label>
                  <input
                    type="text"
                    value={formData.contactPosition}
                    onChange={(e) => updateField('contactPosition', e.target.value)}
                    placeholder="Ex: Gérant, Responsable achats..."
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Email professionnel *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="contact@entreprise.fr"
                    style={{ ...inputStyle, borderColor: errors.contactEmail ? '#ef4444' : undefined }}
                  />
                  {errors.contactEmail && <div style={errorStyle}><AlertCircle size={12} /> {errors.contactEmail}</div>}
                </div>
                
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="01 23 45 67 89"
                    style={{ ...inputStyle, borderColor: errors.contactPhone ? '#ef4444' : undefined }}
                  />
                  {errors.contactPhone && <div style={errorStyle}><AlertCircle size={12} /> {errors.contactPhone}</div>}
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 4 - Adresse */}
          {step === 4 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Adresse du siège social</h3>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Adresse *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Numéro et nom de rue"
                    style={{ ...inputStyle, borderColor: errors.address ? '#ef4444' : undefined }}
                  />
                  {errors.address && <div style={errorStyle}><AlertCircle size={12} /> {errors.address}</div>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Code postal *</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="75001"
                      style={{ ...inputStyle, borderColor: errors.postalCode ? '#ef4444' : undefined }}
                    />
                    {errors.postalCode && <div style={errorStyle}><AlertCircle size={12} /> {errors.postalCode}</div>}
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Ville *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.city ? '#ef4444' : undefined }}
                    />
                    {errors.city && <div style={errorStyle}><AlertCircle size={12} /> {errors.city}</div>}
                  </div>
                </div>
                
                <div>
                  <label style={labelStyle}>Pays</label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.sameAsMain}
                      onChange={(e) => updateField('sameAsMain', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary-color)' }}
                    />
                    <span style={{ fontSize: '0.9375rem' }}>Adresse de livraison identique à l'adresse du siège</span>
                  </label>
                </div>
                
                {!formData.sameAsMain && (
                  <div>
                    <label style={labelStyle}>Adresse de livraison</label>
                    <textarea
                      value={formData.deliveryAddress}
                      onChange={(e) => updateField('deliveryAddress', e.target.value)}
                      placeholder="Adresse complète de livraison"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Étape 5 - Compte */}
          {step === 5 && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>Création de votre compte</h3>
              
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Email de connexion *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="votre@email.fr"
                    style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : undefined }}
                  />
                  {errors.email && <div style={errorStyle}><AlertCircle size={12} /> {errors.email}</div>}
                </div>
                
                <div>
                  <label style={labelStyle}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Minimum 8 caractères"
                      style={{ ...inputStyle, paddingRight: '3rem', borderColor: errors.password ? '#ef4444' : undefined }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <div style={errorStyle}><AlertCircle size={12} /> {errors.password}</div>}
                </div>
                
                <div>
                  <label style={labelStyle}>Confirmer le mot de passe *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.confirmPassword ? '#ef4444' : undefined }}
                  />
                  {errors.confirmPassword && <div style={errorStyle}><AlertCircle size={12} /> {errors.confirmPassword}</div>}
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateField('acceptTerms', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary-color)', marginTop: '0.125rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      J'accepte les <a href="#" style={{ color: 'var(--primary-color)' }}>Conditions Générales de Vente</a> et 
                      la <a href="#" style={{ color: 'var(--primary-color)' }}>Politique de confidentialité</a> *
                    </span>
                  </label>
                  {errors.acceptTerms && <div style={{ ...errorStyle, marginTop: '-0.5rem', marginBottom: '0.75rem' }}><AlertCircle size={12} /> {errors.acceptTerms}</div>}
                  
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.acceptNewsletter}
                      onChange={(e) => updateField('acceptNewsletter', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary-color)', marginTop: '0.125rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Je souhaite recevoir les offres et actualités par email</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <ArrowLeft size={18} />
              Retour
            </button>
          ) : (
            <div />
          )}
          
          {step < 5 ? (
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Continuer
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Création en cours...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Créer mon compte
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Page de connexion client
function ClientLogin({ onRegister, onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulation connexion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: accepter client@demo.fr / demo123
    if (email === 'client@demo.fr' && password === 'demo123') {
      onLogin?.({ email, name: 'Restaurant Le Gourmet' });
    } else {
      setError('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Building2 size={32} style={{ color: 'white' }} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Espace Client</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Accédez à votre compte professionnel</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 3rem 0.875rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>Mot de passe oublié ?</a>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary-color)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Identifiants de démo: <strong>client@demo.fr</strong> / <strong>demo123</strong>
          </div>
        </form>
        
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pas encore de compte ?</p>
          <button
            onClick={onRegister}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '10px',
              border: '1px solid var(--primary-color)',
              background: 'transparent',
              color: 'var(--primary-color)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Créer un compte professionnel
          </button>
        </div>
        
        <div style={{ padding: '0 2rem 1.5rem', textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Composant principal du portail client
function ClientPortal() {
  const [view, setView] = useState('login'); // login, register, success
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  const handleRegistrationSuccess = (data) => {
    setView('success');
  };
  
  const handleLogin = (user) => {
    setLoggedInUser(user);
    // Rediriger vers le dashboard client
  };
  
  if (view === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 500, background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle2 size={40} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Demande envoyée !</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
            Votre demande d'ouverture de compte a bien été enregistrée.<br />
            Notre équipe commerciale va vérifier vos documents et vous contactera sous 24 à 48h ouvrées.
          </p>
          <button
            onClick={() => setView('login')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary-color)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }
  
  if (view === 'register') {
    return (
      <ClientRegistration
        onBack={() => setView('login')}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }
  
  return (
    <ClientLogin
      onRegister={() => setView('register')}
      onLogin={handleLogin}
      onBack={() => window.history.back()}
    />
  );
}

export default ClientPortal;

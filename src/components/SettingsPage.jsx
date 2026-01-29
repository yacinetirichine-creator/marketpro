import React, { useState } from 'react';
import {
  Settings, User, Building2, CreditCard, Bell, Shield, Database,
  Palette, Globe, Mail, Phone, MapPin, Save, Upload, Download,
  Users, Key, Lock, Eye, EyeOff, Check, AlertTriangle
} from 'lucide-react';
import { Card, Tabs, Button, Input, Select, Alert } from './ui';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'company', label: 'Entreprise', icon: Building2 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      {saved && (
        <Alert type="success" title="Paramètres enregistrés">
          Vos modifications ont été sauvegardées avec succès.
        </Alert>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Entreprise */}
      {activeTab === 'company' && (
        <Card title="Informations de l'entreprise">
          <div className="settings-form">
            <div className="form-section">
              <h4>Identité</h4>
              <div className="form-grid">
                <Input label="Raison sociale" placeholder="Market Pro SAS" />
                <Input label="SIRET" placeholder="123 456 789 00012" />
                <Input label="N° TVA" placeholder="FR12345678901" />
                <Input label="Code APE" placeholder="4711D" />
              </div>
            </div>

            <div className="form-section">
              <h4>Coordonnées</h4>
              <div className="form-grid">
                <Input label="Adresse" placeholder="123 Rue du Commerce" icon={MapPin} />
                <Input label="Code postal" placeholder="75001" />
                <Input label="Ville" placeholder="Paris" />
                <Input label="Pays" placeholder="France" icon={Globe} />
                <Input label="Téléphone" placeholder="01 23 45 67 89" icon={Phone} />
                <Input label="Email" placeholder="contact@marketpro.fr" icon={Mail} />
              </div>
            </div>

            <div className="form-section">
              <h4>Logo</h4>
              <div className="logo-upload">
                <div className="current-logo">
                  <Building2 size={48} />
                </div>
                <Button variant="outline" icon={Upload}>
                  Changer le logo
                </Button>
              </div>
            </div>

            <div className="form-actions">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Utilisateurs */}
      {activeTab === 'users' && (
        <Card title="Gestion des utilisateurs">
          <div className="users-list">
            <div className="user-item">
              <div className="user-avatar">YM</div>
              <div className="user-info">
                <span className="user-name">Yacine Memayt</span>
                <span className="user-email">yacine@marketpro.fr</span>
              </div>
              <span className="user-role admin">Administrateur</span>
              <Button variant="ghost" size="sm" icon={Settings}>Gérer</Button>
            </div>
            <div className="user-item">
              <div className="user-avatar">MP</div>
              <div className="user-info">
                <span className="user-name">Marie Dupont</span>
                <span className="user-email">marie@marketpro.fr</span>
              </div>
              <span className="user-role manager">Manager</span>
              <Button variant="ghost" size="sm" icon={Settings}>Gérer</Button>
            </div>
            <div className="user-item">
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <span className="user-name">Jean Durand</span>
                <span className="user-email">jean@marketpro.fr</span>
              </div>
              <span className="user-role user">Utilisateur</span>
              <Button variant="ghost" size="sm" icon={Settings}>Gérer</Button>
            </div>
          </div>
          <div className="form-actions">
            <Button variant="primary" icon={Users}>
              Ajouter un utilisateur
            </Button>
          </div>
        </Card>
      )}

      {/* Facturation */}
      {activeTab === 'billing' && (
        <Card title="Paramètres de facturation">
          <div className="settings-form">
            <div className="form-section">
              <h4>Numérotation</h4>
              <div className="form-grid">
                <Input label="Préfixe factures" placeholder="FAC-" />
                <Input label="Prochain numéro" type="number" placeholder="2024001" />
                <Input label="Préfixe commandes" placeholder="CMD-" />
                <Input label="Prochain numéro" type="number" placeholder="2024001" />
              </div>
            </div>

            <div className="form-section">
              <h4>Conditions par défaut</h4>
              <div className="form-grid">
                <Select
                  label="Délai de paiement"
                  options={[
                    { value: '30', label: '30 jours' },
                    { value: '45', label: '45 jours' },
                    { value: '60', label: '60 jours' },
                  ]}
                />
                <Select
                  label="TVA par défaut"
                  options={[
                    { value: '20', label: '20%' },
                    { value: '10', label: '10%' },
                    { value: '5.5', label: '5.5%' },
                  ]}
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Mentions légales</h4>
              <textarea 
                className="form-textarea"
                placeholder="Conditions générales de vente..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card title="Préférences de notifications">
          <div className="settings-form">
            <div className="notification-settings">
              <div className="notif-item">
                <div className="notif-info">
                  <span className="notif-title">Nouvelles commandes</span>
                  <span className="notif-desc">Recevoir une notification pour chaque nouvelle commande</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notif-item">
                <div className="notif-info">
                  <span className="notif-title">Alertes stock</span>
                  <span className="notif-desc">Être alerté quand un produit passe sous le seuil minimum</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notif-item">
                <div className="notif-info">
                  <span className="notif-title">Factures impayées</span>
                  <span className="notif-desc">Notification pour les factures en retard de paiement</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notif-item">
                <div className="notif-info">
                  <span className="notif-title">Rapports hebdomadaires</span>
                  <span className="notif-desc">Recevoir un résumé chaque lundi</span>
                </div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sécurité */}
      {activeTab === 'security' && (
        <Card title="Sécurité du compte">
          <div className="settings-form">
            <div className="form-section">
              <h4>Changer le mot de passe</h4>
              <div className="form-grid">
                <div className="password-input">
                  <Input 
                    label="Mot de passe actuel" 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                  />
                  <button 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" />
                <Input label="Confirmer" type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="form-section">
              <h4>Authentification à deux facteurs</h4>
              <div className="two-factor">
                <div className="two-factor-status">
                  <Shield size={24} />
                  <div>
                    <span className="status-title">2FA désactivé</span>
                    <span className="status-desc">Ajoutez une couche de sécurité supplémentaire</span>
                  </div>
                </div>
                <Button variant="outline" icon={Key}>
                  Activer
                </Button>
              </div>
            </div>

            <div className="form-section">
              <h4>Sessions actives</h4>
              <div className="sessions-list">
                <div className="session-item current">
                  <div className="session-info">
                    <span className="session-device">Chrome sur Windows</span>
                    <span className="session-location">Paris, France • Actif maintenant</span>
                  </div>
                  <span className="session-badge">Session actuelle</span>
                </div>
                <div className="session-item">
                  <div className="session-info">
                    <span className="session-device">Safari sur iPhone</span>
                    <span className="session-location">Paris, France • Il y a 2 heures</span>
                  </div>
                  <Button variant="ghost" size="sm">Déconnecter</Button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Données */}
      {activeTab === 'data' && (
        <Card title="Gestion des données">
          <div className="settings-form">
            <div className="form-section">
              <h4>Export des données</h4>
              <p className="section-desc">Téléchargez une copie de toutes vos données</p>
              <div className="export-options">
                <Button variant="outline" icon={Download}>
                  Exporter les clients
                </Button>
                <Button variant="outline" icon={Download}>
                  Exporter les produits
                </Button>
                <Button variant="outline" icon={Download}>
                  Exporter les commandes
                </Button>
                <Button variant="outline" icon={Download}>
                  Exporter tout
                </Button>
              </div>
            </div>

            <div className="form-section">
              <h4>Import des données</h4>
              <p className="section-desc">Importez des données depuis un fichier CSV ou Excel</p>
              <div className="import-zone">
                <Upload size={32} />
                <p>Glissez-déposez un fichier ou cliquez pour sélectionner</p>
                <span className="import-formats">Formats acceptés: CSV, XLSX</span>
              </div>
            </div>

            <div className="form-section danger">
              <h4>Zone de danger</h4>
              <Alert type="danger" title="Attention">
                Les actions suivantes sont irréversibles
              </Alert>
              <div className="danger-actions">
                <Button variant="ghost">
                  Réinitialiser les paramètres
                </Button>
                <Button variant="ghost" className="text-danger">
                  Supprimer toutes les données
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;

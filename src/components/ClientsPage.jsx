import React, { useState, useMemo } from 'react';
import {
  Users, Search, Plus, Filter, Download, Eye, Edit, Trash2,
  Phone, Mail, MapPin, Calendar, CreditCard, TrendingUp, TrendingDown,
  FileText, ShoppingCart, Wallet, AlertCircle, CheckCircle, Building2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Card, SearchInput, FilterPills, Tabs, Table, StatusBadge,
  Modal, Button, Input, Select, Alert, ProgressBar, Avatar,
  ActionButtons
} from './ui';
import { useClientFinancialAnalysis, useFormatters } from '../hooks';
import { clients, clientHistory, clientFixedCosts } from '../data/mockData';

const ClientsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const { formatCurrency, formatDate, formatPercent, formatNumber } = useFormatters();

  // Stats
  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    totalEncours: clients.reduce((sum, c) => sum + c.encours, 0),
    averageCA: clients.reduce((sum, c) => sum + c.totalCA, 0) / clients.length
  }), []);

  // Types uniques
  const clientTypes = [...new Set(clients.map(c => c.type))];
  const typeOptions = [
    { value: null, label: 'Tous les types' },
    ...clientTypes.map(t => ({ value: t, label: t }))
  ];

  // Filtrage
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !typeFilter || c.type === typeFilter;
      return matchSearch && matchType;
    }).sort((a, b) => b.totalCA - a.totalCA);
  }, [searchQuery, typeFilter]);

  // Analyse client sélectionné
  const clientAnalysis = useMemo(() => {
    if (!selectedClient) return null;
    
    const history = clientHistory[selectedClient.id] || [];
    const costs = clientFixedCosts[selectedClient.id] || {};
    
    // Calcul totaux
    const totalRevenue = history.reduce((sum, h) => sum + h.revenue, 0);
    const totalMargin = history.reduce((sum, h) => sum + h.margin, 0);
    const monthlyFixedCosts = Object.values(costs).reduce((sum, v) => sum + v, 0);
    const netMargin = totalMargin - (monthlyFixedCosts * history.length);
    
    // Calcul croissance
    const recentMonths = history.slice(-3);
    const previousMonths = history.slice(-6, -3);
    const recentAvg = recentMonths.reduce((sum, h) => sum + h.revenue, 0) / 3;
    const previousAvg = previousMonths.length ? previousMonths.reduce((sum, h) => sum + h.revenue, 0) / 3 : recentAvg;
    const growth = previousAvg ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Prédiction
    const trend = growth / 100;
    const prediction = recentAvg * 6 * (1 + trend * 0.5);

    return {
      totalRevenue,
      totalMargin,
      netMargin,
      monthlyFixedCosts,
      growth,
      prediction,
      history,
      costs
    };
  }, [selectedClient]);

  const tabs = [
    { id: 'list', label: 'Liste clients', icon: Users, count: stats.total },
    { id: 'accounts', label: 'Comptes clients', icon: Wallet },
    { id: 'balances', label: 'Soldes', icon: CreditCard },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (val, row) => (
        <div className="client-cell">
          <Avatar name={val} size="md" status={row.status === 'active' ? 'online' : 'offline'} />
          <div className="client-info">
            <span className="client-name">{val}</span>
            <span className="client-contact">{row.contact}</span>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <span className="type-badge">{val}</span>
    },
    {
      key: 'totalCA',
      label: 'CA Total',
      align: 'right',
      render: (val) => <span className="ca-value">{formatCurrency(val)}</span>
    },
    {
      key: 'encours',
      label: 'Encours',
      render: (val, row) => {
        const percentage = (val / row.creditLimit) * 100;
        const isHigh = percentage > 80;
        const isWarning = percentage > 60;
        return (
          <div className="encours-cell">
            <div className="encours-header">
              <span className={`encours-value ${isHigh ? 'danger' : isWarning ? 'warning' : ''}`}>
                {formatCurrency(val)}
              </span>
              <span className="encours-limit">/ {formatCurrency(row.creditLimit)}</span>
            </div>
            <ProgressBar 
              value={val} 
              max={row.creditLimit}
              size="sm"
              color={isHigh ? 'danger' : isWarning ? 'warning' : 'success'}
            />
          </div>
        );
      }
    },
    {
      key: 'scoring',
      label: 'Score',
      align: 'center',
      render: (val) => (
        <span className={`scoring-badge ${val >= 85 ? 'excellent' : val >= 70 ? 'good' : 'warning'}`}>
          {val}
        </span>
      )
    },
    {
      key: 'lastOrder',
      label: 'Dernière commande',
      render: (val) => val ? formatDate(val) : '-'
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <ActionButtons
          row={row}
          actions={[
            { icon: Eye, label: 'Voir', onClick: (r) => setSelectedClient(r) },
            { icon: Edit, label: 'Modifier', onClick: () => {} },
          ]}
        />
      )
    }
  ];

  // Colonnes comptes clients
  const accountColumns = [
    {
      key: 'name',
      label: 'Client',
      render: (val, row) => (
        <div className="client-cell">
          <Avatar name={val} size="sm" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'debit',
      label: 'Débit',
      align: 'right',
      render: () => formatCurrency(Math.random() * 10000)
    },
    {
      key: 'credit',
      label: 'Crédit',
      align: 'right',
      render: () => formatCurrency(Math.random() * 8000)
    },
    {
      key: 'encours',
      label: 'Solde',
      align: 'right',
      render: (val) => (
        <span className={val > 0 ? 'text-danger' : 'text-success'}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'paymentDelay',
      label: 'Délai paiement',
      render: (val) => `${val} jours`
    }
  ];

  return (
    <div className="clients-page">
      {/* KPIs */}
      <div className="quick-stats">
        <div className="quick-stat primary">
          <Users size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Clients total</span>
          </div>
        </div>
        <div className="quick-stat success">
          <CheckCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Clients actifs</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <CreditCard size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalEncours)}</span>
            <span className="stat-label">Encours total</span>
          </div>
        </div>
        <div className="quick-stat secondary">
          <TrendingUp size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.averageCA)}</span>
            <span className="stat-label">CA moyen</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu */}
      <div className="clients-content">
        <div className={`clients-list ${selectedClient ? 'with-detail' : ''}`}>
          <Card>
            <div className="filters-bar">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un client..."
              />
              <Select
                value={typeFilter || ''}
                onChange={(v) => setTypeFilter(v || null)}
                options={typeOptions}
                placeholder="Type"
              />
              <div className="filter-actions">
                <Button variant="ghost" icon={Download}>Exporter</Button>
                <Button variant="primary" icon={Plus} onClick={() => setShowNewClientModal(true)}>
                  Nouveau client
                </Button>
              </div>
            </div>

            <Table
              columns={activeTab === 'list' ? columns : accountColumns}
              data={filteredClients}
              onRowClick={setSelectedClient}
              emptyMessage="Aucun client trouvé"
            />
          </Card>
        </div>

        {/* Panneau détail client */}
        {selectedClient && clientAnalysis && (
          <div className="client-detail-panel">
            <Card>
              {/* Header client */}
              <div className="client-header">
                <Avatar name={selectedClient.name} size="xl" status={selectedClient.status === 'active' ? 'online' : 'offline'} />
                <div className="client-main-info">
                  <h3>{selectedClient.name}</h3>
                  <span className="client-type">{selectedClient.type}</span>
                  <StatusBadge status={selectedClient.status} />
                </div>
                <button className="close-panel" onClick={() => setSelectedClient(null)}>×</button>
              </div>

              {/* Contact */}
              <div className="detail-section">
                <h4>Contact</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{selectedClient.phone}</span>
                  </div>
                  <div className="contact-item">
                    <MapPin size={16} />
                    <span>{selectedClient.address}</span>
                  </div>
                </div>
              </div>

              {/* Mini KPIs */}
              <div className="mini-kpis">
                <div className="mini-kpi">
                  <span className="kpi-value">{formatCurrency(clientAnalysis.totalRevenue)}</span>
                  <span className="kpi-label">CA Total</span>
                </div>
                <div className="mini-kpi">
                  <span className={`kpi-value ${clientAnalysis.growth >= 0 ? 'positive' : 'negative'}`}>
                    {clientAnalysis.growth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(clientAnalysis.growth))}
                  </span>
                  <span className="kpi-label">Croissance</span>
                </div>
              </div>

              {/* Graphique historique */}
              <div className="detail-section">
                <h4>Historique CA (6 mois)</h4>
                <div className="mini-chart">
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={clientAnalysis.history.slice(-6)}>
                      <defs>
                        <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Area type="monotone" dataKey="revenue" stroke="#00d4aa" fill="url(#colorCA)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Encours */}
              <div className="detail-section">
                <h4>Encours</h4>
                <div className="encours-detail">
                  <div className="encours-values">
                    <span className="current">{formatCurrency(selectedClient.encours)}</span>
                    <span className="separator">/</span>
                    <span className="limit">{formatCurrency(selectedClient.creditLimit)}</span>
                  </div>
                  <ProgressBar 
                    value={selectedClient.encours}
                    max={selectedClient.creditLimit}
                    color={selectedClient.encours / selectedClient.creditLimit > 0.8 ? 'danger' : 'success'}
                  />
                  <span className="payment-delay">Délai paiement: {selectedClient.paymentDelay} jours</span>
                </div>
              </div>

              {/* Frais fixes */}
              <div className="detail-section">
                <h4>Frais fixes mensuels</h4>
                <div className="fixed-costs">
                  <div className="cost-item">
                    <span className="cost-label">Logistique</span>
                    <span className="cost-value">{formatCurrency(clientAnalysis.costs.logistics || 0)}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Livraisons</span>
                    <span className="cost-value">{formatCurrency(clientAnalysis.costs.deliveries || 0)}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Administratif</span>
                    <span className="cost-value">{formatCurrency(clientAnalysis.costs.administrative || 0)}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Coût crédit</span>
                    <span className="cost-value">{formatCurrency(clientAnalysis.costs.creditCost || 0)}</span>
                  </div>
                  <div className="cost-item total">
                    <span className="cost-label">Total mensuel</span>
                    <span className="cost-value">{formatCurrency(clientAnalysis.monthlyFixedCosts)}</span>
                  </div>
                </div>
              </div>

              {/* Prédiction */}
              <div className="detail-section prediction">
                <div className="prediction-badge">
                  <TrendingUp size={16} />
                  <span>Prédiction IA</span>
                </div>
                <div className="prediction-content">
                  <span className="prediction-label">CA estimé 6 prochains mois</span>
                  <span className="prediction-value">{formatCurrency(clientAnalysis.prediction)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="client-actions">
                <Button variant="outline" icon={ShoppingCart}>
                  Voir commandes
                </Button>
                <Button variant="outline" icon={FileText}>
                  Voir factures
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal nouveau client */}
      <Modal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        title="Nouveau client"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewClientModal(false)}>
              Annuler
            </Button>
            <Button variant="primary">
              Créer le client
            </Button>
          </>
        }
      >
        <div className="form-grid">
          <Input label="Raison sociale" placeholder="Nom de l'entreprise" required />
          <Select
            label="Type"
            options={typeOptions.filter(t => t.value)}
            placeholder="Sélectionner..."
          />
          <Input label="Contact principal" placeholder="Nom du contact" />
          <Input label="Email" type="email" placeholder="email@entreprise.fr" />
          <Input label="Téléphone" placeholder="01 23 45 67 89" />
          <Input label="SIRET" placeholder="123 456 789 00012" />
          <Input label="Adresse" placeholder="Adresse complète" />
          <Input label="Code postal" placeholder="75001" />
          <Input label="Ville" placeholder="Paris" />
          <Input label="Plafond crédit" type="number" placeholder="0" />
          <Select
            label="Délai paiement"
            options={[
              { value: '30', label: '30 jours' },
              { value: '45', label: '45 jours' },
              { value: '60', label: '60 jours' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ClientsPage;

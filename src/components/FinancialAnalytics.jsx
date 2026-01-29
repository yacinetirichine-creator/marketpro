import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, Zap,
  Calendar, ArrowRight, Filter, Download, Eye, BarChart3
} from 'lucide-react';
import {
  Card, Tabs, SearchInput, Select, Button, ProgressBar, Avatar
} from './ui';
import { useFormatters } from '../hooks';
import { 
  clients, clientHistory, clientFixedCosts, 
  monthlyFinancials, financialPredictions, globalKPIs 
} from '../data/mockData';

const FinancialAnalytics = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const { formatCurrency, formatPercent, formatNumber, formatDate } = useFormatters();

  // Données combinées historique + prédictions
  const combinedData = useMemo(() => {
    const historical = monthlyFinancials.slice(-6).map(d => ({
      ...d,
      type: 'historical',
      predictedRevenue: null,
      predictedMargin: null
    }));
    const predictions = financialPredictions.map(d => ({
      month: d.month,
      revenue: null,
      margin: null,
      type: 'prediction',
      predictedRevenue: d.predictedRevenue,
      predictedMargin: d.predictedMargin,
      confidence: d.confidence
    }));
    return [...historical, ...predictions];
  }, []);

  // Calculs globaux
  const globalStats = useMemo(() => {
    const totalRevenue = monthlyFinancials.reduce((sum, m) => sum + m.revenue, 0);
    const totalMargin = monthlyFinancials.reduce((sum, m) => sum + m.margin, 0);
    const totalFixedCosts = Object.values(clientFixedCosts).reduce((sum, costs) => {
      return sum + Object.values(costs).reduce((s, v) => s + v, 0) * 12;
    }, 0);
    const netMargin = totalMargin - totalFixedCosts;
    const marginRate = (totalMargin / totalRevenue) * 100;
    const netMarginRate = (netMargin / totalRevenue) * 100;

    return { totalRevenue, totalMargin, totalFixedCosts, netMargin, marginRate, netMarginRate };
  }, []);

  // Répartition frais fixes
  const fixedCostsBreakdown = useMemo(() => {
    const breakdown = { logistics: 0, deliveries: 0, administrative: 0, creditCost: 0 };
    Object.values(clientFixedCosts).forEach(costs => {
      breakdown.logistics += (costs.logistics || 0) * 12;
      breakdown.deliveries += (costs.deliveries || 0) * 12;
      breakdown.administrative += (costs.administrative || 0) * 12;
      breakdown.creditCost += (costs.creditCost || 0) * 12;
    });
    return [
      { name: 'Logistique', value: breakdown.logistics, color: '#00d4aa' },
      { name: 'Livraisons', value: breakdown.deliveries, color: '#3b82f6' },
      { name: 'Administratif', value: breakdown.administrative, color: '#8b5cf6' },
      { name: 'Coût crédit', value: breakdown.creditCost, color: '#f59e0b' },
    ];
  }, []);

  // Analyse par client
  const clientsAnalysis = useMemo(() => {
    return clients.map(client => {
      const history = clientHistory[client.id] || [];
      const costs = clientFixedCosts[client.id] || {};
      
      const totalRevenue = history.reduce((sum, h) => sum + h.revenue, 0);
      const totalMargin = history.reduce((sum, h) => sum + h.margin, 0);
      const monthlyFixedCosts = Object.values(costs).reduce((sum, v) => sum + v, 0);
      const netMargin = totalMargin - (monthlyFixedCosts * history.length);
      const netMarginRate = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

      // Croissance
      const recent = history.slice(-3);
      const previous = history.slice(-6, -3);
      const recentAvg = recent.reduce((s, h) => s + h.revenue, 0) / (recent.length || 1);
      const previousAvg = previous.length ? previous.reduce((s, h) => s + h.revenue, 0) / previous.length : recentAvg;
      const growth = previousAvg ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        ...client,
        totalRevenue,
        totalMargin,
        netMargin,
        netMarginRate,
        growth,
        monthlyFixedCosts,
        history
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, []);

  // Filtrage clients
  const filteredClients = useMemo(() => {
    return clientsAnalysis.filter(c => {
      const matchSearch = !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !typeFilter || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [clientsAnalysis, searchQuery, typeFilter]);

  // Client sélectionné détails
  const selectedClientData = useMemo(() => {
    if (!selectedClient) return null;
    const client = clientsAnalysis.find(c => c.id === selectedClient.id);
    if (!client) return null;

    // Prédiction 6 mois
    const recent = client.history.slice(-3);
    const avgRecent = recent.reduce((s, h) => s + h.revenue, 0) / (recent.length || 1);
    const trend = client.growth / 100;
    const predictions = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'][i],
      predicted: avgRecent * (1 + trend * 0.1 * (i + 1))
    }));

    return { ...client, predictions };
  }, [selectedClient, clientsAnalysis]);

  const tabs = [
    { id: 'global', label: 'Vue globale', icon: BarChart3 },
    { id: 'clients', label: 'Analyse clients', icon: Users },
    { id: 'predictions', label: 'Prédictions', icon: Zap },
  ];

  const typeOptions = [
    { value: null, label: 'Tous les types' },
    ...([...new Set(clients.map(c => c.type))].map(t => ({ value: t, label: t })))
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="financial-analytics">
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Vue globale */}
      {activeTab === 'global' && (
        <>
          {/* KPIs */}
          <div className="kpi-grid-4">
            <div className="kpi-card">
              <div className="kpi-icon primary">
                <DollarSign size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-value">{formatCurrency(globalStats.totalRevenue)}</span>
                <span className="kpi-label">CA Total</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon success">
                <TrendingUp size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-value">{formatCurrency(globalStats.totalMargin)}</span>
                <span className="kpi-label">Marge brute</span>
                <span className="kpi-sublabel">{formatPercent(globalStats.marginRate)}</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon warning">
                <Target size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-value">{formatCurrency(globalStats.totalFixedCosts)}</span>
                <span className="kpi-label">Frais fixes</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon tertiary">
                <TrendingUp size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-value">{formatCurrency(globalStats.netMargin)}</span>
                <span className="kpi-label">Marge nette</span>
                <span className="kpi-sublabel">{formatPercent(globalStats.netMarginRate)}</span>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="charts-row">
            <Card title="Historique & Prédictions" className="chart-card large">
              <div className="chart-container" style={{ height: 350 }}>
                <ResponsiveContainer>
                  <ComposedChart data={combinedData}>
                    <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine x="Déc" stroke="#fff" strokeDasharray="5 5" label={{ value: "Aujourd'hui", fill: '#fff', fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" name="CA Réel" stroke="#00d4aa" fill="url(#gradientRevenue)" />
                    <Line type="monotone" dataKey="predictedRevenue" name="CA Prédit" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#8b5cf6' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Répartition Frais Fixes" className="chart-card">
              <div className="chart-container" style={{ height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={fixedCostsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {fixedCostsBreakdown.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {fixedCostsBreakdown.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }}></span>
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Indicateurs */}
          <Card title="Indicateurs de performance">
            <div className="performance-grid">
              <div className="perf-item">
                <span className="perf-label">Taux de marge brute</span>
                <ProgressBar value={globalStats.marginRate} max={50} color="success" showLabel />
              </div>
              <div className="perf-item">
                <span className="perf-label">Taux de marge nette</span>
                <ProgressBar value={globalStats.netMarginRate} max={30} color="primary" showLabel />
              </div>
              <div className="perf-item">
                <span className="perf-label">CA moyen / mois</span>
                <span className="perf-value">{formatCurrency(globalStats.totalRevenue / 12)}</span>
              </div>
              <div className="perf-item">
                <span className="perf-label">Clients actifs</span>
                <span className="perf-value">{clients.filter(c => c.status === 'active').length}</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Analyse clients */}
      {activeTab === 'clients' && (
        <div className="clients-analysis">
          <div className={`clients-list-panel ${selectedClientData ? 'with-detail' : ''}`}>
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
                />
                <Button variant="ghost" icon={Download}>Exporter</Button>
              </div>

              <div className="clients-table">
                <div className="table-header">
                  <span>Client</span>
                  <span>CA Total</span>
                  <span>Croissance</span>
                  <span>Marge nette</span>
                  <span>Frais fixes/mois</span>
                  <span>Score</span>
                </div>
                {filteredClients.map(client => (
                  <div 
                    key={client.id}
                    className={`table-row ${selectedClient?.id === client.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="client-cell">
                      <Avatar name={client.name} size="sm" />
                      <div>
                        <span className="client-name">{client.name}</span>
                        <span className="client-type">{client.type}</span>
                      </div>
                    </div>
                    <span className="ca-value">{formatCurrency(client.totalRevenue)}</span>
                    <span className={`growth-value ${client.growth >= 0 ? 'positive' : 'negative'}`}>
                      {client.growth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(client.growth))}
                    </span>
                    <span className="margin-value">{formatPercent(client.netMarginRate)}</span>
                    <span className="costs-value">{formatCurrency(client.monthlyFixedCosts)}</span>
                    <span className={`score-badge ${client.scoring >= 85 ? 'excellent' : client.scoring >= 70 ? 'good' : 'warning'}`}>
                      {client.scoring}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Détail client */}
          {selectedClientData && (
            <div className="client-detail-panel">
              <Card>
                <div className="detail-header">
                  <Avatar name={selectedClientData.name} size="xl" />
                  <div>
                    <h3>{selectedClientData.name}</h3>
                    <span className="client-type">{selectedClientData.type}</span>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedClient(null)}>×</button>
                </div>

                <div className="contact-section">
                  <p>{selectedClientData.email}</p>
                  <p>{selectedClientData.phone}</p>
                  <p>{selectedClientData.address}</p>
                </div>

                <div className="mini-kpis">
                  <div className="mini-kpi">
                    <span className="value">{formatCurrency(selectedClientData.totalRevenue)}</span>
                    <span className="label">CA Total</span>
                  </div>
                  <div className="mini-kpi">
                    <span className={`value ${selectedClientData.growth >= 0 ? 'positive' : 'negative'}`}>
                      {selectedClientData.growth >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(selectedClientData.growth))}
                    </span>
                    <span className="label">Croissance</span>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="mini-chart">
                  <h4>Historique 6 mois</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={selectedClientData.history.slice(-6)}>
                      <Area type="monotone" dataKey="revenue" stroke="#00d4aa" fill="url(#gradientRevenue)" />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Encours */}
                <div className="encours-section">
                  <h4>Encours</h4>
                  <div className="encours-bar">
                    <span>{formatCurrency(selectedClientData.encours)}</span>
                    <ProgressBar 
                      value={selectedClientData.encours}
                      max={selectedClientData.creditLimit}
                      color={selectedClientData.encours / selectedClientData.creditLimit > 0.8 ? 'danger' : 'success'}
                    />
                    <span>{formatCurrency(selectedClientData.creditLimit)}</span>
                  </div>
                </div>

                {/* Frais fixes */}
                <div className="fixed-costs-section">
                  <h4>Frais fixes mensuels</h4>
                  {(() => {
                    const costs = clientFixedCosts[selectedClientData.id] || {};
                    return (
                      <div className="costs-list">
                        <div className="cost-row">
                          <span>Logistique</span>
                          <span>{formatCurrency(costs.logistics || 0)}</span>
                        </div>
                        <div className="cost-row">
                          <span>Livraisons</span>
                          <span>{formatCurrency(costs.deliveries || 0)}</span>
                        </div>
                        <div className="cost-row">
                          <span>Administratif</span>
                          <span>{formatCurrency(costs.administrative || 0)}</span>
                        </div>
                        <div className="cost-row">
                          <span>Coût crédit</span>
                          <span>{formatCurrency(costs.creditCost || 0)}</span>
                        </div>
                        <div className="cost-row total">
                          <span>Total</span>
                          <span>{formatCurrency(selectedClientData.monthlyFixedCosts)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Prédiction */}
                <div className="prediction-section">
                  <div className="prediction-badge">
                    <Zap size={14} />
                    <span>Prédiction IA</span>
                  </div>
                  <p className="prediction-label">CA estimé 6 prochains mois</p>
                  <p className="prediction-value">
                    {formatCurrency(selectedClientData.predictions.reduce((s, p) => s + p.predicted, 0))}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Prédictions */}
      {activeTab === 'predictions' && (
        <>
          <Card title="Prévisions CA - 6 mois">
            <div className="chart-container" style={{ height: 350 }}>
              <ResponsiveContainer>
                <ComposedChart data={[
                  ...monthlyFinancials.slice(-3),
                  ...financialPredictions.map(p => ({ month: p.month, revenue: null, predicted: p.predictedRevenue }))
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="CA Réel" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                  <Area type="monotone" dataKey="predicted" name="CA Prédit" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.2)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Détail prévisions">
            <div className="predictions-table">
              <div className="table-header">
                <span>Mois</span>
                <span>CA Prédit</span>
                <span>Marge Prédite</span>
                <span>Coûts estimés</span>
                <span>Confiance</span>
                <span>Tendance</span>
              </div>
              {financialPredictions.map((pred, idx) => (
                <div key={idx} className="table-row">
                  <span className="month">{pred.month}</span>
                  <span className="value">{formatCurrency(pred.predictedRevenue)}</span>
                  <span className="value">{formatCurrency(pred.predictedMargin)}</span>
                  <span className="value">{formatCurrency(pred.predictedRevenue * 0.75)}</span>
                  <div className="confidence">
                    <ProgressBar 
                      value={pred.confidence} 
                      max={100}
                      size="sm"
                      color={pred.confidence >= 85 ? 'success' : pred.confidence >= 75 ? 'warning' : 'danger'}
                    />
                    <span>{pred.confidence}%</span>
                  </div>
                  <span className={`trend ${pred.trend >= 0 ? 'positive' : 'negative'}`}>
                    {pred.trend >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(pred.trend))}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default FinancialAnalytics;

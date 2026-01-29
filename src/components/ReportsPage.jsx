import React, { useState } from 'react';
import {
  BarChart3, FileText, Download, Calendar, Filter, Printer,
  TrendingUp, Users, Package, ShoppingCart, DollarSign, PieChart,
  ArrowRight, RefreshCw, Mail, Clock
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, Button, Select, DateInput, Tabs } from './ui';
import { useFormatters } from '../hooks';
import { monthlyFinancials, clients, products } from '../data/mockData';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const { formatCurrency, formatNumber, formatPercent } = useFormatters();

  const tabs = [
    { id: 'sales', label: 'Ventes', icon: ShoppingCart },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'financial', label: 'Financier', icon: DollarSign },
  ];

  const periodOptions = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  // Données graphiques
  const salesByCategory = [
    { name: 'Viandes', value: 245000, color: '#00d4aa' },
    { name: 'Poissons', value: 182000, color: '#3b82f6' },
    { name: 'Fromages', value: 115000, color: '#8b5cf6' },
    { name: 'Fruits & Légumes', value: 89000, color: '#f59e0b' },
    { name: 'Épicerie', value: 49000, color: '#ef4444' },
  ];

  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    quantity: Math.floor(Math.random() * 500) + 100,
    revenue: Math.floor(Math.random() * 50000) + 10000
  }));

  const topClients = clients.slice(0, 5).map(c => ({
    name: c.name,
    orders: Math.floor(Math.random() * 50) + 10,
    revenue: c.totalCA
  }));

  const reportTemplates = [
    { id: 'sales-summary', name: 'Synthèse des ventes', icon: ShoppingCart, description: 'CA, marges, évolution' },
    { id: 'client-report', name: 'Rapport clients', icon: Users, description: 'Analyse clientèle' },
    { id: 'stock-report', name: 'État des stocks', icon: Package, description: 'Inventaire valorisé' },
    { id: 'payment-report', name: 'Suivi règlements', icon: DollarSign, description: 'Encaissements, impayés' },
    { id: 'margin-analysis', name: 'Analyse des marges', icon: TrendingUp, description: 'Par produit, client' },
    { id: 'vat-report', name: 'Déclaration TVA', icon: FileText, description: 'Collectée, déductible' },
  ];

  return (
    <div className="reports-page">
      {/* En-tête */}
      <div className="reports-header">
        <div className="period-selector">
          <Select
            value={period}
            onChange={setPeriod}
            options={periodOptions}
          />
          {period === 'custom' && (
            <>
              <DateInput value={dateFrom} onChange={setDateFrom} label="Du" />
              <DateInput value={dateTo} onChange={setDateTo} label="Au" />
            </>
          )}
          <Button variant="ghost" icon={RefreshCw}>Actualiser</Button>
        </div>
        <div className="export-actions">
          <Button variant="ghost" icon={Download}>Exporter PDF</Button>
          <Button variant="ghost" icon={Download}>Exporter Excel</Button>
          <Button variant="ghost" icon={Mail}>Envoyer par email</Button>
        </div>
      </div>

      {/* Modèles de rapports */}
      <Card title="Rapports rapides">
        <div className="report-templates-grid">
          {reportTemplates.map(template => (
            <div key={template.id} className="report-template-card">
              <div className="template-icon">
                <template.icon size={24} />
              </div>
              <div className="template-info">
                <span className="template-name">{template.name}</span>
                <span className="template-desc">{template.description}</span>
              </div>
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                Générer
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu selon tab */}
      {activeTab === 'sales' && (
        <div className="reports-content">
          <div className="charts-row">
            <Card title="Évolution du CA">
              <div className="chart-container" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlyFinancials}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#00d4aa" fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Répartition par catégorie">
              <div className="chart-container" style={{ height: 300 }}>
                <ResponsiveContainer>
                  <RePieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {salesByCategory.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {salesByCategory.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }}></span>
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* KPIs ventes */}
          <div className="kpis-summary">
            <div className="kpi-item">
              <span className="kpi-label">CA Total</span>
              <span className="kpi-value">{formatCurrency(monthlyFinancials.reduce((s, m) => s + m.revenue, 0))}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Nombre de commandes</span>
              <span className="kpi-value">{formatNumber(monthlyFinancials.reduce((s, m) => s + m.orders, 0))}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Panier moyen</span>
              <span className="kpi-value">{formatCurrency(monthlyFinancials.reduce((s, m) => s + m.revenue, 0) / monthlyFinancials.reduce((s, m) => s + m.orders, 0))}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Marge moyenne</span>
              <span className="kpi-value">{formatPercent((monthlyFinancials.reduce((s, m) => s + m.margin, 0) / monthlyFinancials.reduce((s, m) => s + m.revenue, 0)) * 100)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="reports-content">
          <Card title="Top 5 Produits vendus">
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={120} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#00d4aa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Détail produits">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité vendue</th>
                  <th>CA généré</th>
                  <th>% du CA total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td>{formatNumber(p.quantity)}</td>
                    <td>{formatCurrency(p.revenue)}</td>
                    <td>{formatPercent((p.revenue / topProducts.reduce((s, x) => s + x.revenue, 0)) * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="reports-content">
          <Card title="Top 5 Clients">
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topClients} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={150} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Analyse clientèle">
            <div className="client-stats-grid">
              <div className="stat-box">
                <span className="stat-value">{clients.length}</span>
                <span className="stat-label">Clients total</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{clients.filter(c => c.status === 'active').length}</span>
                <span className="stat-label">Clients actifs</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{formatCurrency(clients.reduce((s, c) => s + c.totalCA, 0) / clients.length)}</span>
                <span className="stat-label">CA moyen</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{Math.round(clients.reduce((s, c) => s + c.scoring, 0) / clients.length)}</span>
                <span className="stat-label">Score moyen</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="reports-content">
          <Card title="CA vs Marge">
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyFinancials}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="CA" stroke="#00d4aa" strokeWidth={2} />
                  <Line type="monotone" dataKey="margin" name="Marge" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Indicateurs financiers">
            <div className="financial-kpis">
              <div className="fin-kpi">
                <span className="label">CA Total</span>
                <span className="value">{formatCurrency(monthlyFinancials.reduce((s, m) => s + m.revenue, 0))}</span>
              </div>
              <div className="fin-kpi">
                <span className="label">Marge brute</span>
                <span className="value">{formatCurrency(monthlyFinancials.reduce((s, m) => s + m.margin, 0))}</span>
              </div>
              <div className="fin-kpi">
                <span className="label">Taux de marge</span>
                <span className="value">{formatPercent((monthlyFinancials.reduce((s, m) => s + m.margin, 0) / monthlyFinancials.reduce((s, m) => s + m.revenue, 0)) * 100)}</span>
              </div>
              <div className="fin-kpi">
                <span className="label">Coûts totaux</span>
                <span className="value">{formatCurrency(monthlyFinancials.reduce((s, m) => s + m.costs, 0))}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  Package, AlertTriangle, Clock, Truck, CheckCircle, ArrowRight,
  Calendar, Target, Zap, Activity
} from 'lucide-react';
import { StatCard, ProgressBar, StatusBadge, Alert, Card, Button } from './ui';
import { useFormatters } from '../hooks';
import { 
  globalKPIs, monthlyFinancials, financialPredictions, 
  clients, products, orders, stockAlerts 
} from '../data/mockData';

const Dashboard = () => {
  const [period, setPeriod] = useState('12m');
  const { formatCurrency, formatNumber, formatPercent } = useFormatters();

  // Données filtrées par période
  const filteredData = useMemo(() => {
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return monthlyFinancials.slice(-months);
  }, [period]);

  // Données combinées pour prédictions
  const combinedData = useMemo(() => {
    const historical = monthlyFinancials.slice(-6).map(d => ({
      ...d,
      type: 'historical'
    }));
    const predictions = financialPredictions.map(d => ({
      month: d.month,
      revenue: d.predictedRevenue,
      margin: d.predictedMargin,
      type: 'prediction',
      confidence: d.confidence
    }));
    return [...historical, ...predictions];
  }, []);

  // Répartition CA par catégorie
  const categoryData = [
    { name: 'Viandes', value: 2450000, color: '#00d4aa' },
    { name: 'Poissons', value: 1820000, color: '#3b82f6' },
    { name: 'Fromages', value: 1150000, color: '#8b5cf6' },
    { name: 'Fruits & Légumes', value: 890000, color: '#f59e0b' },
    { name: 'Épicerie', value: 490000, color: '#ef4444' },
  ];

  // Commandes par statut
  const orderStats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    preparation: orders.filter(o => o.status === 'preparation').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    total: orders.length
  }), []);

  // Capacité entrepôt
  const warehouseCapacity = [
    { zone: 'Froid négatif', used: 78, capacity: 100, color: '#3b82f6' },
    { zone: 'Froid positif', used: 65, capacity: 100, color: '#00d4aa' },
    { zone: 'Produits laitiers', used: 82, capacity: 100, color: '#8b5cf6' },
    { zone: 'Sec', used: 45, capacity: 100, color: '#f59e0b' },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      {/* KPIs principaux */}
      <div className="kpi-grid">
        <StatCard
          icon={DollarSign}
          label="Chiffre d'affaires"
          value={formatCurrency(globalKPIs.totalRevenue)}
          change={12.4}
          trend="up"
          color="primary"
          subtitle="vs mois dernier"
        />
        <StatCard
          icon={TrendingUp}
          label="Marge brute"
          value={formatCurrency(globalKPIs.totalMargin)}
          change={8.2}
          trend="up"
          color="success"
          subtitle={`Taux: ${formatPercent(globalKPIs.totalMargin / globalKPIs.totalRevenue * 100)}`}
        />
        <StatCard
          icon={Users}
          label="Clients actifs"
          value={formatNumber(globalKPIs.activeClients)}
          change={5.1}
          trend="up"
          color="secondary"
          subtitle="30 derniers jours"
        />
        <StatCard
          icon={ShoppingCart}
          label="Commandes"
          value={formatNumber(globalKPIs.totalOrders)}
          change={-2.3}
          trend="down"
          color="tertiary"
          subtitle="Ce mois"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="charts-grid">
        {/* Évolution CA/Marge */}
        <Card 
          title="Évolution CA & Marge" 
          actions={
            <div className="period-filters">
              {['3m', '6m', '12m'].map(p => (
                <button
                  key={p}
                  className={`period-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="CA"
                  stroke="#00d4aa" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="margin" 
                  name="Marge"
                  stroke="#3b82f6" 
                  fill="url(#colorMargin)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Prédictions IA */}
        <Card title="Prédictions IA - 6 mois" subtitle="Basé sur l'historique et les tendances">
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="Déc" stroke="#fff" strokeDasharray="5 5" label={{ value: 'Aujourd\'hui', fill: '#fff', fontSize: 11 }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="CA"
                  stroke="#00d4aa" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                  strokeDasharray={({ type }) => type === 'prediction' ? '5 5' : '0'}
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  name="Marge prédite"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="prediction-info">
            <Zap size={16} />
            <span>Confiance moyenne: <strong>85%</strong></span>
          </div>
        </Card>
      </div>

      {/* Seconde rangée */}
      <div className="charts-grid-3">
        {/* Répartition CA */}
        <Card title="Répartition CA par catégorie">
          <div className="chart-container" style={{ height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {categoryData.map((item, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-dot" style={{ background: item.color }}></span>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Commandes du jour */}
        <Card title="Commandes du jour">
          <div className="orders-stats">
            <div className="order-stat">
              <div className="order-stat-header">
                <Clock size={18} className="text-warning" />
                <span>En attente</span>
              </div>
              <div className="order-stat-value">{orderStats.pending}</div>
              <ProgressBar value={orderStats.pending} max={orderStats.total} color="warning" />
            </div>
            <div className="order-stat">
              <div className="order-stat-header">
                <Package size={18} className="text-secondary" />
                <span>Préparation</span>
              </div>
              <div className="order-stat-value">{orderStats.preparation}</div>
              <ProgressBar value={orderStats.preparation} max={orderStats.total} color="secondary" />
            </div>
            <div className="order-stat">
              <div className="order-stat-header">
                <Truck size={18} className="text-primary" />
                <span>Expédiées</span>
              </div>
              <div className="order-stat-value">{orderStats.shipped}</div>
              <ProgressBar value={orderStats.shipped} max={orderStats.total} color="primary" />
            </div>
            <div className="order-stat">
              <div className="order-stat-header">
                <CheckCircle size={18} className="text-success" />
                <span>Livrées</span>
              </div>
              <div className="order-stat-value">{orderStats.delivered}</div>
              <ProgressBar value={orderStats.delivered} max={orderStats.total} color="success" />
            </div>
          </div>
        </Card>

        {/* Capacité entrepôt */}
        <Card title="Capacité entrepôt">
          <div className="warehouse-stats">
            {warehouseCapacity.map((zone, idx) => (
              <div key={idx} className="warehouse-zone">
                <div className="zone-header">
                  <span className="zone-name">{zone.zone}</span>
                  <span className="zone-percent" style={{ color: zone.color }}>
                    {zone.used}%
                  </span>
                </div>
                <ProgressBar 
                  value={zone.used} 
                  max={zone.capacity} 
                  color={zone.used > 80 ? 'danger' : zone.used > 60 ? 'warning' : 'success'}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alertes et commandes récentes */}
      <div className="bottom-grid">
        {/* Alertes actives */}
        <Card 
          title="Alertes actives" 
          actions={<Button variant="ghost" size="sm">Voir tout</Button>}
        >
          <div className="alerts-list">
            {stockAlerts.slice(0, 4).map((alert, idx) => (
              <Alert 
                key={idx}
                type={alert.type === 'stock_low' ? 'warning' : 'danger'}
                title={alert.type === 'stock_low' ? 'Stock bas' : 'DLC proche'}
              >
                {alert.message}
              </Alert>
            ))}
          </div>
        </Card>

        {/* Commandes récentes */}
        <Card 
          title="Commandes récentes" 
          actions={<Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Voir tout</Button>}
        >
          <div className="recent-orders">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map(order => (
                  <tr key={order.id}>
                    <td className="order-number">{order.orderNumber}</td>
                    <td>{order.clientName}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><StatusBadge status={order.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top clients */}
        <Card title="Top 5 Clients">
          <div className="top-clients">
            {clients.slice(0, 5).map((client, idx) => (
              <div key={client.id} className="top-client-item">
                <div className="client-rank">{idx + 1}</div>
                <div className="client-info">
                  <span className="client-name">{client.name}</span>
                  <span className="client-type">{client.type}</span>
                </div>
                <div className="client-revenue">
                  {formatCurrency(client.totalCA)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// ============================================
// MARKET PRO - Dashboard Super Administrateur
// Vue multi-entreprises et KPIs globaux
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Building2, Users, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, Activity, Globe, Server, Shield,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Bell, CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Données de démonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        enterprises: {
          total: 12,
          active: 10,
          trial: 2,
          growth: 8.5
        },
        users: {
          total: 248,
          activeToday: 187,
          newThisMonth: 23,
          growth: 12.3
        },
        revenue: {
          total: 487500,
          thisMonth: 52400,
          lastMonth: 48200,
          growth: 8.7,
          mrr: 41250
        },
        system: {
          uptime: 99.97,
          responseTime: 145,
          errorRate: 0.02,
          activeConnections: 312
        },
        alerts: [
          { id: 1, type: 'warning', enterprise: 'Carrefour Lyon', message: 'Quota stockage 85%', time: '5 min' },
          { id: 2, type: 'error', enterprise: 'Metro Paris', message: 'Échec synchronisation', time: '12 min' },
          { id: 3, type: 'info', enterprise: 'Sysco Marseille', message: 'Nouvel utilisateur créé', time: '1h' },
          { id: 4, type: 'success', enterprise: 'Promocash Nice', message: 'Migration terminée', time: '2h' }
        ],
        enterprisesList: [
          { id: 1, name: 'Carrefour Lyon', users: 45, revenue: 12500, status: 'active', plan: 'enterprise' },
          { id: 2, name: 'Metro Paris', users: 38, revenue: 9800, status: 'active', plan: 'enterprise' },
          { id: 3, name: 'Sysco Marseille', users: 32, revenue: 8200, status: 'active', plan: 'pro' },
          { id: 4, name: 'Promocash Nice', users: 28, revenue: 7400, status: 'active', plan: 'pro' },
          { id: 5, name: 'Brake Bordeaux', users: 22, revenue: 5600, status: 'active', plan: 'pro' },
          { id: 6, name: 'Davigel Toulouse', users: 18, revenue: 4200, status: 'trial', plan: 'trial' }
        ]
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="animate-spin" size={32} />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="role-dashboard super-admin-dashboard">
      {/* En-tête avec période */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2><Globe size={24} /> Tableau de Bord Super Admin</h2>
          <p>Vue globale multi-entreprises</p>
        </div>
        <div className="period-selector">
          {['week', 'month', 'quarter', 'year'].map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card primary">
          <div className="kpi-icon">
            <Building2 size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Entreprises</span>
            <span className="kpi-value">{stats.enterprises.total}</span>
            <span className="kpi-detail">
              <span className="active">{stats.enterprises.active} actives</span>
              <span className="trial">{stats.enterprises.trial} essai</span>
            </span>
          </div>
          <div className={`kpi-trend positive`}>
            <ArrowUpRight size={16} />
            +{stats.enterprises.growth}%
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Utilisateurs</span>
            <span className="kpi-value">{formatNumber(stats.users.total)}</span>
            <span className="kpi-detail">
              <span className="active">{stats.users.activeToday} actifs</span>
              <span className="new">+{stats.users.newThisMonth} ce mois</span>
            </span>
          </div>
          <div className={`kpi-trend positive`}>
            <ArrowUpRight size={16} />
            +{stats.users.growth}%
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Revenu Total</span>
            <span className="kpi-value">{formatCurrency(stats.revenue.total)}</span>
            <span className="kpi-detail">
              <span className="mrr">MRR: {formatCurrency(stats.revenue.mrr)}</span>
            </span>
          </div>
          <div className={`kpi-trend positive`}>
            <ArrowUpRight size={16} />
            +{stats.revenue.growth}%
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <Server size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Uptime Système</span>
            <span className="kpi-value">{stats.system.uptime}%</span>
            <span className="kpi-detail">
              <span className="response">{stats.system.responseTime}ms latence</span>
            </span>
          </div>
          <div className="kpi-status online">
            <Activity size={16} /> En ligne
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="dashboard-main-grid">
        {/* Liste des entreprises */}
        <div className="dashboard-card enterprises-card">
          <div className="card-header">
            <h3><Building2 size={18} /> Entreprises</h3>
            <button className="btn-link">Voir tout</button>
          </div>
          <div className="enterprises-table">
            <table>
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Utilisateurs</th>
                  <th>Revenu/mois</th>
                  <th>Plan</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.enterprisesList.map(enterprise => (
                  <tr key={enterprise.id}>
                    <td className="enterprise-name">{enterprise.name}</td>
                    <td>{enterprise.users}</td>
                    <td>{formatCurrency(enterprise.revenue)}</td>
                    <td>
                      <span className={`plan-badge ${enterprise.plan}`}>
                        {enterprise.plan}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${enterprise.status}`}>
                        {enterprise.status === 'active' ? 'Actif' : 'Essai'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes système */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3><Bell size={18} /> Alertes Système</h3>
            <span className="alert-count">{stats.alerts.length}</span>
          </div>
          <div className="alerts-list">
            {stats.alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'error' && <XCircle size={18} />}
                  {alert.type === 'warning' && <AlertTriangle size={18} />}
                  {alert.type === 'info' && <Bell size={18} />}
                  {alert.type === 'success' && <CheckCircle size={18} />}
                </div>
                <div className="alert-content">
                  <span className="alert-enterprise">{alert.enterprise}</span>
                  <span className="alert-message">{alert.message}</span>
                </div>
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques système */}
      <div className="dashboard-metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <Activity size={18} />
            <span>Connexions Actives</span>
          </div>
          <div className="metric-value">{stats.system.activeConnections}</div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${(stats.system.activeConnections / 500) * 100}%` }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Clock size={18} />
            <span>Temps de Réponse</span>
          </div>
          <div className="metric-value">{stats.system.responseTime}ms</div>
          <div className="metric-bar">
            <div className="metric-fill good" style={{ width: `${100 - (stats.system.responseTime / 5)}%` }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Shield size={18} />
            <span>Taux d'Erreur</span>
          </div>
          <div className="metric-value">{stats.system.errorRate}%</div>
          <div className="metric-bar">
            <div className="metric-fill excellent" style={{ width: `${100 - stats.system.errorRate}%` }}></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <TrendingUp size={18} />
            <span>Croissance MRR</span>
          </div>
          <div className="metric-value positive">+{stats.revenue.growth}%</div>
          <div className="metric-comparison">
            <span>{formatCurrency(stats.revenue.thisMonth)}</span>
            <span className="vs">vs</span>
            <span>{formatCurrency(stats.revenue.lastMonth)}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .role-dashboard {
          padding: 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-info h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .header-info p {
          color: var(--text-secondary);
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }

        .period-selector {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-secondary);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .period-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .period-btn.active {
          background: var(--bg-primary);
          color: var(--primary);
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .kpi-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .kpi-grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 1200px) {
          .kpi-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .kpi-grid-4 {
            grid-template-columns: 1fr;
          }
        }

        .kpi-card {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          border: 1px solid var(--border-color);
          position: relative;
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-card.primary .kpi-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .kpi-card.success .kpi-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .kpi-card.warning .kpi-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .kpi-card.info .kpi-icon {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .kpi-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .kpi-detail {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .kpi-detail .active {
          color: #10b981;
        }

        .kpi-detail .trial,
        .kpi-detail .new {
          color: var(--text-secondary);
        }

        .kpi-detail .mrr,
        .kpi-detail .response {
          color: var(--text-secondary);
        }

        .kpi-trend {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .kpi-trend.positive {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .kpi-trend.negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .kpi-status {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .kpi-status.online {
          color: #10b981;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-card {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .card-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .alert-count {
          background: var(--danger);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .enterprises-table {
          overflow-x: auto;
        }

        .enterprises-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .enterprises-table th,
        .enterprises-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .enterprises-table th {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 500;
          background: var(--bg-secondary);
        }

        .enterprises-table td {
          font-size: 0.875rem;
        }

        .enterprise-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .plan-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .plan-badge.enterprise {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .plan-badge.pro {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .plan-badge.trial {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.trial {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .alerts-list {
          padding: 0.5rem;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          background: var(--bg-secondary);
        }

        .alert-item:last-child {
          margin-bottom: 0;
        }

        .alert-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .alert-item.error .alert-icon {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .alert-item.warning .alert-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .alert-item.info .alert-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .alert-item.success .alert-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .alert-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .alert-enterprise {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .alert-message {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .alert-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dashboard-metrics-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .dashboard-metrics-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .dashboard-metrics-row {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .metric-value.positive {
          color: #10b981;
        }

        .metric-bar {
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
          transition: width 0.3s;
        }

        .metric-fill.good {
          background: #10b981;
        }

        .metric-fill.excellent {
          background: #10b981;
        }

        .metric-comparison {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .metric-comparison .vs {
          color: var(--text-muted);
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;

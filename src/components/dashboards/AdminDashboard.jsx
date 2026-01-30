// ============================================
// MARKET PRO - Dashboard Administrateur
// Vue entreprise et gestion des équipes
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, DollarSign, Package, ShoppingCart,
  FileText, AlertTriangle, Activity, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, Calendar, Target,
  UserCheck, BarChart3, RefreshCw, Bell
} from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        revenue: {
          today: 12450,
          month: 287500,
          target: 350000,
          progress: 82,
          growth: 12.5
        },
        orders: {
          today: 47,
          pending: 12,
          processing: 8,
          completed: 27
        },
        clients: {
          total: 342,
          active: 156,
          newThisMonth: 18,
          growth: 5.2
        },
        stock: {
          value: 485000,
          lowStock: 23,
          outOfStock: 4,
          movements: 156
        },
        team: {
          total: 24,
          present: 21,
          absent: 3,
          performance: [
            { name: 'Lucas P.', role: 'Logisticien', tasks: 32, efficiency: 94 },
            { name: 'Marie L.', role: 'Resp. Log.', tasks: 28, efficiency: 98 },
            { name: 'Pierre B.', role: 'Commercial', tasks: 45, efficiency: 87 },
            { name: 'Sophie P.', role: 'Caissier', tasks: 89, efficiency: 92 }
          ]
        },
        recentActivity: [
          { id: 1, type: 'order', message: 'Commande #CMD-2024-892 validée', user: 'Pierre B.', time: '2 min' },
          { id: 2, type: 'stock', message: 'Réception fournisseur complétée', user: 'Lucas P.', time: '15 min' },
          { id: 3, type: 'payment', message: 'Paiement de 2,450€ encaissé', user: 'Sophie P.', time: '32 min' },
          { id: 4, type: 'client', message: 'Nouveau client: Restaurant Lyon', user: 'Pierre B.', time: '1h' },
          { id: 5, type: 'invoice', message: 'Facture FAC-2024-156 émise', user: 'Claire D.', time: '2h' }
        ],
        alerts: {
          count: 5,
          critical: 1,
          warning: 3,
          info: 1
        }
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="animate-spin" size={32} />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="role-dashboard admin-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><Target size={24} /> Administration</h2>
          <p>Vue d'ensemble de l'entreprise</p>
        </div>
        <div className="header-actions">
          <div className="alerts-badge" title="Alertes">
            <Bell size={20} />
            <span className="badge">{stats.alerts.count}</span>
          </div>
          <div className="team-status">
            <UserCheck size={18} />
            <span>{stats.team.present}/{stats.team.total} présents</span>
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card revenue">
          <div className="kpi-header">
            <DollarSign size={20} />
            <span className="kpi-trend positive">
              <ArrowUpRight size={14} />
              +{stats.revenue.growth}%
            </span>
          </div>
          <div className="kpi-value">{formatCurrency(stats.revenue.month)}</div>
          <div className="kpi-label">Chiffre d'affaires du mois</div>
          <div className="kpi-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.revenue.progress}%` }}></div>
            </div>
            <span className="progress-text">{stats.revenue.progress}% de l'objectif</span>
          </div>
        </div>

        <div className="kpi-card orders">
          <div className="kpi-header">
            <ShoppingCart size={20} />
            <span className="kpi-today">+{stats.orders.today} aujourd'hui</span>
          </div>
          <div className="kpi-value">{stats.orders.pending + stats.orders.processing + stats.orders.completed}</div>
          <div className="kpi-label">Commandes</div>
          <div className="kpi-breakdown">
            <span className="pending">{stats.orders.pending} en attente</span>
            <span className="processing">{stats.orders.processing} en cours</span>
            <span className="completed">{stats.orders.completed} terminées</span>
          </div>
        </div>

        <div className="kpi-card clients">
          <div className="kpi-header">
            <Users size={20} />
            <span className="kpi-trend positive">
              <ArrowUpRight size={14} />
              +{stats.clients.growth}%
            </span>
          </div>
          <div className="kpi-value">{stats.clients.total}</div>
          <div className="kpi-label">Clients</div>
          <div className="kpi-breakdown">
            <span className="active">{stats.clients.active} actifs</span>
            <span className="new">+{stats.clients.newThisMonth} ce mois</span>
          </div>
        </div>

        <div className="kpi-card stock">
          <div className="kpi-header">
            <Package size={20} />
            {stats.stock.lowStock > 0 && (
              <span className="kpi-alert">
                <AlertTriangle size={14} />
                {stats.stock.lowStock} alertes
              </span>
            )}
          </div>
          <div className="kpi-value">{formatCurrency(stats.stock.value)}</div>
          <div className="kpi-label">Valeur du stock</div>
          <div className="kpi-breakdown">
            <span className="warning">{stats.stock.lowStock} stock bas</span>
            <span className="danger">{stats.stock.outOfStock} ruptures</span>
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="dashboard-grid-2">
        {/* Performance équipe */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><BarChart3 size={18} /> Performance Équipe</h3>
            <span className="card-subtitle">Top performers du jour</span>
          </div>
          <div className="team-performance">
            {stats.team.performance.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
                <div className="member-stats">
                  <span className="tasks-count">{member.tasks} tâches</span>
                  <div className="efficiency-bar">
                    <div
                      className="efficiency-fill"
                      style={{ width: `${member.efficiency}%` }}
                    ></div>
                  </div>
                  <span className="efficiency-value">{member.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><Activity size={18} /> Activité Récente</h3>
            <button className="btn-link">Voir tout</button>
          </div>
          <div className="activity-list">
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'order' && <ShoppingCart size={16} />}
                  {activity.type === 'stock' && <Package size={16} />}
                  {activity.type === 'payment' && <DollarSign size={16} />}
                  {activity.type === 'client' && <Users size={16} />}
                  {activity.type === 'invoice' && <FileText size={16} />}
                </div>
                <div className="activity-content">
                  <span className="activity-message">{activity.message}</span>
                  <span className="activity-user">{activity.user}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicateurs rapides */}
      <div className="quick-stats-row">
        <div className="quick-stat">
          <Calendar size={18} />
          <span className="stat-label">CA Aujourd'hui</span>
          <span className="stat-value">{formatCurrency(stats.revenue.today)}</span>
        </div>
        <div className="quick-stat">
          <Clock size={18} />
          <span className="stat-label">Commandes en attente</span>
          <span className="stat-value warning">{stats.orders.pending}</span>
        </div>
        <div className="quick-stat">
          <TrendingUp size={18} />
          <span className="stat-label">Mouvements stock</span>
          <span className="stat-value">{stats.stock.movements}</span>
        </div>
        <div className="quick-stat">
          <CheckCircle size={18} />
          <span className="stat-label">Taux présence</span>
          <span className="stat-value">{Math.round((stats.team.present / stats.team.total) * 100)}%</span>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .alerts-badge {
          position: relative;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .alerts-badge .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--danger);
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 2px 5px;
          border-radius: 9999px;
        }

        .team-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
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
          border: 1px solid var(--border-color);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .kpi-trend.positive {
          color: #10b981;
        }

        .kpi-today {
          font-size: 0.75rem;
          color: var(--primary);
        }

        .kpi-alert {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #f59e0b;
        }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .kpi-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .kpi-progress {
          margin-top: 0.75rem;
        }

        .progress-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 3px;
        }

        .progress-text {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .kpi-breakdown {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        .kpi-breakdown .pending {
          color: #f59e0b;
        }

        .kpi-breakdown .processing {
          color: #3b82f6;
        }

        .kpi-breakdown .completed {
          color: #10b981;
        }

        .kpi-breakdown .active {
          color: #10b981;
        }

        .kpi-breakdown .new {
          color: var(--primary);
        }

        .kpi-breakdown .warning {
          color: #f59e0b;
        }

        .kpi-breakdown .danger {
          color: #ef4444;
        }

        .dashboard-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-grid-2 {
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

        .card-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .team-performance {
          padding: 1rem;
        }

        .team-member {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          background: var(--bg-secondary);
        }

        .team-member:last-child {
          margin-bottom: 0;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .member-details {
          display: flex;
          flex-direction: column;
        }

        .member-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .member-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .member-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tasks-count {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .efficiency-bar {
          width: 60px;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          overflow: hidden;
        }

        .efficiency-fill {
          height: 100%;
          background: #10b981;
          border-radius: 2px;
        }

        .efficiency-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
        }

        .activity-list {
          padding: 0.5rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .activity-item:hover {
          background: var(--bg-secondary);
        }

        .activity-item:last-child {
          margin-bottom: 0;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon.order {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .activity-icon.stock {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .activity-icon.payment {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .activity-icon.client {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .activity-icon.invoice {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .activity-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .activity-message {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .activity-user {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .quick-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .quick-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .quick-stats-row {
            grid-template-columns: 1fr;
          }
        }

        .quick-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1rem;
        }

        .quick-stat svg {
          color: var(--text-secondary);
        }

        .stat-label {
          flex: 1;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-value.warning {
          color: #f59e0b;
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

export default AdminDashboard;

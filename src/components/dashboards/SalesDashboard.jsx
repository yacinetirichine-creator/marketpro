// ============================================
// MARKET PRO - Dashboard Commercial
// Ventes, objectifs et clients
// ============================================

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, ShoppingCart, Target, Star,
  Phone, Calendar, DollarSign, ArrowUpRight, Clock,
  CheckCircle, AlertCircle, RefreshCw, Award, User
} from 'lucide-react';

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        sales: {
          today: 8450,
          week: 42300,
          month: 156800,
          target: 180000,
          progress: 87.1,
          orders: 23
        },
        clients: {
          active: 45,
          contacted: 12,
          newThisMonth: 6,
          toFollow: 8
        },
        performance: {
          rank: 2,
          totalSellers: 5,
          conversionRate: 34.5,
          avgOrderValue: 367
        },
        recentOrders: [
          { id: 'CMD-892', client: 'Le Gourmet', amount: 1250, status: 'confirmed', time: '10:30' },
          { id: 'CMD-891', client: 'Bistrot Lyon', amount: 890, status: 'pending', time: '09:45' },
          { id: 'CMD-890', client: 'Café Place', amount: 456, status: 'confirmed', time: '09:15' },
          { id: 'CMD-889', client: 'La Table', amount: 1680, status: 'delivered', time: 'Hier' }
        ],
        topClients: [
          { name: 'Restaurant Le Gourmet', orders: 45, revenue: 28500 },
          { name: 'Bistrot Lyonnais', orders: 38, revenue: 22400 },
          { name: 'La Table du Chef', orders: 32, revenue: 19800 }
        ],
        tasks: [
          { id: 1, type: 'call', client: 'Nouveau prospect - Pizzeria Roma', time: '11:00' },
          { id: 2, type: 'followup', client: 'Relance devis - Café Central', time: '14:00' },
          { id: 3, type: 'meeting', client: 'RDV - Hôtel Mercure', time: '16:30' }
        ]
      });
      setLoading(false);
    }, 500);
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
    <div className="role-dashboard sales-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><TrendingUp size={24} /> Mes Ventes</h2>
          <p>Objectifs et performance commerciale</p>
        </div>
        <div className="header-stats">
          <div className="rank-badge">
            <Award size={16} />
            #{stats.performance.rank}/{stats.performance.totalSellers}
          </div>
        </div>
      </div>

      {/* Objectif principal */}
      <div className="target-card">
        <div className="target-header">
          <div className="target-info">
            <Target size={20} />
            <span>Objectif mensuel</span>
          </div>
          <span className="target-amount">{formatCurrency(stats.sales.target)}</span>
        </div>
        <div className="target-progress">
          <div className="progress-bar-large">
            <div className="progress-fill" style={{ width: `${stats.sales.progress}%` }}></div>
          </div>
          <div className="progress-stats">
            <span className="current">{formatCurrency(stats.sales.month)}</span>
            <span className="percent">{stats.sales.progress}%</span>
            <span className="remaining">{formatCurrency(stats.sales.target - stats.sales.month)} restant</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <DollarSign size={20} />
          <div className="kpi-content">
            <span className="kpi-value">{formatCurrency(stats.sales.today)}</span>
            <span className="kpi-label">CA Aujourd'hui</span>
          </div>
          <span className="kpi-orders">{stats.sales.orders} commandes</span>
        </div>

        <div className="kpi-card">
          <Users size={20} />
          <div className="kpi-content">
            <span className="kpi-value">{stats.clients.active}</span>
            <span className="kpi-label">Clients actifs</span>
          </div>
          <span className="kpi-new">+{stats.clients.newThisMonth} ce mois</span>
        </div>

        <div className="kpi-card">
          <ShoppingCart size={20} />
          <div className="kpi-content">
            <span className="kpi-value">{formatCurrency(stats.performance.avgOrderValue)}</span>
            <span className="kpi-label">Panier moyen</span>
          </div>
        </div>

        <div className="kpi-card">
          <TrendingUp size={20} />
          <div className="kpi-content">
            <span className="kpi-value">{stats.performance.conversionRate}%</span>
            <span className="kpi-label">Taux conversion</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Commandes récentes */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><ShoppingCart size={18} /> Commandes du jour</h3>
          </div>
          <div className="orders-list">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <span className="order-id">{order.id}</span>
                  <span className="order-client">{order.client}</span>
                </div>
                <div className="order-meta">
                  <span className="order-amount">{formatCurrency(order.amount)}</span>
                  <span className={`order-status ${order.status}`}>
                    {order.status === 'confirmed' && <CheckCircle size={12} />}
                    {order.status === 'pending' && <Clock size={12} />}
                    {order.status === 'delivered' && <CheckCircle size={12} />}
                    {order.status === 'confirmed' ? 'Confirmée' : order.status === 'pending' ? 'En attente' : 'Livrée'}
                  </span>
                </div>
                <span className="order-time">{order.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tâches du jour */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><Calendar size={18} /> Agenda du jour</h3>
            <span className="task-count">{stats.tasks.length}</span>
          </div>
          <div className="tasks-list">
            {stats.tasks.map(task => (
              <div key={task.id} className={`task-item ${task.type}`}>
                <div className="task-icon">
                  {task.type === 'call' && <Phone size={16} />}
                  {task.type === 'followup' && <AlertCircle size={16} />}
                  {task.type === 'meeting' && <User size={16} />}
                </div>
                <div className="task-content">
                  <span className="task-title">{task.client}</span>
                  <span className="task-time">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3><Star size={18} /> Mes Top Clients</h3>
          </div>
          <div className="clients-grid">
            {stats.topClients.map((client, index) => (
              <div key={index} className="client-card">
                <div className="client-rank">#{index + 1}</div>
                <div className="client-info">
                  <span className="client-name">{client.name}</span>
                  <span className="client-orders">{client.orders} commandes</span>
                </div>
                <div className="client-revenue">{formatCurrency(client.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clients à suivre */}
      {stats.clients.toFollow > 0 && (
        <div className="follow-banner">
          <AlertCircle size={18} />
          <span>{stats.clients.toFollow} clients à relancer cette semaine</span>
          <button className="btn-view">Voir la liste</button>
        </div>
      )}

      <style jsx>{`
        .sales-dashboard {
          padding: 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
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

        .rank-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          border-radius: 0.5rem;
          font-weight: 600;
        }

        .target-card {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 0.75rem;
          padding: 1.5rem;
          color: white;
          margin-bottom: 1.5rem;
        }

        .target-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .target-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .target-amount {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .progress-bar-large {
          height: 12px;
          background: rgba(255,255,255,0.3);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 6px;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .progress-stats .current {
          font-weight: 600;
        }

        .progress-stats .percent {
          font-weight: 700;
          font-size: 1rem;
        }

        .progress-stats .remaining {
          opacity: 0.8;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .kpi-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .kpi-card svg {
          color: var(--primary);
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .kpi-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .kpi-orders, .kpi-new {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .kpi-new {
          color: #10b981;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .dashboard-card.full-width {
          grid-column: 1 / -1;
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

        .task-count {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .orders-list, .tasks-list {
          padding: 0.5rem;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .order-item:hover {
          background: var(--bg-secondary);
        }

        .order-info {
          flex: 1;
        }

        .order-id {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .order-client {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .order-meta {
          text-align: right;
        }

        .order-amount {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
        }

        .order-status {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .order-status.confirmed { color: #10b981; }
        .order-status.pending { color: #f59e0b; }
        .order-status.delivered { color: #3b82f6; }

        .order-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          min-width: 50px;
          text-align: right;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          background: var(--bg-secondary);
        }

        .task-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .task-item.call .task-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .task-item.followup .task-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .task-item.meeting .task-icon {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .task-content {
          flex: 1;
        }

        .task-title {
          display: block;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .task-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .clients-grid {
            grid-template-columns: 1fr;
          }
        }

        .client-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .client-rank {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .client-info {
          flex: 1;
        }

        .client-name {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .client-orders {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .client-revenue {
          font-weight: 700;
          color: var(--text-primary);
        }

        .follow-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 0.75rem;
          color: #f59e0b;
        }

        .follow-banner span {
          flex: 1;
        }

        .btn-view {
          padding: 0.5rem 1rem;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
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

export default SalesDashboard;

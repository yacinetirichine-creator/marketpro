// ============================================
// MARKET PRO - Dashboard Responsable Logistique
// KPIs logistique et performance équipe
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Package, Truck, ClipboardCheck, MapPin, Users,
  AlertTriangle, TrendingUp, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, Play,
  Pause, BarChart3, Target, Thermometer, Box
} from 'lucide-react';

const LogisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        picking: {
          pending: 8,
          inProgress: 5,
          completed: 42,
          rate: 94.5,
          avgTime: 12.3 // minutes
        },
        reception: {
          pending: 3,
          inProgress: 2,
          completedToday: 7,
          anomalies: 2
        },
        inventory: {
          accuracy: 98.7,
          lastCount: '2025-01-28',
          scheduled: 2,
          lowStock: 23,
          outOfStock: 4
        },
        delivery: {
          scheduled: 15,
          inTransit: 6,
          delivered: 28,
          delayed: 2,
          onTimeRate: 93.5
        },
        warehouse: {
          occupancy: 72,
          zones: [
            { code: 'F', name: 'Frais', fill: 85, temp: 4.2 },
            { code: 'S', name: 'Sec', fill: 68, temp: null },
            { code: 'C', name: 'Congélateur', fill: 45, temp: -18.5 },
            { code: 'Q', name: 'Quai', fill: 30, temp: null }
          ],
          totalLocations: 1250,
          usedLocations: 900
        },
        team: {
          logisticiens: [
            { name: 'Lucas P.', status: 'picking', current: 'CMD-892', progress: 75 },
            { name: 'Thomas S.', status: 'reception', current: 'BL-456', progress: 40 },
            { name: 'Emma R.', status: 'inventory', current: 'Zone F', progress: 60 },
            { name: 'Hugo M.', status: 'idle', current: null, progress: 0 }
          ],
          efficiency: 91.2
        },
        alerts: [
          { id: 1, type: 'danger', message: 'Rupture: Filet de bœuf (SKU-001)', zone: 'F' },
          { id: 2, type: 'warning', message: 'Stock bas: Saumon fumé (15 unités)', zone: 'F' },
          { id: 3, type: 'warning', message: 'Température zone C: -16.8°C', zone: 'C' },
          { id: 4, type: 'info', message: 'Livraison Metro prévue 14h00', zone: 'Q' }
        ]
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="animate-spin" size={32} />
        <p>Chargement...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'picking': return '#3b82f6';
      case 'reception': return '#f59e0b';
      case 'inventory': return '#8b5cf6';
      case 'idle': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'picking': return 'Picking';
      case 'reception': return 'Réception';
      case 'inventory': return 'Inventaire';
      case 'idle': return 'Disponible';
      default: return status;
    }
  };

  return (
    <div className="role-dashboard logistics-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><Truck size={24} /> Logistique</h2>
          <p>Supervision entrepôt et équipe</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge success">
            <CheckCircle size={16} />
            {stats.picking.completed + stats.reception.completedToday} opérations
          </div>
          <div className="stat-badge warning">
            <AlertTriangle size={16} />
            {stats.alerts.length} alertes
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card picking">
          <div className="kpi-header">
            <ClipboardCheck size={20} />
            <span className="kpi-rate">{stats.picking.rate}%</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.picking.pending + stats.picking.inProgress}</span>
            <span className="kpi-label">Pickings en cours</span>
          </div>
          <div className="kpi-breakdown">
            <span className="pending">{stats.picking.pending} en attente</span>
            <span className="active">{stats.picking.inProgress} actifs</span>
          </div>
          <div className="kpi-footer">
            <Clock size={14} />
            <span>Moy. {stats.picking.avgTime} min/picking</span>
          </div>
        </div>

        <div className="kpi-card reception">
          <div className="kpi-header">
            <Package size={20} />
            {stats.reception.anomalies > 0 && (
              <span className="kpi-alert">
                <AlertTriangle size={14} />
                {stats.reception.anomalies}
              </span>
            )}
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.reception.pending + stats.reception.inProgress}</span>
            <span className="kpi-label">Réceptions à traiter</span>
          </div>
          <div className="kpi-breakdown">
            <span className="pending">{stats.reception.pending} en attente</span>
            <span className="active">{stats.reception.inProgress} en cours</span>
          </div>
          <div className="kpi-footer">
            <CheckCircle size={14} />
            <span>{stats.reception.completedToday} complétées aujourd'hui</span>
          </div>
        </div>

        <div className="kpi-card delivery">
          <div className="kpi-header">
            <Truck size={20} />
            <span className={`kpi-rate ${stats.delivery.onTimeRate >= 90 ? 'good' : 'warning'}`}>
              {stats.delivery.onTimeRate}%
            </span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.delivery.inTransit}</span>
            <span className="kpi-label">Livraisons en cours</span>
          </div>
          <div className="kpi-breakdown">
            <span className="scheduled">{stats.delivery.scheduled} planifiées</span>
            {stats.delivery.delayed > 0 && (
              <span className="delayed">{stats.delivery.delayed} retardées</span>
            )}
          </div>
          <div className="kpi-footer">
            <Target size={14} />
            <span>Taux ponctualité</span>
          </div>
        </div>

        <div className="kpi-card inventory">
          <div className="kpi-header">
            <BarChart3 size={20} />
            <span className={`kpi-rate ${stats.inventory.accuracy >= 98 ? 'good' : 'warning'}`}>
              {stats.inventory.accuracy}%
            </span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.inventory.lowStock + stats.inventory.outOfStock}</span>
            <span className="kpi-label">Alertes stock</span>
          </div>
          <div className="kpi-breakdown">
            <span className="warning">{stats.inventory.lowStock} bas</span>
            <span className="danger">{stats.inventory.outOfStock} ruptures</span>
          </div>
          <div className="kpi-footer">
            <Clock size={14} />
            <span>Précision inventaire</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-3">
        {/* État des zones */}
        <div className="dashboard-card zones-card">
          <div className="card-header">
            <h3><MapPin size={18} /> Zones Entrepôt</h3>
            <span className="occupancy">{stats.warehouse.occupancy}% occupé</span>
          </div>
          <div className="zones-grid">
            {stats.warehouse.zones.map(zone => (
              <div key={zone.code} className={`zone-item zone-${zone.code.toLowerCase()}`}>
                <div className="zone-header">
                  <span className="zone-code">{zone.code}</span>
                  <span className="zone-name">{zone.name}</span>
                </div>
                <div className="zone-fill-bar">
                  <div
                    className="zone-fill"
                    style={{ width: `${zone.fill}%` }}
                  ></div>
                </div>
                <div className="zone-stats">
                  <span className="zone-percent">{zone.fill}%</span>
                  {zone.temp !== null && (
                    <span className="zone-temp">
                      <Thermometer size={12} />
                      {zone.temp}°C
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="zones-summary">
            <Box size={14} />
            <span>{stats.warehouse.usedLocations}/{stats.warehouse.totalLocations} emplacements</span>
          </div>
        </div>

        {/* Équipe logistique */}
        <div className="dashboard-card team-card">
          <div className="card-header">
            <h3><Users size={18} /> Équipe</h3>
            <span className="efficiency">{stats.team.efficiency}% efficacité</span>
          </div>
          <div className="team-list">
            {stats.team.logisticiens.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-info">
                  <div
                    className="member-status-dot"
                    style={{ background: getStatusColor(member.status) }}
                  ></div>
                  <span className="member-name">{member.name}</span>
                </div>
                <div className="member-task">
                  <span
                    className="task-status"
                    style={{ color: getStatusColor(member.status) }}
                  >
                    {getStatusLabel(member.status)}
                  </span>
                  {member.current && (
                    <span className="task-current">{member.current}</span>
                  )}
                </div>
                {member.progress > 0 && (
                  <div className="member-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${member.progress}%`,
                          background: getStatusColor(member.status)
                        }}
                      ></div>
                    </div>
                    <span className="progress-value">{member.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3><AlertTriangle size={18} /> Alertes</h3>
            <span className="alert-count">{stats.alerts.length}</span>
          </div>
          <div className="alerts-list">
            {stats.alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-content">
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-zone">Zone {alert.zone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .logistics-dashboard {
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

        .header-stats {
          display: flex;
          gap: 0.75rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-badge.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .stat-badge.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
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

        .kpi-rate {
          font-size: 0.875rem;
          font-weight: 600;
          color: #10b981;
        }

        .kpi-rate.good {
          color: #10b981;
        }

        .kpi-rate.warning {
          color: #f59e0b;
        }

        .kpi-alert {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .kpi-content {
          margin-bottom: 0.5rem;
        }

        .kpi-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .kpi-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .kpi-breakdown {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.75rem;
        }

        .kpi-breakdown .pending {
          color: #f59e0b;
        }

        .kpi-breakdown .active {
          color: #3b82f6;
        }

        .kpi-breakdown .scheduled {
          color: var(--text-secondary);
        }

        .kpi-breakdown .delayed {
          color: #ef4444;
        }

        .kpi-breakdown .warning {
          color: #f59e0b;
        }

        .kpi-breakdown .danger {
          color: #ef4444;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .dashboard-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1200px) {
          .dashboard-grid-3 {
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

        .occupancy,
        .efficiency {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--primary);
        }

        .alert-count {
          background: var(--danger);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .zones-grid {
          padding: 1rem;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .zone-item {
          padding: 0.75rem;
          border-radius: 0.5rem;
          background: var(--bg-secondary);
        }

        .zone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .zone-code {
          font-weight: 700;
          font-size: 1rem;
        }

        .zone-item.zone-f .zone-code { color: #3b82f6; }
        .zone-item.zone-s .zone-code { color: #f59e0b; }
        .zone-item.zone-c .zone-code { color: #06b6d4; }
        .zone-item.zone-q .zone-code { color: #8b5cf6; }

        .zone-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .zone-fill-bar {
          height: 6px;
          background: var(--bg-primary);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .zone-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s;
        }

        .zone-item.zone-f .zone-fill { background: #3b82f6; }
        .zone-item.zone-s .zone-fill { background: #f59e0b; }
        .zone-item.zone-c .zone-fill { background: #06b6d4; }
        .zone-item.zone-q .zone-fill { background: #8b5cf6; }

        .zone-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .zone-percent {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .zone-temp {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .zones-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .team-list {
          padding: 1rem;
        }

        .team-member {
          padding: 0.75rem;
          border-radius: 0.5rem;
          background: var(--bg-secondary);
          margin-bottom: 0.5rem;
        }

        .team-member:last-child {
          margin-bottom: 0;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .member-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .member-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .member-task {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .task-status {
          font-weight: 500;
        }

        .task-current {
          color: var(--text-secondary);
        }

        .member-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s;
        }

        .progress-value {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          min-width: 32px;
          text-align: right;
        }

        .alerts-list {
          padding: 1rem;
        }

        .alert-item {
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          border-left: 3px solid;
        }

        .alert-item:last-child {
          margin-bottom: 0;
        }

        .alert-item.danger {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        .alert-item.warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
        }

        .alert-item.info {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
        }

        .alert-message {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .alert-zone {
          font-size: 0.75rem;
          color: var(--text-secondary);
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

export default LogisticsDashboard;

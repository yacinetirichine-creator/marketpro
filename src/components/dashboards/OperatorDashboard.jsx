// ============================================
// MARKET PRO - Dashboard Logisticien / Opérateur
// Tâches quotidiennes picking et réception
// ============================================

import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Package, Truck, CheckCircle, Clock,
  Play, AlertTriangle, MapPin, Scan, RefreshCw,
  ArrowRight, Timer, Target, Award
} from 'lucide-react';

const OperatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        today: {
          tasksCompleted: 12,
          tasksTotal: 18,
          efficiency: 94,
          timeWorked: '5h 23min'
        },
        currentTask: {
          type: 'picking',
          id: 'PICK-2024-892',
          order: 'CMD-2024-456',
          client: 'Restaurant Le Gourmet',
          items: 8,
          itemsCompleted: 5,
          zone: 'F',
          startedAt: '10:15'
        },
        myPickings: [
          { id: 'PICK-892', client: 'Le Gourmet', items: 8, status: 'in_progress', priority: 'high' },
          { id: 'PICK-893', client: 'Bistrot Lyon', items: 12, status: 'pending', priority: 'normal' },
          { id: 'PICK-894', client: 'Café Place', items: 5, status: 'pending', priority: 'normal' }
        ],
        myReceptions: [
          { id: 'REC-456', supplier: 'Metro', items: 25, status: 'pending', eta: '14:00' },
          { id: 'REC-457', supplier: 'Sysco', items: 18, status: 'scheduled', eta: '16:30' }
        ],
        performance: {
          pickingRate: 8.5, // items/min
          accuracy: 99.2,
          onTime: 96.5
        },
        alerts: [
          { id: 1, message: 'Stock bas zone F-A-02: Saumon fumé', type: 'warning' },
          { id: 2, message: 'Livraison Metro en avance (13:45)', type: 'info' }
        ]
      });
      setLoading(false);
    }, 500);
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

  const progressPercent = Math.round((stats.today.tasksCompleted / stats.today.tasksTotal) * 100);

  return (
    <div className="role-dashboard operator-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><ClipboardList size={24} /> Mes Tâches</h2>
          <p>Bonjour ! Voici vos missions du jour</p>
        </div>
        <div className="header-stats">
          <div className="time-badge">
            <Clock size={16} />
            {stats.today.timeWorked}
          </div>
          <div className="efficiency-badge">
            <Award size={16} />
            {stats.today.efficiency}%
          </div>
        </div>
      </div>

      {/* Progression du jour */}
      <div className="day-progress-card">
        <div className="progress-header">
          <span className="progress-title">Progression du jour</span>
          <span className="progress-count">{stats.today.tasksCompleted}/{stats.today.tasksTotal} tâches</span>
        </div>
        <div className="progress-bar-large">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-footer">
          <span>{progressPercent}% complété</span>
          <span>{stats.today.tasksTotal - stats.today.tasksCompleted} restantes</span>
        </div>
      </div>

      {/* Tâche en cours */}
      {stats.currentTask && (
        <div className="current-task-card">
          <div className="task-badge active">
            <Play size={14} /> EN COURS
          </div>
          <div className="task-header">
            <span className="task-type">
              {stats.currentTask.type === 'picking' ? 'Picking' : 'Réception'}
            </span>
            <span className="task-id">{stats.currentTask.id}</span>
          </div>
          <div className="task-details">
            <div className="detail-row">
              <span className="label">Client:</span>
              <span className="value">{stats.currentTask.client}</span>
            </div>
            <div className="detail-row">
              <span className="label">Commande:</span>
              <span className="value">{stats.currentTask.order}</span>
            </div>
            <div className="detail-row">
              <span className="label">Zone:</span>
              <span className="value zone">
                <MapPin size={14} />
                Zone {stats.currentTask.zone}
              </span>
            </div>
          </div>
          <div className="task-progress">
            <div className="items-progress">
              <span>{stats.currentTask.itemsCompleted}/{stats.currentTask.items} articles</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(stats.currentTask.itemsCompleted / stats.currentTask.items) * 100}%` }}
                ></div>
              </div>
            </div>
            <button className="btn-continue">
              <Scan size={18} />
              Continuer
            </button>
          </div>
        </div>
      )}

      <div className="tasks-grid">
        {/* Mes pickings */}
        <div className="tasks-card">
          <div className="card-header">
            <h3><ClipboardList size={18} /> Mes Pickings</h3>
            <span className="task-count">{stats.myPickings.length}</span>
          </div>
          <div className="tasks-list">
            {stats.myPickings.map(picking => (
              <div key={picking.id} className={`task-item ${picking.status}`}>
                <div className="task-info">
                  <span className="task-id">{picking.id}</span>
                  <span className="task-client">{picking.client}</span>
                </div>
                <div className="task-meta">
                  <span className="items-count">{picking.items} articles</span>
                  {picking.priority === 'high' && (
                    <span className="priority high">Urgent</span>
                  )}
                </div>
                {picking.status === 'pending' && (
                  <button className="btn-start">
                    <Play size={14} />
                  </button>
                )}
                {picking.status === 'in_progress' && (
                  <span className="status-badge active">En cours</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mes réceptions */}
        <div className="tasks-card">
          <div className="card-header">
            <h3><Package size={18} /> Réceptions Prévues</h3>
            <span className="task-count">{stats.myReceptions.length}</span>
          </div>
          <div className="tasks-list">
            {stats.myReceptions.map(reception => (
              <div key={reception.id} className={`task-item ${reception.status}`}>
                <div className="task-info">
                  <span className="task-id">{reception.id}</span>
                  <span className="task-client">{reception.supplier}</span>
                </div>
                <div className="task-meta">
                  <span className="items-count">{reception.items} lignes</span>
                  <span className="eta">
                    <Clock size={12} />
                    {reception.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="performance-row">
        <div className="perf-card">
          <Timer size={20} />
          <div className="perf-content">
            <span className="perf-value">{stats.performance.pickingRate}</span>
            <span className="perf-label">articles/min</span>
          </div>
        </div>
        <div className="perf-card">
          <Target size={20} />
          <div className="perf-content">
            <span className="perf-value">{stats.performance.accuracy}%</span>
            <span className="perf-label">précision</span>
          </div>
        </div>
        <div className="perf-card">
          <CheckCircle size={20} />
          <div className="perf-content">
            <span className="perf-value">{stats.performance.onTime}%</span>
            <span className="perf-label">à l'heure</span>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {stats.alerts.length > 0 && (
        <div className="alerts-section">
          {stats.alerts.map(alert => (
            <div key={alert.id} className={`alert-banner ${alert.type}`}>
              <AlertTriangle size={16} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .operator-dashboard {
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

        .time-badge, .efficiency-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .time-badge {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .efficiency-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .day-progress-card {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          margin-bottom: 1rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .progress-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-count {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .progress-bar-large {
          height: 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar-large .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 6px;
          transition: width 0.3s;
        }

        .progress-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .current-task-card {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 0.75rem;
          padding: 1.5rem;
          color: white;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .task-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: rgba(255,255,255,0.2);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .task-header {
          margin-bottom: 1rem;
        }

        .task-type {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .task-id {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .task-details {
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-row .label {
          opacity: 0.7;
        }

        .detail-row .value {
          font-weight: 500;
        }

        .detail-row .value.zone {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .task-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .items-progress {
          flex: 1;
        }

        .items-progress span {
          display: block;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .items-progress .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .items-progress .progress-fill {
          height: 100%;
          background: white;
          border-radius: 3px;
        }

        .btn-continue {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: white;
          color: #3b82f6;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .tasks-grid {
            grid-template-columns: 1fr;
          }
        }

        .tasks-card {
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

        .task-count {
          background: var(--bg-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .tasks-list {
          padding: 0.5rem;
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

        .task-item:last-child {
          margin-bottom: 0;
        }

        .task-item.in_progress {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .task-info {
          flex: 1;
        }

        .task-info .task-id {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .task-info .task-client {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .items-count {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .priority.high {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 0.25rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .eta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--primary);
        }

        .btn-start {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .status-badge.active {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border-radius: 0.25rem;
          font-weight: 500;
        }

        .performance-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 640px) {
          .performance-row {
            grid-template-columns: 1fr;
          }
        }

        .perf-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
        }

        .perf-card svg {
          color: var(--primary);
        }

        .perf-content {
          display: flex;
          flex-direction: column;
        }

        .perf-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .perf-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .alerts-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .alert-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
        }

        .alert-banner.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .alert-banner.info {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
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

export default OperatorDashboard;

// ============================================
// MARKET PRO - Dashboard Responsable Comptable
// KPIs financiers et supervision comptabilité
// ============================================

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, FileText, CreditCard,
  AlertTriangle, Clock, CheckCircle, Users, Calendar,
  ArrowUpRight, ArrowDownRight, RefreshCw, PieChart,
  Wallet, Receipt, BarChart3, Target
} from 'lucide-react';

const AccountingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        revenue: {
          today: 18750,
          week: 87400,
          month: 342500,
          lastMonth: 315800,
          growth: 8.5,
          target: 400000,
          progress: 85.6
        },
        invoices: {
          unpaid: 45,
          unpaidAmount: 78450,
          overdue: 12,
          overdueAmount: 24300,
          issuedToday: 8,
          paidToday: 15
        },
        payments: {
          pending: 23,
          pendingAmount: 34500,
          toValidate: 5,
          receivedToday: 28750,
          refundsToProcess: 2
        },
        cashFlow: {
          balance: 156780,
          inflow: 42500,
          outflow: 28300,
          net: 14200
        },
        margins: {
          gross: 32.5,
          net: 18.2,
          trend: 1.2
        },
        clientBalance: {
          totalCredit: 125000,
          usedCredit: 89500,
          topDebtors: [
            { name: 'Restaurant Le Gourmet', amount: 12450, days: 45 },
            { name: 'Bistrot Lyonnais', amount: 8900, days: 32 },
            { name: 'Café de la Place', amount: 6200, days: 28 },
            { name: 'La Table du Chef', amount: 4850, days: 15 }
          ]
        },
        team: {
          comptables: [
            { name: 'Claire D.', tasks: 45, validated: 38 },
            { name: 'Marc T.', tasks: 32, validated: 29 }
          ]
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
    <div className="role-dashboard accounting-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><Wallet size={24} /> Comptabilité</h2>
          <p>Supervision financière</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge primary">
            <Calendar size={16} />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card revenue">
          <div className="kpi-header">
            <DollarSign size={20} />
            <span className={`kpi-trend ${stats.revenue.growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.revenue.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(stats.revenue.growth)}%
            </span>
          </div>
          <div className="kpi-value">{formatCurrency(stats.revenue.month)}</div>
          <div className="kpi-label">CA du mois</div>
          <div className="kpi-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.revenue.progress}%` }}></div>
            </div>
            <span className="progress-text">{stats.revenue.progress}% objectif</span>
          </div>
        </div>

        <div className="kpi-card invoices">
          <div className="kpi-header">
            <FileText size={20} />
            {stats.invoices.overdue > 0 && (
              <span className="kpi-alert">
                <AlertTriangle size={14} />
                {stats.invoices.overdue} en retard
              </span>
            )}
          </div>
          <div className="kpi-value">{formatCurrency(stats.invoices.unpaidAmount)}</div>
          <div className="kpi-label">Factures impayées ({stats.invoices.unpaid})</div>
          <div className="kpi-breakdown">
            <span className="danger">{formatCurrency(stats.invoices.overdueAmount)} en retard</span>
          </div>
        </div>

        <div className="kpi-card payments">
          <div className="kpi-header">
            <CreditCard size={20} />
            <span className="kpi-today">+{formatCurrency(stats.payments.receivedToday)}</span>
          </div>
          <div className="kpi-value">{stats.payments.pending}</div>
          <div className="kpi-label">Paiements en attente</div>
          <div className="kpi-breakdown">
            <span className="pending">{stats.payments.toValidate} à valider</span>
            <span className="amount">{formatCurrency(stats.payments.pendingAmount)}</span>
          </div>
        </div>

        <div className="kpi-card cashflow">
          <div className="kpi-header">
            <TrendingUp size={20} />
            <span className={`kpi-net ${stats.cashFlow.net >= 0 ? 'positive' : 'negative'}`}>
              {stats.cashFlow.net >= 0 ? '+' : ''}{formatCurrency(stats.cashFlow.net)}
            </span>
          </div>
          <div className="kpi-value">{formatCurrency(stats.cashFlow.balance)}</div>
          <div className="kpi-label">Trésorerie</div>
          <div className="kpi-flow">
            <span className="inflow">
              <ArrowUpRight size={12} /> {formatCurrency(stats.cashFlow.inflow)}
            </span>
            <span className="outflow">
              <ArrowDownRight size={12} /> {formatCurrency(stats.cashFlow.outflow)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Créances clients */}
        <div className="dashboard-card debtors-card">
          <div className="card-header">
            <h3><Users size={18} /> Top Créances Clients</h3>
            <span className="total-credit">{formatCurrency(stats.clientBalance.usedCredit)} / {formatCurrency(stats.clientBalance.totalCredit)}</span>
          </div>
          <div className="debtors-list">
            {stats.clientBalance.topDebtors.map((debtor, index) => (
              <div key={index} className="debtor-item">
                <div className="debtor-info">
                  <span className="debtor-rank">#{index + 1}</span>
                  <span className="debtor-name">{debtor.name}</span>
                </div>
                <div className="debtor-details">
                  <span className="debtor-amount">{formatCurrency(debtor.amount)}</span>
                  <span className={`debtor-days ${debtor.days > 30 ? 'overdue' : ''}`}>
                    {debtor.days} jours
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marges et performance */}
        <div className="dashboard-card margins-card">
          <div className="card-header">
            <h3><PieChart size={18} /> Marges & Performance</h3>
          </div>
          <div className="margins-content">
            <div className="margin-item">
              <div className="margin-label">Marge brute</div>
              <div className="margin-value">
                <span className="value">{stats.margins.gross}%</span>
                <div className="margin-bar">
                  <div className="margin-fill gross" style={{ width: `${stats.margins.gross}%` }}></div>
                </div>
              </div>
            </div>
            <div className="margin-item">
              <div className="margin-label">Marge nette</div>
              <div className="margin-value">
                <span className="value">{stats.margins.net}%</span>
                <div className="margin-bar">
                  <div className="margin-fill net" style={{ width: `${stats.margins.net * 2}%` }}></div>
                </div>
              </div>
            </div>
            <div className="margin-trend">
              <span className={`trend ${stats.margins.trend >= 0 ? 'positive' : 'negative'}`}>
                {stats.margins.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {stats.margins.trend >= 0 ? '+' : ''}{stats.margins.trend}% vs mois dernier
              </span>
            </div>

            <div className="daily-stats">
              <div className="daily-stat">
                <Receipt size={16} />
                <span className="stat-label">Factures émises</span>
                <span className="stat-value">{stats.invoices.issuedToday}</span>
              </div>
              <div className="daily-stat">
                <CheckCircle size={16} />
                <span className="stat-label">Paiements reçus</span>
                <span className="stat-value">{stats.invoices.paidToday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Équipe comptable */}
      <div className="team-row">
        <h3><Users size={18} /> Performance Équipe</h3>
        <div className="team-stats">
          {stats.team.comptables.map((member, index) => (
            <div key={index} className="team-member-card">
              <div className="member-avatar">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="member-info">
                <span className="member-name">{member.name}</span>
                <span className="member-stats">{member.validated}/{member.tasks} validées</span>
              </div>
              <div className="member-progress">
                <div className="progress-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--bg-secondary)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${(member.validated / member.tasks) * 100}, 100`}
                    />
                  </svg>
                  <span className="progress-percent">{Math.round((member.validated / member.tasks) * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .accounting-dashboard {
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

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .stat-badge.primary {
          background: var(--bg-secondary);
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

        .kpi-trend.positive { color: #10b981; }
        .kpi-trend.negative { color: #ef4444; }

        .kpi-alert {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #ef4444;
          font-size: 0.75rem;
        }

        .kpi-today {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 500;
        }

        .kpi-net {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .kpi-net.positive { color: #10b981; }
        .kpi-net.negative { color: #ef4444; }

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
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          border-radius: 3px;
        }

        .progress-text {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .kpi-breakdown {
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        .kpi-breakdown .danger {
          color: #ef4444;
        }

        .kpi-breakdown .pending {
          color: #f59e0b;
          margin-right: 0.5rem;
        }

        .kpi-breakdown .amount {
          color: var(--text-secondary);
        }

        .kpi-flow {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        .kpi-flow .inflow {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
        }

        .kpi-flow .outflow {
          display: flex;
          align-items: center;
          gap: 0.25rem;
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

        .total-credit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .debtors-list {
          padding: 1rem;
        }

        .debtor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          background: var(--bg-secondary);
          margin-bottom: 0.5rem;
        }

        .debtor-item:last-child {
          margin-bottom: 0;
        }

        .debtor-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .debtor-rank {
          font-weight: 700;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .debtor-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .debtor-details {
          text-align: right;
        }

        .debtor-amount {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .debtor-days {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .debtor-days.overdue {
          color: #ef4444;
        }

        .margins-content {
          padding: 1rem;
        }

        .margin-item {
          margin-bottom: 1rem;
        }

        .margin-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .margin-value {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .margin-value .value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          min-width: 60px;
        }

        .margin-bar {
          flex: 1;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .margin-fill {
          height: 100%;
          border-radius: 4px;
        }

        .margin-fill.gross {
          background: linear-gradient(90deg, #10b981, #34d399);
        }

        .margin-fill.net {
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .margin-trend {
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .margin-trend .trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .margin-trend .trend.positive { color: #10b981; }
        .margin-trend .trend.negative { color: #ef4444; }

        .daily-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .daily-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .daily-stat svg {
          color: var(--text-secondary);
        }

        .daily-stat .stat-label {
          flex: 1;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .daily-stat .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .team-row {
          background: var(--bg-primary);
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          padding: 1.25rem;
        }

        .team-row h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        .team-stats {
          display: flex;
          gap: 1rem;
        }

        .team-member-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .member-info {
          flex: 1;
        }

        .member-name {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
        }

        .member-stats {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .progress-ring {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .progress-ring svg {
          transform: rotate(-90deg);
        }

        .progress-percent {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
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

export default AccountingDashboard;

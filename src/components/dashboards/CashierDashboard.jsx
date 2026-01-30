// ============================================
// MARKET PRO - Dashboard Caissier
// Transactions et caisse du jour
// ============================================

import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, Banknote, Receipt, ShoppingCart,
  Clock, CheckCircle, RefreshCw, Scan, Calculator,
  TrendingUp, Users, ArrowUpRight, Wallet
} from 'lucide-react';

const CashierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        today: {
          sales: 12450,
          transactions: 47,
          avgTicket: 265,
          refunds: 2,
          refundAmount: 156
        },
        cashRegister: {
          opening: 500,
          cash: 4850,
          card: 7600,
          other: 0,
          expected: 12950,
          difference: 0
        },
        paymentMethods: [
          { type: 'cash', label: 'Espèces', amount: 4850, count: 18, percent: 39 },
          { type: 'card', label: 'Carte', amount: 7600, count: 28, percent: 61 },
          { type: 'check', label: 'Chèque', amount: 0, count: 0, percent: 0 },
          { type: 'transfer', label: 'Virement', amount: 0, count: 1, percent: 0 }
        ],
        recentTransactions: [
          { id: 'TRX-892', client: 'Le Gourmet', amount: 345, method: 'card', time: '11:45' },
          { id: 'TRX-891', client: 'Vente comptoir', amount: 89, method: 'cash', time: '11:32' },
          { id: 'TRX-890', client: 'Bistrot Lyon', amount: 567, method: 'card', time: '11:15' },
          { id: 'TRX-889', client: 'Vente comptoir', amount: 42, method: 'cash', time: '10:58' },
          { id: 'TRX-888', client: 'Café Place', amount: 234, method: 'card', time: '10:45' }
        ],
        quickActions: {
          pendingOrders: 3,
          unpaidInvoices: 5
        }
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
    <div className="role-dashboard cashier-dashboard">
      <div className="dashboard-header">
        <div className="header-info">
          <h2><Calculator size={24} /> Ma Caisse</h2>
          <p>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="header-actions">
          <button className="btn-action primary">
            <ShoppingCart size={18} />
            Nouvelle vente
          </button>
          <button className="btn-action secondary">
            <Scan size={18} />
            Scanner
          </button>
        </div>
      </div>

      {/* CA du jour */}
      <div className="main-stat-card">
        <div className="stat-content">
          <div className="stat-icon">
            <DollarSign size={32} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Chiffre d'affaires du jour</span>
            <span className="stat-value">{formatCurrency(stats.today.sales)}</span>
          </div>
        </div>
        <div className="stat-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">{stats.today.transactions} transactions</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Panier moyen: {formatCurrency(stats.today.avgTicket)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* État de la caisse */}
        <div className="dashboard-card cash-register-card">
          <div className="card-header">
            <h3><Wallet size={18} /> État de la caisse</h3>
            <span className={`balance-status ${stats.cashRegister.difference === 0 ? 'ok' : 'warning'}`}>
              {stats.cashRegister.difference === 0 ? (
                <><CheckCircle size={14} /> Équilibrée</>
              ) : (
                <>Écart: {formatCurrency(stats.cashRegister.difference)}</>
              )}
            </span>
          </div>
          <div className="cash-details">
            <div className="cash-row opening">
              <span className="cash-label">Fond de caisse</span>
              <span className="cash-amount">{formatCurrency(stats.cashRegister.opening)}</span>
            </div>
            <div className="cash-row">
              <span className="cash-label">
                <Banknote size={16} /> Espèces
              </span>
              <span className="cash-amount">{formatCurrency(stats.cashRegister.cash)}</span>
            </div>
            <div className="cash-row">
              <span className="cash-label">
                <CreditCard size={16} /> Carte bancaire
              </span>
              <span className="cash-amount">{formatCurrency(stats.cashRegister.card)}</span>
            </div>
            <div className="cash-row total">
              <span className="cash-label">Total attendu</span>
              <span className="cash-amount">{formatCurrency(stats.cashRegister.expected)}</span>
            </div>
          </div>
        </div>

        {/* Répartition paiements */}
        <div className="dashboard-card payments-card">
          <div className="card-header">
            <h3><CreditCard size={18} /> Modes de paiement</h3>
          </div>
          <div className="payments-list">
            {stats.paymentMethods.filter(p => p.count > 0).map(payment => (
              <div key={payment.type} className="payment-item">
                <div className="payment-info">
                  <span className={`payment-icon ${payment.type}`}>
                    {payment.type === 'cash' && <Banknote size={16} />}
                    {payment.type === 'card' && <CreditCard size={16} />}
                    {payment.type === 'check' && <Receipt size={16} />}
                    {payment.type === 'transfer' && <ArrowUpRight size={16} />}
                  </span>
                  <span className="payment-label">{payment.label}</span>
                </div>
                <div className="payment-stats">
                  <span className="payment-count">{payment.count}x</span>
                  <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="payment-bar">
                  <div className={`payment-fill ${payment.type}`} style={{ width: `${payment.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions récentes */}
        <div className="dashboard-card transactions-card full-width">
          <div className="card-header">
            <h3><Receipt size={18} /> Dernières transactions</h3>
            <button className="btn-link">Voir tout</button>
          </div>
          <div className="transactions-list">
            {stats.recentTransactions.map(trx => (
              <div key={trx.id} className="transaction-item">
                <div className="trx-info">
                  <span className="trx-id">{trx.id}</span>
                  <span className="trx-client">{trx.client}</span>
                </div>
                <div className="trx-method">
                  <span className={`method-badge ${trx.method}`}>
                    {trx.method === 'cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                    {trx.method === 'cash' ? 'Espèces' : 'Carte'}
                  </span>
                </div>
                <div className="trx-amount">{formatCurrency(trx.amount)}</div>
                <div className="trx-time">{trx.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="quick-stats">
        <div className="quick-stat-card">
          <Users size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.quickActions.pendingOrders}</span>
            <span className="stat-label">Commandes en attente</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <Receipt size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.quickActions.unpaidInvoices}</span>
            <span className="stat-label">Factures à encaisser</span>
          </div>
        </div>
        <div className="quick-stat-card refunds">
          <TrendingUp size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.today.refunds}</span>
            <span className="stat-label">Remboursements ({formatCurrency(stats.today.refundAmount)})</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cashier-dashboard {
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
          text-transform: capitalize;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .btn-action.primary {
          background: var(--primary);
          color: white;
        }

        .btn-action.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .main-stat-card {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 0.75rem;
          padding: 1.5rem;
          color: white;
          margin-bottom: 1.5rem;
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.2);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details {
          flex: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-breakdown {
          display: flex;
          gap: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
        }

        .breakdown-item {
          font-size: 0.875rem;
          opacity: 0.9;
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

        .balance-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .balance-status.ok {
          color: #10b981;
        }

        .balance-status.warning {
          color: #f59e0b;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .cash-details {
          padding: 1rem;
        }

        .cash-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .cash-row:last-child {
          margin-bottom: 0;
        }

        .cash-row.opening {
          background: var(--bg-secondary);
        }

        .cash-row.total {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .cash-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .cash-amount {
          font-weight: 600;
          color: var(--text-primary);
        }

        .payments-list {
          padding: 1rem;
        }

        .payment-item {
          margin-bottom: 1rem;
        }

        .payment-item:last-child {
          margin-bottom: 0;
        }

        .payment-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .payment-icon {
          width: 28px;
          height: 28px;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-icon.cash {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .payment-icon.card {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .payment-label {
          flex: 1;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .payment-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .payment-count {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .payment-amount {
          font-weight: 600;
          color: var(--text-primary);
        }

        .payment-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }

        .payment-fill {
          height: 100%;
          border-radius: 3px;
        }

        .payment-fill.cash {
          background: #10b981;
        }

        .payment-fill.card {
          background: #3b82f6;
        }

        .transactions-list {
          padding: 0.5rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .transaction-item:hover {
          background: var(--bg-secondary);
        }

        .trx-info {
          flex: 1;
        }

        .trx-id {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .trx-client {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .method-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .method-badge.cash {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .method-badge.card {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .trx-amount {
          font-weight: 600;
          color: var(--text-primary);
          min-width: 80px;
          text-align: right;
        }

        .trx-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          min-width: 50px;
          text-align: right;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .quick-stats {
            grid-template-columns: 1fr;
          }
        }

        .quick-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
        }

        .quick-stat-card svg {
          color: var(--primary);
        }

        .quick-stat-card.refunds svg {
          color: #f59e0b;
        }

        .quick-stat-card .stat-content {
          flex-direction: column;
          align-items: flex-start;
          margin: 0;
        }

        .quick-stat-card .stat-value {
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .quick-stat-card .stat-label {
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

export default CashierDashboard;

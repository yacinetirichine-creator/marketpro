import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Plus, Filter, Download, Eye, Edit, Trash2,
  Printer, Send, Clock, CheckCircle, AlertCircle, Calendar,
  CreditCard, DollarSign, TrendingUp, ArrowRight, Mail
} from 'lucide-react';
import {
  Card, SearchInput, FilterPills, Tabs, Table, StatusBadge,
  Modal, Button, Input, Select, Alert, ProgressBar, Avatar,
  ActionButtons, DateInput
} from './ui';
import { useFormatters } from '../hooks';
import { invoices, clients } from '../data/mockData';

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { formatCurrency, formatDate, formatNumber } = useFormatters();

  // Stats
  const stats = useMemo(() => ({
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    partial: invoices.filter(i => i.status === 'partial').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0)
  }), []);

  // Filtrage
  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchSearch = !searchQuery ||
        i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = activeTab === 'all' || i.status === activeTab;
      const matchDateFrom = !dateFrom || new Date(i.date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(i.date) <= new Date(dateTo);
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [searchQuery, activeTab, dateFrom, dateTo]);

  const tabs = [
    { id: 'all', label: 'Toutes', count: stats.total },
    { id: 'pending', label: 'En attente', icon: Clock, count: stats.pending },
    { id: 'partial', label: 'Partielles', icon: CreditCard, count: stats.partial },
    { id: 'overdue', label: 'En retard', icon: AlertCircle, count: stats.overdue },
    { id: 'paid', label: 'Payées', icon: CheckCircle, count: stats.paid },
  ];

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'N° Facture',
      render: (val) => <span className="invoice-number">{val}</span>
    },
    {
      key: 'clientName',
      label: 'Client',
      render: (val, row) => (
        <div className="client-cell">
          <Avatar name={val} size="sm" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date émission',
      render: (val) => formatDate(val)
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      render: (val, row) => {
        const isOverdue = row.status === 'overdue';
        const daysLeft = Math.ceil((new Date(val) - new Date()) / (1000 * 60 * 60 * 24));
        return (
          <div className="due-date-cell">
            <span className={isOverdue ? 'overdue' : daysLeft <= 7 ? 'warning' : ''}>
              {formatDate(val)}
            </span>
            {isOverdue && <span className="overdue-badge">En retard</span>}
            {!isOverdue && daysLeft <= 7 && daysLeft > 0 && (
              <span className="days-left">{daysLeft}j restants</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'total',
      label: 'Montant TTC',
      align: 'right',
      render: (val) => <span className="amount">{formatCurrency(val)}</span>
    },
    {
      key: 'paidAmount',
      label: 'Payé',
      align: 'right',
      render: (val, row) => (
        <div className="paid-cell">
          <span className="paid-amount">{formatCurrency(val || 0)}</span>
          {row.status === 'partial' && (
            <ProgressBar 
              value={val || 0} 
              max={row.total}
              size="sm"
              color="warning"
            />
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: '',
      width: '140px',
      render: (_, row) => (
        <ActionButtons
          row={row}
          actions={[
            { icon: Eye, label: 'Voir', onClick: (r) => setSelectedInvoice(r) },
            { icon: Printer, label: 'Imprimer', onClick: () => {} },
            { icon: Send, label: 'Envoyer', onClick: () => {} },
            ...(row.status !== 'paid' ? [
              { icon: CreditCard, label: 'Encaisser', onClick: (r) => { setSelectedInvoice(r); setShowPaymentModal(true); } }
            ] : [])
          ]}
        />
      )
    }
  ];

  return (
    <div className="invoices-page">
      {/* KPIs */}
      <div className="quick-stats">
        <div className="quick-stat primary">
          <FileText size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
            <span className="stat-label">Total facturé</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <Clock size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.pendingAmount)}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="quick-stat danger">
          <AlertCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.overdueAmount)}</span>
            <span className="stat-label">En retard</span>
          </div>
        </div>
        <div className="quick-stat success">
          <CheckCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.paid}</span>
            <span className="stat-label">Payées ce mois</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Liste */}
      <Card>
        <div className="filters-bar">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par n° ou client..."
          />
          <DateInput
            value={dateFrom}
            onChange={setDateFrom}
            label="Du"
          />
          <DateInput
            value={dateTo}
            onChange={setDateTo}
            label="Au"
          />
          <div className="filter-actions">
            <Button variant="ghost" icon={Download}>Exporter</Button>
            <Button variant="ghost" icon={Printer}>Imprimer liste</Button>
            <Button variant="primary" icon={Plus}>
              Nouvelle facture
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
          onRowClick={setSelectedInvoice}
          emptyMessage="Aucune facture trouvée"
        />
      </Card>

      {/* Modal détail facture */}
      <Modal
        isOpen={!!selectedInvoice && !showPaymentModal}
        onClose={() => setSelectedInvoice(null)}
        title={`Facture ${selectedInvoice?.invoiceNumber}`}
        size="lg"
        footer={
          selectedInvoice && selectedInvoice.status !== 'paid' && (
            <div className="modal-footer-actions">
              <Button variant="ghost" icon={Mail}>
                Envoyer par email
              </Button>
              <Button variant="ghost" icon={Printer}>
                Imprimer
              </Button>
              <Button variant="primary" icon={CreditCard} onClick={() => setShowPaymentModal(true)}>
                Encaisser
              </Button>
            </div>
          )
        }
      >
        {selectedInvoice && (
          <div className="invoice-detail">
            {/* En-tête */}
            <div className="invoice-header">
              <div className="invoice-status">
                <StatusBadge status={selectedInvoice.status} size="lg" />
              </div>
              <div className="invoice-dates">
                <div>
                  <span className="label">Date émission</span>
                  <span className="value">{formatDate(selectedInvoice.date)}</span>
                </div>
                <div>
                  <span className="label">Date échéance</span>
                  <span className="value">{formatDate(selectedInvoice.dueDate)}</span>
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="detail-section">
              <h4>Client</h4>
              <div className="client-info">
                <Avatar name={selectedInvoice.clientName} size="lg" />
                <div>
                  <span className="client-name">{selectedInvoice.clientName}</span>
                  <span className="client-address">123 Rue du Commerce, 75001 Paris</span>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="detail-section">
              <h4>Détail facture</h4>
              <table className="invoice-lines">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qté</th>
                    <th>Prix unit. HT</th>
                    <th>Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.lines || [
                    { description: 'Filet de bœuf', quantity: 10, unit: 'kg', unitPrice: 28.50 },
                    { description: 'Saumon frais', quantity: 5, unit: 'kg', unitPrice: 18.90 },
                    { description: 'Comté AOP', quantity: 3, unit: 'kg', unitPrice: 22.00 },
                  ]).map((line, idx) => (
                    <tr key={idx}>
                      <td>{line.description}</td>
                      <td>{line.quantity} {line.unit}</td>
                      <td>{formatCurrency(line.unitPrice)}</td>
                      <td>{formatCurrency(line.quantity * line.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="invoice-totals">
              <div className="total-line">
                <span>Sous-total HT</span>
                <span>{formatCurrency(selectedInvoice.total * 0.8)}</span>
              </div>
              <div className="total-line">
                <span>TVA (20%)</span>
                <span>{formatCurrency(selectedInvoice.total * 0.2)}</span>
              </div>
              <div className="total-line grand-total">
                <span>Total TTC</span>
                <span>{formatCurrency(selectedInvoice.total)}</span>
              </div>
              {selectedInvoice.paidAmount > 0 && (
                <>
                  <div className="total-line paid">
                    <span>Déjà payé</span>
                    <span>- {formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="total-line remaining">
                    <span>Reste à payer</span>
                    <span>{formatCurrency(selectedInvoice.total - selectedInvoice.paidAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Historique paiements */}
            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <div className="detail-section">
                <h4>Historique des paiements</h4>
                <div className="payments-history">
                  {selectedInvoice.payments.map((payment, idx) => (
                    <div key={idx} className="payment-item">
                      <div className="payment-info">
                        <span className="payment-date">{formatDate(payment.date)}</span>
                        <span className="payment-method">{payment.method}</span>
                      </div>
                      <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal encaissement */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Enregistrer un règlement"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" icon={CheckCircle}>
              Valider le règlement
            </Button>
          </>
        }
      >
        {selectedInvoice && (
          <div className="payment-form">
            <div className="payment-summary">
              <div className="summary-row">
                <span>Facture</span>
                <span className="value">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="summary-row">
                <span>Montant total</span>
                <span className="value">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="summary-row">
                <span>Déjà payé</span>
                <span className="value">{formatCurrency(selectedInvoice.paidAmount || 0)}</span>
              </div>
              <div className="summary-row highlight">
                <span>Reste à payer</span>
                <span className="value">{formatCurrency(selectedInvoice.total - (selectedInvoice.paidAmount || 0))}</span>
              </div>
            </div>

            <div className="form-group">
              <Input 
                label="Montant du règlement"
                type="number"
                placeholder={`${selectedInvoice.total - (selectedInvoice.paidAmount || 0)}`}
              />
            </div>

            <div className="form-group">
              <Select
                label="Mode de paiement"
                options={[
                  { value: 'virement', label: 'Virement bancaire' },
                  { value: 'cheque', label: 'Chèque' },
                  { value: 'especes', label: 'Espèces' },
                  { value: 'cb', label: 'Carte bancaire' },
                  { value: 'prelevement', label: 'Prélèvement' },
                ]}
                placeholder="Sélectionner..."
              />
            </div>

            <div className="form-group">
              <DateInput
                label="Date du règlement"
                value={new Date().toISOString().split('T')[0]}
                onChange={() => {}}
              />
            </div>

            <div className="form-group">
              <Input
                label="Référence"
                placeholder="N° chèque, virement..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;

import React, { useState, useMemo } from 'react';
import {
  CreditCard, Search, Plus, Filter, Download, Eye, Edit,
  CheckCircle, Clock, AlertCircle, DollarSign, TrendingUp,
  Calendar, User, FileText, Printer, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Card, SearchInput, FilterPills, Tabs, Table, StatusBadge,
  Modal, Button, Input, Select, DateInput, Avatar, ActionButtons
} from './ui';
import { useFormatters } from '../hooks';
import { clients, invoices } from '../data/mockData';

// Générer des données de règlements
const generatePayments = () => {
  const payments = [];
  const methods = ['Virement', 'Chèque', 'Espèces', 'CB', 'Prélèvement'];
  const statuses = ['validated', 'pending', 'cancelled'];
  
  for (let i = 1; i <= 20; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const invoice = invoices[Math.floor(Math.random() * invoices.length)];
    const status = statuses[Math.floor(Math.random() * 10) < 8 ? 0 : Math.floor(Math.random() * 3)];
    
    payments.push({
      id: `PAY-${String(i).padStart(4, '0')}`,
      reference: `REG-2024-${String(i).padStart(4, '0')}`,
      date: new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString(),
      clientId: client.id,
      clientName: client.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: Math.floor(Math.random() * 5000) + 500,
      method: methods[Math.floor(Math.random() * methods.length)],
      status,
      bankReference: status === 'validated' ? `BNK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null
    });
  }
  return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const payments = generatePayments();

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const { formatCurrency, formatDate } = useFormatters();

  // Stats
  const stats = useMemo(() => ({
    total: payments.length,
    validated: payments.filter(p => p.status === 'validated').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments.filter(p => p.status === 'validated').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    todayAmount: payments.filter(p => {
      const today = new Date().toDateString();
      return new Date(p.date).toDateString() === today && p.status === 'validated';
    }).reduce((sum, p) => sum + p.amount, 0)
  }), []);

  // Filtrage
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !searchQuery ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = activeTab === 'all' || p.status === activeTab;
      const matchMethod = !methodFilter || p.method === methodFilter;
      const matchDateFrom = !dateFrom || new Date(p.date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(p.date) <= new Date(dateTo);
      return matchSearch && matchStatus && matchMethod && matchDateFrom && matchDateTo;
    });
  }, [searchQuery, activeTab, methodFilter, dateFrom, dateTo]);

  // Par mode de paiement
  const byMethod = useMemo(() => {
    const grouped = {};
    payments.filter(p => p.status === 'validated').forEach(p => {
      if (!grouped[p.method]) grouped[p.method] = { count: 0, total: 0 };
      grouped[p.method].count++;
      grouped[p.method].total += p.amount;
    });
    return grouped;
  }, []);

  const tabs = [
    { id: 'all', label: 'Tous', count: stats.total },
    { id: 'validated', label: 'Validés', icon: CheckCircle, count: stats.validated },
    { id: 'pending', label: 'En attente', icon: Clock, count: stats.pending },
  ];

  const methodOptions = [
    { value: null, label: 'Tous les modes' },
    { value: 'Virement', label: 'Virement' },
    { value: 'Chèque', label: 'Chèque' },
    { value: 'Espèces', label: 'Espèces' },
    { value: 'CB', label: 'Carte bancaire' },
    { value: 'Prélèvement', label: 'Prélèvement' },
  ];

  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      render: (val) => <span className="payment-ref">{val}</span>
    },
    {
      key: 'date',
      label: 'Date',
      render: (val) => formatDate(val)
    },
    {
      key: 'clientName',
      label: 'Client',
      render: (val) => (
        <div className="client-cell">
          <Avatar name={val} size="sm" />
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'invoiceNumber',
      label: 'Facture',
      render: (val) => <span className="invoice-link">{val}</span>
    },
    {
      key: 'method',
      label: 'Mode',
      render: (val) => <span className="method-badge">{val}</span>
    },
    {
      key: 'amount',
      label: 'Montant',
      align: 'right',
      render: (val) => <span className="amount">{formatCurrency(val)}</span>
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <ActionButtons
          row={row}
          actions={[
            { icon: Eye, label: 'Voir', onClick: (r) => setSelectedPayment(r) },
            { icon: Printer, label: 'Imprimer', onClick: () => {} },
          ]}
        />
      )
    }
  ];

  return (
    <div className="payments-page">
      {/* KPIs */}
      <div className="quick-stats">
        <div className="quick-stat primary">
          <CreditCard size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
            <span className="stat-label">Total encaissé</span>
          </div>
        </div>
        <div className="quick-stat success">
          <CheckCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.validated}</span>
            <span className="stat-label">Règlements validés</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <Clock size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.pendingAmount)}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="quick-stat secondary">
          <TrendingUp size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.todayAmount)}</span>
            <span className="stat-label">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Répartition par mode */}
      <Card title="Répartition par mode de paiement">
        <div className="methods-grid">
          {Object.entries(byMethod).map(([method, data]) => (
            <div key={method} className="method-card">
              <span className="method-name">{method}</span>
              <span className="method-count">{data.count} règlements</span>
              <span className="method-total">{formatCurrency(data.total)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Liste */}
      <Card>
        <div className="filters-bar">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par référence, client, facture..."
          />
          <Select
            value={methodFilter || ''}
            onChange={(v) => setMethodFilter(v || null)}
            options={methodOptions}
          />
          <DateInput value={dateFrom} onChange={setDateFrom} label="Du" />
          <DateInput value={dateTo} onChange={setDateTo} label="Au" />
          <div className="filter-actions">
            <Button variant="ghost" icon={Download}>Exporter</Button>
            <Button variant="ghost" icon={Printer}>Imprimer liste</Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowNewPaymentModal(true)}>
              Nouveau règlement
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredPayments}
          onRowClick={setSelectedPayment}
          emptyMessage="Aucun règlement trouvé"
        />
      </Card>

      {/* Modal détail */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title={`Règlement ${selectedPayment?.reference}`}
        size="md"
      >
        {selectedPayment && (
          <div className="payment-detail">
            <div className="detail-header">
              <StatusBadge status={selectedPayment.status} size="lg" />
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Date</span>
                <span className="value">{formatDate(selectedPayment.date)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Montant</span>
                <span className="value highlight">{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Mode de paiement</span>
                <span className="value">{selectedPayment.method}</span>
              </div>
              <div className="detail-item">
                <span className="label">Client</span>
                <span className="value">{selectedPayment.clientName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Facture</span>
                <span className="value">{selectedPayment.invoiceNumber}</span>
              </div>
              {selectedPayment.bankReference && (
                <div className="detail-item">
                  <span className="label">Réf. bancaire</span>
                  <span className="value">{selectedPayment.bankReference}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal nouveau règlement */}
      <Modal
        isOpen={showNewPaymentModal}
        onClose={() => setShowNewPaymentModal(false)}
        title="Nouveau règlement"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewPaymentModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" icon={CheckCircle}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="payment-form">
          <Select
            label="Client"
            options={clients.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Sélectionner un client..."
          />
          <Select
            label="Facture"
            options={invoices.map(i => ({ value: i.id, label: `${i.invoiceNumber} - ${formatCurrency(i.total)}` }))}
            placeholder="Sélectionner une facture..."
          />
          <Input label="Montant" type="number" placeholder="0.00" />
          <Select
            label="Mode de paiement"
            options={methodOptions.filter(m => m.value)}
            placeholder="Sélectionner..."
          />
          <DateInput label="Date du règlement" value={new Date().toISOString().split('T')[0]} onChange={() => {}} />
          <Input label="Référence" placeholder="N° chèque, virement..." />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsPage;

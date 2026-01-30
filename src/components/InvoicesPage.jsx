import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Plus, Download, Eye, Printer, Send, Clock,
  CheckCircle, AlertCircle, CreditCard, TrendingUp, Calendar,
  X, ArrowRight, RefreshCw, Mail, Phone, MapPin, Building, Euro,
  RotateCcw, FileX, History, Filter, ChevronDown, AlertTriangle
} from 'lucide-react';
import { invoices as initialInvoices, clients, orders, products, payments as initialPayments } from '../data/mockData';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showAgingReport, setShowAgingReport] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'virement', date: new Date().toISOString().split('T')[0], reference: '' });

  // Formatters
  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '-';

  // Get client by ID
  const getClient = (clientId) => clients.find(c => c.id === clientId);

  // Get order by ID
  const getOrder = (orderId) => orders.find(o => o.id === orderId);

  // Calculate days overdue
  const getDaysOverdue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Aging buckets
  const getAgingBucket = (daysOverdue) => {
    if (daysOverdue === 0) return 'current';
    if (daysOverdue <= 30) return '1-30';
    if (daysOverdue <= 60) return '31-60';
    if (daysOverdue <= 90) return '61-90';
    return '90+';
  };

  // Stats
  const stats = useMemo(() => {
    const unpaidInvoices = invoices.filter(i => i.status !== 'paid');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');

    // Aging analysis
    const aging = {
      current: { count: 0, amount: 0 },
      '1-30': { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '90+': { count: 0, amount: 0 }
    };

    unpaidInvoices.forEach(inv => {
      const daysOverdue = getDaysOverdue(inv.dueDate);
      const bucket = getAgingBucket(daysOverdue);
      const remaining = inv.remainingAmount || (inv.total - (inv.paidAmount || 0));
      aging[bucket].count++;
      aging[bucket].amount += remaining;
    });

    return {
      total: invoices.length,
      pending: invoices.filter(i => i.status === 'pending').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: overdueInvoices.length,
      partial: invoices.filter(i => i.status === 'partial').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
      pendingAmount: unpaidInvoices.reduce((sum, i) => sum + (i.remainingAmount || (i.total - (i.paidAmount || 0))), 0),
      overdueAmount: overdueInvoices.reduce((sum, i) => sum + (i.remainingAmount || (i.total - (i.paidAmount || 0))), 0),
      aging
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const client = getClient(inv.clientId);
      const matchSearch = !searchQuery ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = activeTab === 'all' || inv.status === activeTab;
      const matchDateFrom = !dateFrom || new Date(inv.date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(inv.date) <= new Date(dateTo);

      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [invoices, searchQuery, activeTab, dateFrom, dateTo]);

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingThisYear = invoices.filter(i => i.id.includes(year.toString()));
    const nextNumber = existingThisYear.length + 1;
    return `FAC-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Generate credit note number
  const generateCreditNoteNumber = () => {
    const year = new Date().getFullYear();
    const existingCreditNotes = invoices.filter(i => i.id.includes('AVO'));
    const nextNumber = existingCreditNotes.length + 1;
    return `AVO-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Create invoice from order
  const createInvoiceFromOrder = (order) => {
    const client = getClient(order.clientId);
    const newInvoice = {
      id: generateInvoiceNumber(),
      orderId: order.id,
      clientId: order.clientId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + (client?.paymentDelay || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      items: order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          description: product?.name || 'Produit',
          quantity: item.quantity,
          unit: product?.unit || 'unité',
          unitPrice: item.unitPrice,
          total: item.total
        };
      }),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paidAmount: 0,
      remainingAmount: order.total
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  // Create credit note
  const createCreditNote = (originalInvoice, amount, reason) => {
    const creditNote = {
      id: generateCreditNoteNumber(),
      type: 'credit_note',
      originalInvoiceId: originalInvoice.id,
      clientId: originalInvoice.clientId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      reason: reason,
      subtotal: -amount * 0.8333,
      tax: -amount * 0.1667,
      total: -amount,
      paidAmount: -amount,
      remainingAmount: 0
    };

    // Update original invoice
    setInvoices(prev => prev.map(inv =>
      inv.id === originalInvoice.id
        ? { ...inv, remainingAmount: inv.remainingAmount - amount, creditNoteId: creditNote.id }
        : inv
    ));

    setInvoices(prev => [creditNote, ...prev]);
    return creditNote;
  };

  // Record payment
  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentForm.amount) return;

    const amount = parseFloat(paymentForm.amount);
    const remaining = selectedInvoice.remainingAmount || (selectedInvoice.total - (selectedInvoice.paidAmount || 0));

    // Create payment record
    const newPayment = {
      id: `REG-${Date.now()}`,
      invoiceId: selectedInvoice.id,
      clientId: selectedInvoice.clientId,
      date: paymentForm.date,
      amount: amount,
      method: paymentForm.method,
      reference: paymentForm.reference,
      status: 'validated'
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update invoice
    const newPaidAmount = (selectedInvoice.paidAmount || 0) + amount;
    const newRemaining = remaining - amount;
    const newStatus = newRemaining <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : selectedInvoice.status;

    setInvoices(prev => prev.map(inv =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            paidAmount: newPaidAmount,
            remainingAmount: Math.max(0, newRemaining),
            status: newStatus,
            paidDate: newStatus === 'paid' ? paymentForm.date : inv.paidDate
          }
        : inv
    ));

    setShowPaymentModal(false);
    setPaymentForm({ amount: '', method: 'virement', date: new Date().toISOString().split('T')[0], reference: '' });
    setSelectedInvoice(null);
  };

  // Send invoice by email
  const handleSendEmail = (invoice) => {
    const client = getClient(invoice.clientId);
    console.log(`Sending invoice ${invoice.id} to ${client?.email}`);
    alert(`Facture ${invoice.id} envoyée à ${client?.email}`);
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
      paid: { label: 'Payée', color: '#10b981', bg: '#d1fae5' },
      partial: { label: 'Partielle', color: '#6366f1', bg: '#e0e7ff' },
      overdue: { label: 'En retard', color: '#ef4444', bg: '#fee2e2' }
    };
    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  // Tabs
  const tabs = [
    { id: 'all', label: 'Toutes', count: stats.total },
    { id: 'pending', label: 'En attente', icon: Clock, count: stats.pending },
    { id: 'partial', label: 'Partielles', icon: CreditCard, count: stats.partial },
    { id: 'overdue', label: 'En retard', icon: AlertCircle, count: stats.overdue },
    { id: 'paid', label: 'Payées', icon: CheckCircle, count: stats.paid }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total facturé</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalAmount)}</p>
              <p className="text-sm text-blue-400 mt-1">{stats.total} factures</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En attente</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.pendingAmount)}</p>
              <p className="text-sm text-amber-400 mt-1">{stats.pending + stats.partial} factures</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="text-amber-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En retard</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.overdueAmount)}</p>
              <p className="text-sm text-red-400 mt-1">{stats.overdue} factures</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Payées ce mois</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.paid}</p>
              <p className="text-sm text-emerald-400 mt-1">Taux: {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Aging Report Alert */}
      {stats.aging['90+'].count > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="text-white font-medium">Créances critiques (+90 jours)</p>
              <p className="text-gray-400 text-sm">
                {stats.aging['90+'].count} facture(s) pour un total de {formatCurrency(stats.aging['90+'].amount)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAgingReport(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Voir le rapport
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon && <tab.icon size={16} />}
            <span>{tab.label}</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par n° ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Du</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Au</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAgingReport(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <History size={18} />
              Balance âgée
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Download size={18} />
              Exporter
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              <Plus size={18} />
              Nouvelle facture
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-gray-400 font-medium">N° Facture</th>
                <th className="text-left p-4 text-gray-400 font-medium">Client</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Échéance</th>
                <th className="text-right p-4 text-gray-400 font-medium">Montant TTC</th>
                <th className="text-right p-4 text-gray-400 font-medium">Reste dû</th>
                <th className="text-left p-4 text-gray-400 font-medium">Statut</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => {
                const client = getClient(invoice.clientId);
                const daysOverdue = getDaysOverdue(invoice.dueDate);
                const remaining = invoice.remainingAmount || (invoice.total - (invoice.paidAmount || 0));
                const isCreditNote = invoice.type === 'credit_note';

                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isCreditNote ? (
                          <RotateCcw size={16} className="text-purple-400" />
                        ) : (
                          <FileText size={16} className="text-emerald-400" />
                        )}
                        <span className={`font-medium ${isCreditNote ? 'text-purple-400' : 'text-white'}`}>
                          {invoice.id}
                        </span>
                      </div>
                      {invoice.orderId && (
                        <p className="text-xs text-gray-500 mt-1">Commande: {invoice.orderId}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-white">{client?.name || 'Client inconnu'}</p>
                      <p className="text-sm text-gray-400">{client?.contact}</p>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(invoice.date)}</td>
                    <td className="p-4">
                      <div>
                        <span className={invoice.status === 'overdue' ? 'text-red-400' : 'text-gray-300'}>
                          {formatDate(invoice.dueDate)}
                        </span>
                        {invoice.status === 'overdue' && (
                          <p className="text-xs text-red-400 mt-1">+{daysOverdue} jours</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${isCreditNote ? 'text-purple-400' : 'text-white'}`}>
                        {formatCurrency(invoice.total)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {remaining > 0 ? (
                        <span className="text-amber-400 font-medium">{formatCurrency(remaining)}</span>
                      ) : (
                        <span className="text-emerald-400">Soldée</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleSendEmail(invoice)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Envoyer"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Imprimer"
                        >
                          <Printer size={16} />
                        </button>
                        {invoice.status !== 'paid' && !isCreditNote && (
                          <button
                            onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Encaisser"
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && !showPaymentModal && !showCreditNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">{selectedInvoice.id}</h2>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              {(() => {
                const client = getClient(selectedInvoice.clientId);
                return client && (
                  <div className="bg-slate-900/30 rounded-lg p-4">
                    <h3 className="text-gray-400 text-sm mb-3">Client</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Building className="text-emerald-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{client.name}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <MapPin size={14} />
                            <span>{client.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Date d'émission</p>
                  <p className="text-white font-medium">{formatDate(selectedInvoice.date)}</p>
                </div>
                <div className="bg-slate-900/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Date d'échéance</p>
                  <p className={`font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>
                    {formatDate(selectedInvoice.dueDate)}
                    {selectedInvoice.status === 'overdue' && (
                      <span className="text-sm ml-2">(+{getDaysOverdue(selectedInvoice.dueDate)} jours)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-gray-400 text-sm mb-3">Détail</h3>
                <div className="bg-slate-900/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-gray-400 text-sm">Désignation</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Qté</th>
                        <th className="text-right p-3 text-gray-400 text-sm">P.U. HT</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map((item, idx) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={idx} className="border-b border-slate-700/50">
                            <td className="p-3 text-white">{item.description || product?.name || 'Article'}</td>
                            <td className="p-3 text-white text-right">{item.quantity} {item.unit || product?.unit}</td>
                            <td className="p-3 text-white text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-white text-right font-medium">{formatCurrency(item.total || item.quantity * item.unitPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-900/30 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total HT</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>TVA (20%)</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700">
                    <span>Total TTC</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  {(selectedInvoice.paidAmount || 0) > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-400 pt-2">
                        <span>Déjà payé</span>
                        <span>- {formatCurrency(selectedInvoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span>Reste à payer</span>
                        <span>{formatCurrency(selectedInvoice.remainingAmount || (selectedInvoice.total - selectedInvoice.paidAmount))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment History */}
              {(() => {
                const invoicePayments = payments.filter(p => p.invoiceId === selectedInvoice.id);
                return invoicePayments.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Historique des paiements</h3>
                    <div className="space-y-2">
                      {invoicePayments.map(payment => (
                        <div key={payment.id} className="bg-slate-900/30 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="text-white">{formatDate(payment.date)}</p>
                            <p className="text-sm text-gray-400">{payment.method} - {payment.reference}</p>
                          </div>
                          <span className="text-emerald-400 font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-700 flex flex-wrap gap-3 justify-end">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Printer size={18} />
                PDF
              </button>
              <button
                onClick={() => handleSendEmail(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Mail size={18} />
                Envoyer
              </button>
              {selectedInvoice.status !== 'paid' && selectedInvoice.type !== 'credit_note' && (
                <>
                  <button
                    onClick={() => setShowCreditNoteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <RotateCcw size={18} />
                    Avoir
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
                  >
                    <CreditCard size={18} />
                    Encaisser
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Enregistrer un paiement</h2>
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-slate-900/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Facture</span>
                  <span className="text-white font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Déjà payé</span>
                  <span className="text-emerald-400">{formatCurrency(selectedInvoice.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-gray-400 font-medium">Reste à payer</span>
                  <span className="text-amber-400 font-bold">
                    {formatCurrency(selectedInvoice.remainingAmount || (selectedInvoice.total - (selectedInvoice.paidAmount || 0)))}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Montant</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder={String(selectedInvoice.remainingAmount || (selectedInvoice.total - (selectedInvoice.paidAmount || 0)))}
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Mode de paiement</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="virement">Virement bancaire</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                  <option value="cb">Carte bancaire</option>
                  <option value="prelevement">Prélèvement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Date du paiement</label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Référence</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="N° chèque, virement..."
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!paymentForm.amount}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Valider le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Modal */}
      {showCreditNoteModal && selectedInvoice && (
        <CreditNoteModal
          invoice={selectedInvoice}
          onClose={() => { setShowCreditNoteModal(false); setSelectedInvoice(null); }}
          onSubmit={(amount, reason) => {
            createCreditNote(selectedInvoice, amount, reason);
            setShowCreditNoteModal(false);
            setSelectedInvoice(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Aging Report Modal */}
      {showAgingReport && (
        <AgingReportModal
          invoices={invoices}
          aging={stats.aging}
          clients={clients}
          onClose={() => setShowAgingReport(false)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getDaysOverdue={getDaysOverdue}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          orders={orders.filter(o => o.status === 'delivered')}
          clients={clients}
          invoices={invoices}
          onClose={() => setShowCreateModal(false)}
          onCreateFromOrder={createInvoiceFromOrder}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

// Credit Note Modal Component
const CreditNoteModal = ({ invoice, onClose, onSubmit, formatCurrency }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const maxAmount = invoice.remainingAmount || (invoice.total - (invoice.paidAmount || 0));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Créer un avoir</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Facture concernée</p>
            <p className="text-white font-medium">{invoice.id}</p>
            <p className="text-sm text-gray-400 mt-1">Reste dû: {formatCurrency(maxAmount)}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Montant de l'avoir</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={maxAmount}
              step="0.01"
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Motif</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Sélectionner un motif...</option>
              <option value="retour">Retour de marchandise</option>
              <option value="erreur">Erreur de facturation</option>
              <option value="remise">Remise commerciale</option>
              <option value="litige">Litige qualité</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
            Annuler
          </button>
          <button
            onClick={() => onSubmit(parseFloat(amount), reason)}
            disabled={!amount || !reason || parseFloat(amount) > maxAmount}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Créer l'avoir
          </button>
        </div>
      </div>
    </div>
  );
};

// Aging Report Modal
const AgingReportModal = ({ invoices, aging, clients, onClose, formatCurrency, formatDate, getDaysOverdue }) => {
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.type !== 'credit_note');

  const getClient = (clientId) => clients.find(c => c.id === clientId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Balance Âgée des Créances</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(aging).map(([bucket, data]) => (
              <div key={bucket} className="bg-slate-900/30 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">{bucket === 'current' ? 'Non échu' : `${bucket} jours`}</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(data.amount)}</p>
                <p className="text-sm text-gray-500">{data.count} facture(s)</p>
              </div>
            ))}
          </div>

          {/* Detail Table */}
          <div className="bg-slate-900/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-gray-400 text-sm">Facture</th>
                  <th className="text-left p-3 text-gray-400 text-sm">Client</th>
                  <th className="text-left p-3 text-gray-400 text-sm">Échéance</th>
                  <th className="text-right p-3 text-gray-400 text-sm">Jours</th>
                  <th className="text-right p-3 text-gray-400 text-sm">Montant dû</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices
                  .sort((a, b) => getDaysOverdue(b.dueDate) - getDaysOverdue(a.dueDate))
                  .map(inv => {
                    const client = getClient(inv.clientId);
                    const days = getDaysOverdue(inv.dueDate);
                    const remaining = inv.remainingAmount || (inv.total - (inv.paidAmount || 0));

                    return (
                      <tr key={inv.id} className="border-b border-slate-700/50">
                        <td className="p-3 text-white">{inv.id}</td>
                        <td className="p-3 text-gray-300">{client?.name}</td>
                        <td className="p-3 text-gray-300">{formatDate(inv.dueDate)}</td>
                        <td className={`p-3 text-right font-medium ${days > 60 ? 'text-red-400' : days > 30 ? 'text-amber-400' : 'text-gray-300'}`}>
                          {days > 0 ? `+${days}` : '-'}
                        </td>
                        <td className="p-3 text-right text-white font-medium">{formatCurrency(remaining)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Download size={18} />
            Exporter
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Invoice Modal
const CreateInvoiceModal = ({ orders, clients, invoices, onClose, onCreateFromOrder, formatCurrency }) => {
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Get orders without invoice
  const ordersWithoutInvoice = orders.filter(order =>
    !invoices.some(inv => inv.orderId === order.id)
  );

  const getClient = (clientId) => clients.find(c => c.id === clientId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Créer une facture</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Créer depuis une commande livrée</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Sélectionner une commande...</option>
              {ordersWithoutInvoice.map(order => {
                const client = getClient(order.clientId);
                return (
                  <option key={order.id} value={order.id}>
                    {order.id} - {client?.name} - {formatCurrency(order.total)}
                  </option>
                );
              })}
            </select>
          </div>

          {ordersWithoutInvoice.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileX size={32} className="mx-auto mb-2 opacity-50" />
              <p>Aucune commande livrée à facturer</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
            Annuler
          </button>
          <button
            onClick={() => {
              const order = orders.find(o => o.id === selectedOrderId);
              if (order) {
                onCreateFromOrder(order);
                onClose();
              }
            }}
            disabled={!selectedOrderId}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Créer la facture
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, Eye, Edit2, Trash2, Send, Check, X,
  Clock, AlertTriangle, TrendingUp, Download, Copy, ArrowRight, Calendar,
  User, Package, Euro, Percent, RefreshCw, Mail, Phone, MapPin, Building
} from 'lucide-react';
import { clients, products } from '../data/mockData';
import { quotes as initialQuotes, quoteStatuses, convertQuoteToOrder } from '../data/quotesData';

const QuotesPage = () => {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    clientId: '',
    validUntil: '',
    items: [],
    notes: '',
    discount: 0,
    discountType: 'percent'
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = quotes.filter(q => new Date(q.date).getMonth() === now.getMonth());
    const pending = quotes.filter(q => q.status === 'sent' || q.status === 'draft');
    const accepted = quotes.filter(q => q.status === 'accepted');
    const totalAccepted = accepted.reduce((sum, q) => sum + q.total, 0);
    const conversionRate = quotes.length > 0
      ? Math.round((accepted.length / quotes.filter(q => q.status !== 'draft').length) * 100)
      : 0;

    return {
      total: quotes.length,
      pending: pending.length,
      pendingValue: pending.reduce((sum, q) => sum + q.total, 0),
      accepted: accepted.length,
      acceptedValue: totalAccepted,
      conversionRate,
      thisMonth: thisMonth.length,
      avgValue: quotes.length > 0 ? Math.round(quotes.reduce((s, q) => s + q.total, 0) / quotes.length) : 0
    };
  }, [quotes]);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const client = clients.find(c => c.id === quote.clientId);
      const matchesSearch =
        quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const quoteDate = new Date(quote.date);
        const now = new Date();
        if (dateFilter === 'today') {
          matchesDate = quoteDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = quoteDate >= weekAgo;
        } else if (dateFilter === 'month') {
          matchesDate = quoteDate.getMonth() === now.getMonth() &&
                       quoteDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [quotes, searchTerm, statusFilter, dateFilter]);

  // Get client by ID
  const getClient = (clientId) => clients.find(c => c.id === clientId);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusConfig = quoteStatuses[status] || quoteStatuses.draft;
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
      >
        {statusConfig.label}
      </span>
    );
  };

  // Handle create new quote
  const handleCreateQuote = () => {
    setFormData({
      clientId: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      notes: '',
      discount: 0,
      discountType: 'percent'
    });
    setEditMode(false);
    setShowCreateModal(true);
  };

  // Handle edit quote
  const handleEditQuote = (quote) => {
    setFormData({
      clientId: quote.clientId,
      validUntil: quote.validUntil,
      items: [...quote.items],
      notes: quote.notes || '',
      discount: quote.discount || 0,
      discountType: quote.discountType || 'percent'
    });
    setSelectedQuote(quote);
    setEditMode(true);
    setShowCreateModal(true);
  };

  // Handle view quote
  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  // Generate quote number
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const count = quotes.filter(q => q.id.includes(year.toString())).length + 1;
    return `DEV-${year}-${count.toString().padStart(4, '0')}`;
  };

  // Add item to quote
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }]
    }));
  };

  // Update item
  const handleUpdateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Auto-fill price when product selected
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          newItems[index].unitPrice = product.salePrice;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculate totals
  const calculateTotals = (items, discount = 0, discountType = 'percent') => {
    const subtotal = items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
      return sum + lineTotal;
    }, 0);

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * 0.20;
    const total = subtotalAfterDiscount + tax;

    return { subtotal, discountAmount, tax, total };
  };

  // Save quote
  const handleSaveQuote = () => {
    const totals = calculateTotals(formData.items, formData.discount, formData.discountType);

    if (editMode && selectedQuote) {
      // Update existing quote
      setQuotes(prev => prev.map(q =>
        q.id === selectedQuote.id
          ? {
              ...q,
              clientId: formData.clientId,
              validUntil: formData.validUntil,
              items: formData.items,
              notes: formData.notes,
              discount: formData.discount,
              discountType: formData.discountType,
              ...totals,
              updatedAt: new Date().toISOString()
            }
          : q
      ));
    } else {
      // Create new quote
      const newQuote = {
        id: generateQuoteNumber(),
        clientId: formData.clientId,
        date: new Date().toISOString().split('T')[0],
        validUntil: formData.validUntil,
        status: 'draft',
        items: formData.items,
        notes: formData.notes,
        discount: formData.discount,
        discountType: formData.discountType,
        ...totals,
        createdBy: 'Utilisateur actuel',
        version: 1
      };
      setQuotes(prev => [newQuote, ...prev]);
    }

    setShowCreateModal(false);
  };

  // Send quote
  const handleSendQuote = (quote) => {
    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'sent', sentAt: new Date().toISOString() }
        : q
    ));
  };

  // Accept quote
  const handleAcceptQuote = (quote) => {
    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'accepted', acceptedAt: new Date().toISOString() }
        : q
    ));
  };

  // Reject quote
  const handleRejectQuote = (quote) => {
    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'rejected', rejectedAt: new Date().toISOString() }
        : q
    ));
  };

  // Convert to order
  const handleConvertToOrder = (quote) => {
    const order = convertQuoteToOrder(quote);
    // In real app, this would call the API
    console.log('Converting to order:', order);

    setQuotes(prev => prev.map(q =>
      q.id === quote.id
        ? { ...q, status: 'converted', convertedAt: new Date().toISOString(), orderId: order.id }
        : q
    ));

    alert(`Devis converti en commande ${order.id}`);
    setShowDetailModal(false);
  };

  // Duplicate quote
  const handleDuplicateQuote = (quote) => {
    const newQuote = {
      ...quote,
      id: generateQuoteNumber(),
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      version: 1,
      createdBy: 'Utilisateur actuel'
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  // Delete quote
  const handleDeleteQuote = (quote) => {
    if (window.confirm(`Supprimer le devis ${quote.id} ?`)) {
      setQuotes(prev => prev.filter(q => q.id !== quote.id));
    }
  };

  // Check if quote is expired
  const isExpired = (quote) => {
    return new Date(quote.validUntil) < new Date() && quote.status === 'sent';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Devis</h1>
          <p className="text-gray-400 mt-1">Créez et suivez vos propositions commerciales</p>
        </div>
        <button
          onClick={handleCreateQuote}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          <Plus size={20} />
          Nouveau devis
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Devis en attente</p>
              <p className="text-2xl font-bold text-white mt-1">{kpis.pending}</p>
              <p className="text-sm text-amber-400 mt-1">{formatCurrency(kpis.pendingValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="text-amber-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Devis acceptés</p>
              <p className="text-2xl font-bold text-white mt-1">{kpis.accepted}</p>
              <p className="text-sm text-emerald-400 mt-1">{formatCurrency(kpis.acceptedValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="text-emerald-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Taux de conversion</p>
              <p className="text-2xl font-bold text-white mt-1">{kpis.conversionRate}%</p>
              <p className="text-sm text-blue-400 mt-1">{kpis.accepted} / {quotes.filter(q => q.status !== 'draft').length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Valeur moyenne</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.avgValue)}</p>
              <p className="text-sm text-purple-400 mt-1">{kpis.thisMonth} ce mois</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Euro className="text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(quoteStatuses).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-gray-400 font-medium">N° Devis</th>
                <th className="text-left p-4 text-gray-400 font-medium">Client</th>
                <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Validité</th>
                <th className="text-left p-4 text-gray-400 font-medium">Montant TTC</th>
                <th className="text-left p-4 text-gray-400 font-medium">Statut</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => {
                const client = getClient(quote.clientId);
                const expired = isExpired(quote);

                return (
                  <tr
                    key={quote.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-emerald-400" />
                        <span className="text-white font-medium">{quote.id}</span>
                        {quote.version > 1 && (
                          <span className="text-xs text-gray-500">v{quote.version}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{client?.name || 'Client inconnu'}</p>
                        <p className="text-sm text-gray-400">{client?.contact}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(quote.date)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={expired ? 'text-red-400' : 'text-gray-300'}>
                          {formatDate(quote.validUntil)}
                        </span>
                        {expired && <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">{formatCurrency(quote.total)}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={expired && quote.status === 'sent' ? 'expired' : quote.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>

                        {(quote.status === 'draft' || quote.status === 'sent') && (
                          <button
                            onClick={() => handleEditQuote(quote)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {quote.status === 'draft' && (
                          <button
                            onClick={() => handleSendQuote(quote)}
                            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Envoyer"
                          >
                            <Send size={16} />
                          </button>
                        )}

                        {quote.status === 'accepted' && (
                          <button
                            onClick={() => handleConvertToOrder(quote)}
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Convertir en commande"
                          >
                            <ArrowRight size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicateQuote(quote)}
                          className="p-2 text-gray-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>

                        {quote.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteQuote(quote)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
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

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucun devis trouvé</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editMode ? `Modifier le devis ${selectedQuote?.id}` : 'Nouveau devis'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Client *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Valide jusqu'au *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm text-gray-400">Articles</label>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                  >
                    <Plus size={16} />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);

                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-900/30 p-3 rounded-lg">
                        <div className="col-span-4">
                          <select
                            value={item.productId}
                            onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">Produit</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qté"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Prix"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="relative">
                            <input
                              type="number"
                              value={item.discount || 0}
                              onChange={(e) => handleUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              placeholder="Remise"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 pr-8"
                            />
                            <Percent size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="text-white text-sm font-medium">
                            {formatCurrency(lineTotal)}
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {formData.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Ajoutez des articles au devis</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Global Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Remise globale</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                      className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="percent">%</option>
                      <option value="amount">€</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes internes ou conditions particulières..."
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Totals */}
              {formData.items.length > 0 && (
                <div className="bg-slate-900/30 rounded-lg p-4">
                  {(() => {
                    const totals = calculateTotals(formData.items, formData.discount, formData.discountType);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-400">
                          <span>Sous-total HT</span>
                          <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                          <div className="flex justify-between text-amber-400">
                            <span>Remise</span>
                            <span>-{formatCurrency(totals.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-400">
                          <span>TVA (20%)</span>
                          <span>{formatCurrency(totals.tax)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700">
                          <span>Total TTC</span>
                          <span>{formatCurrency(totals.total)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={!formData.clientId || formData.items.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {editMode ? 'Mettre à jour' : 'Créer le devis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">{selectedQuote.id}</h2>
                  <StatusBadge status={selectedQuote.status} />
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              {(() => {
                const client = getClient(selectedQuote.clientId);
                return client && (
                  <div className="bg-slate-900/30 rounded-lg p-4">
                    <h3 className="text-gray-400 text-sm mb-3">Client</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Building className="text-emerald-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{client.name}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{client.contact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
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
                  <p className="text-gray-400 text-sm">Date de création</p>
                  <p className="text-white font-medium">{formatDate(selectedQuote.date)}</p>
                </div>
                <div className="bg-slate-900/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Valide jusqu'au</p>
                  <p className={`font-medium ${isExpired(selectedQuote) ? 'text-red-400' : 'text-white'}`}>
                    {formatDate(selectedQuote.validUntil)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-gray-400 text-sm mb-3">Articles</h3>
                <div className="bg-slate-900/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-gray-400 text-sm">Produit</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Qté</th>
                        <th className="text-right p-3 text-gray-400 text-sm">P.U.</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Remise</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
                        return (
                          <tr key={index} className="border-b border-slate-700/50">
                            <td className="p-3 text-white">{product?.name || 'Produit inconnu'}</td>
                            <td className="p-3 text-white text-right">{item.quantity} {product?.unit}</td>
                            <td className="p-3 text-white text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-amber-400 text-right">{item.discount || 0}%</td>
                            <td className="p-3 text-white text-right font-medium">{formatCurrency(lineTotal)}</td>
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
                    <span>{formatCurrency(selectedQuote.subtotal)}</span>
                  </div>
                  {selectedQuote.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Remise globale</span>
                      <span>-{formatCurrency(selectedQuote.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>TVA (20%)</span>
                    <span>{formatCurrency(selectedQuote.tax)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700">
                    <span>Total TTC</span>
                    <span>{formatCurrency(selectedQuote.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div className="bg-slate-900/30 rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm mb-2">Notes</h3>
                  <p className="text-white">{selectedQuote.notes}</p>
                </div>
              )}

              {/* History */}
              <div className="bg-slate-900/30 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-3">Historique</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créé par</span>
                    <span className="text-white">{selectedQuote.createdBy}</span>
                  </div>
                  {selectedQuote.sentAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Envoyé le</span>
                      <span className="text-white">{formatDate(selectedQuote.sentAt)}</span>
                    </div>
                  )}
                  {selectedQuote.acceptedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accepté le</span>
                      <span className="text-emerald-400">{formatDate(selectedQuote.acceptedAt)}</span>
                    </div>
                  )}
                  {selectedQuote.rejectedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Refusé le</span>
                      <span className="text-red-400">{formatDate(selectedQuote.rejectedAt)}</span>
                    </div>
                  )}
                  {selectedQuote.convertedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Converti en commande</span>
                      <span className="text-purple-400">{selectedQuote.orderId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-700 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => {
                  // Download PDF
                  console.log('Downloading PDF...');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Download size={18} />
                PDF
              </button>

              {selectedQuote.status === 'draft' && (
                <button
                  onClick={() => {
                    handleSendQuote(selectedQuote);
                    setSelectedQuote({ ...selectedQuote, status: 'sent', sentAt: new Date().toISOString() });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                >
                  <Send size={18} />
                  Envoyer
                </button>
              )}

              {selectedQuote.status === 'sent' && (
                <>
                  <button
                    onClick={() => {
                      handleAcceptQuote(selectedQuote);
                      setSelectedQuote({ ...selectedQuote, status: 'accepted', acceptedAt: new Date().toISOString() });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                  >
                    <Check size={18} />
                    Accepter
                  </button>
                  <button
                    onClick={() => {
                      handleRejectQuote(selectedQuote);
                      setSelectedQuote({ ...selectedQuote, status: 'rejected', rejectedAt: new Date().toISOString() });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <X size={18} />
                    Refuser
                  </button>
                </>
              )}

              {selectedQuote.status === 'accepted' && (
                <button
                  onClick={() => handleConvertToOrder(selectedQuote)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700"
                >
                  <ArrowRight size={18} />
                  Créer la commande
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, Search, Plus, Filter, Download, Eye, Edit, 
  Trash2, Printer, Clock, Package, Truck, CheckCircle, XCircle,
  Calendar, User, MapPin, Phone, Mail, FileText, ArrowRight
} from 'lucide-react';
import {
  Card, SearchInput, FilterPills, Tabs, Table, StatusBadge,
  Modal, Button, Input, Select, Alert, EmptyState, ActionButtons,
  Avatar
} from './ui';
import { useFormatters } from '../hooks';
import { orders, clients, products } from '../data/mockData';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const { formatCurrency, formatDate, formatNumber } = useFormatters();

  // Stats par statut
  const stats = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparation: orders.filter(o => o.status === 'preparation').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    todayTotal: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.date).toDateString() === today;
    }).reduce((sum, o) => sum + o.total, 0),
    todayCount: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.date).toDateString() === today;
    }).length
  }), []);

  // Filtrage
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !searchQuery || 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = activeTab === 'all' || o.status === activeTab;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, activeTab]);

  const tabs = [
    { id: 'all', label: 'Toutes', count: stats.all },
    { id: 'pending', label: 'En attente', icon: Clock, count: stats.pending },
    { id: 'preparation', label: 'Préparation', icon: Package, count: stats.preparation },
    { id: 'shipped', label: 'Expédiées', icon: Truck, count: stats.shipped },
    { id: 'delivered', label: 'Livrées', icon: CheckCircle, count: stats.delivered },
  ];

  const columns = [
    {
      key: 'orderNumber',
      label: 'N° Commande',
      render: (val) => <span className="order-number">{val}</span>
    },
    {
      key: 'clientName',
      label: 'Client',
      render: (val, row) => (
        <div className="client-cell">
          <Avatar name={val} size="sm" />
          <div className="client-info">
            <span className="client-name">{val}</span>
            <span className="client-type">{row.clientType}</span>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (val) => formatDate(val)
    },
    {
      key: 'deliveryDate',
      label: 'Livraison',
      render: (val, row) => (
        <div className="delivery-cell">
          <span className="delivery-date">{formatDate(val)}</span>
          {row.deliverySlot && <span className="delivery-slot">{row.deliverySlot}</span>}
        </div>
      )
    },
    {
      key: 'itemsCount',
      label: 'Articles',
      align: 'center',
      render: (val) => <span className="items-count">{val}</span>
    },
    {
      key: 'total',
      label: 'Montant',
      align: 'right',
      render: (val) => <span className="order-total">{formatCurrency(val)}</span>
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (_, row) => (
        <ActionButtons
          row={row}
          actions={[
            { icon: Eye, label: 'Voir', onClick: (r) => setSelectedOrder(r) },
            { icon: Edit, label: 'Modifier', onClick: () => {} },
            { icon: Printer, label: 'Imprimer', onClick: () => {} },
          ]}
        />
      )
    }
  ];

  // Fonction pour obtenir les actions possibles selon statut
  const getStatusActions = (status) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Valider', action: 'validate', color: 'success' },
          { label: 'Annuler', action: 'cancel', color: 'danger' }
        ];
      case 'preparation':
        return [
          { label: 'Marquer expédié', action: 'ship', color: 'primary' },
          { label: 'Annuler', action: 'cancel', color: 'danger' }
        ];
      case 'shipped':
        return [
          { label: 'Marquer livré', action: 'deliver', color: 'success' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="orders-page">
      {/* KPIs */}
      <div className="quick-stats">
        <div className="quick-stat primary">
          <ShoppingCart size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.todayCount}</span>
            <span className="stat-label">Commandes du jour</span>
          </div>
        </div>
        <div className="quick-stat success">
          <CheckCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.todayTotal)}</span>
            <span className="stat-label">CA du jour</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <Package size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.preparation}</span>
            <span className="stat-label">En préparation</span>
          </div>
        </div>
        <div className="quick-stat secondary">
          <Truck size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.shipped}</span>
            <span className="stat-label">En livraison</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Liste commandes */}
      <Card>
        <div className="filters-bar">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par n° ou client..."
          />
          <div className="filter-actions">
            <Button variant="ghost" icon={Download}>Exporter</Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowNewOrderModal(true)}>
              Nouvelle commande
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredOrders}
          onRowClick={setSelectedOrder}
          emptyMessage="Aucune commande trouvée"
        />
      </Card>

      {/* Modal détail commande */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Commande ${selectedOrder?.orderNumber}`}
        size="lg"
        footer={
          selectedOrder && (
            <div className="modal-footer-actions">
              <div className="status-actions">
                {getStatusActions(selectedOrder.status).map((action, idx) => (
                  <Button 
                    key={idx} 
                    variant={action.color === 'danger' ? 'ghost' : 'primary'}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" icon={Printer}>
                Imprimer
              </Button>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="order-detail">
            {/* Statut et dates */}
            <div className="detail-header">
              <StatusBadge status={selectedOrder.status} size="lg" />
              <div className="order-dates">
                <span>
                  <Calendar size={14} />
                  Créée le {formatDate(selectedOrder.date)}
                </span>
                <span>
                  <Truck size={14} />
                  Livraison: {formatDate(selectedOrder.deliveryDate)} {selectedOrder.deliverySlot}
                </span>
              </div>
            </div>

            {/* Client */}
            <div className="detail-section">
              <h4><User size={16} /> Client</h4>
              <div className="client-detail">
                <Avatar name={selectedOrder.clientName} size="lg" />
                <div className="client-info">
                  <span className="client-name">{selectedOrder.clientName}</span>
                  <span className="client-type">{selectedOrder.clientType}</span>
                  <div className="client-contacts">
                    <span><Phone size={14} /> {selectedOrder.clientPhone || '01 23 45 67 89'}</span>
                    <span><Mail size={14} /> {selectedOrder.clientEmail || 'contact@client.fr'}</span>
                  </div>
                </div>
              </div>
              <div className="delivery-address">
                <MapPin size={14} />
                <span>{selectedOrder.deliveryAddress || '123 Rue de la Livraison, 75001 Paris'}</span>
              </div>
            </div>

            {/* Articles */}
            <div className="detail-section">
              <h4><Package size={16} /> Articles ({selectedOrder.itemsCount})</h4>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || [
                    { name: 'Filet de bœuf', quantity: 10, unit: 'kg', unitPrice: 28.50 },
                    { name: 'Saumon frais', quantity: 5, unit: 'kg', unitPrice: 18.90 },
                    { name: 'Comté AOP', quantity: 3, unit: 'kg', unitPrice: 22.00 },
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">Sous-total HT</td>
                    <td>{formatCurrency(selectedOrder.total * 0.8)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3">TVA (20%)</td>
                    <td>{formatCurrency(selectedOrder.total * 0.2)}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="3">Total TTC</td>
                    <td>{formatCurrency(selectedOrder.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="detail-section">
                <h4><FileText size={16} /> Notes</h4>
                <p className="order-notes">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal nouvelle commande */}
      <Modal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        title="Nouvelle commande"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewOrderModal(false)}>
              Annuler
            </Button>
            <Button variant="primary">
              Créer la commande
            </Button>
          </>
        }
      >
        <div className="new-order-form">
          <div className="form-section">
            <h4>Client</h4>
            <Select
              label="Sélectionner un client"
              options={clients.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Rechercher un client..."
            />
          </div>
          
          <div className="form-section">
            <h4>Livraison</h4>
            <div className="form-row">
              <Input label="Date de livraison" type="date" />
              <Select
                label="Créneau"
                options={[
                  { value: 'morning', label: '8h - 12h' },
                  { value: 'afternoon', label: '14h - 18h' },
                ]}
              />
            </div>
            <Input label="Adresse de livraison" placeholder="Adresse complète..." />
          </div>

          <div className="form-section">
            <h4>Articles</h4>
            <div className="order-items-editor">
              <div className="item-row header">
                <span>Produit</span>
                <span>Quantité</span>
                <span>Prix</span>
                <span></span>
              </div>
              <div className="item-row">
                <Select
                  options={products.map(p => ({ 
                    value: p.id, 
                    label: `${p.name} - ${formatCurrency(p.sellingPrice)}/${p.unit}` 
                  }))}
                  placeholder="Ajouter un produit..."
                />
                <Input type="number" placeholder="Qté" />
                <span className="item-total">€0.00</span>
                <Button variant="ghost" size="sm" icon={Trash2} />
              </div>
              <Button variant="ghost" icon={Plus} fullWidth>
                Ajouter un article
              </Button>
            </div>
          </div>

          <div className="form-section">
            <Input label="Notes" placeholder="Instructions spéciales..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;

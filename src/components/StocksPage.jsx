import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Filter, Download, Upload, QrCode,
  AlertTriangle, Calendar, Thermometer, MapPin, Truck, BarChart3,
  Edit, Trash2, Eye, ArrowUpRight, ArrowDownLeft, RefreshCw, Box
} from 'lucide-react';
import { 
  Card, SearchInput, FilterPills, Tabs, Table, StatusBadge, 
  ProgressBar, Modal, Button, Input, Select, Alert, EmptyState,
  ActionButtons
} from './ui';
import { useProducts, useFormatters } from '../hooks';
import { products, stockMovements, storageZones, stockAlerts } from '../data/mockData';

const StocksPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { formatCurrency, formatNumber, formatDate, formatPercent } = useFormatters();

  // Filtrage produits
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ean.includes(searchQuery);
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchZone = !zoneFilter || p.storageZone === zoneFilter;
      return matchSearch && matchCategory && matchZone;
    });
  }, [searchQuery, categoryFilter, zoneFilter]);

  // Stats
  const stats = useMemo(() => ({
    totalProducts: products.length,
    lowStock: products.filter(p => p.currentStock <= p.minStock).length,
    expiringStock: products.filter(p => {
      const dlc = new Date(p.dlc);
      const today = new Date();
      const diffDays = Math.ceil((dlc - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
    totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0)
  }), []);

  // Categories uniques
  const categories = [...new Set(products.map(p => p.category))];
  const categoryOptions = [
    { value: null, label: 'Toutes catégories' },
    ...categories.map(c => ({ value: c, label: c }))
  ];

  // Zones uniques
  const zones = [...new Set(products.map(p => p.storageZone))];
  const zoneOptions = [
    { value: null, label: 'Toutes zones' },
    ...zones.map(z => ({ value: z, label: z }))
  ];

  const tabs = [
    { id: 'inventory', label: 'Inventaire', icon: Package, count: products.length },
    { id: 'movements', label: 'Mouvements', icon: RefreshCw, count: stockMovements.length },
    { id: 'zones', label: 'Zones stockage', icon: MapPin, count: storageZones.length },
    { id: 'alerts', label: 'Alertes', icon: AlertTriangle, count: stockAlerts.length },
  ];

  // Calcul DLC status
  const getDlcStatus = (dlc) => {
    const today = new Date();
    const dlcDate = new Date(dlc);
    const diffDays = Math.ceil((dlcDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', label: 'Expiré', color: 'danger' };
    if (diffDays <= 3) return { status: 'critical', label: `${diffDays}j`, color: 'danger' };
    if (diffDays <= 7) return { status: 'warning', label: `${diffDays}j`, color: 'warning' };
    if (diffDays <= 14) return { status: 'attention', label: `${diffDays}j`, color: 'warning' };
    return { status: 'ok', label: formatDate(dlc), color: 'success' };
  };

  // Calcul stock status
  const getStockStatus = (current, min, max) => {
    const percentage = (current / max) * 100;
    if (current <= min) return { status: 'critical', color: 'danger' };
    if (current <= min * 1.5) return { status: 'low', color: 'warning' };
    if (percentage > 90) return { status: 'full', color: 'secondary' };
    return { status: 'normal', color: 'success' };
  };

  // Colonnes tableau inventaire
  const inventoryColumns = [
    {
      key: 'name',
      label: 'Produit',
      render: (_, row) => (
        <div className="product-cell">
          <div className="product-icon">
            <Package size={20} />
          </div>
          <div className="product-info">
            <span className="product-name">{row.name}</span>
            <span className="product-ean">EAN: {row.ean}</span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Catégorie',
      render: (val) => <span className="category-badge">{val}</span>
    },
    {
      key: 'currentStock',
      label: 'Stock',
      render: (val, row) => {
        const stockStatus = getStockStatus(val, row.minStock, row.maxStock);
        return (
          <div className="stock-cell">
            <div className="stock-value">
              {formatNumber(val)} <span className="stock-unit">{row.unit}</span>
            </div>
            <ProgressBar 
              value={val} 
              max={row.maxStock} 
              size="sm"
              color={stockStatus.color}
            />
            <div className="stock-range">
              Min: {row.minStock} / Max: {row.maxStock}
            </div>
          </div>
        );
      }
    },
    {
      key: 'sellingPrice',
      label: 'Prix vente',
      align: 'right',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'margin',
      label: 'Marge',
      align: 'right',
      render: (val) => (
        <span className={`margin-value ${val >= 30 ? 'high' : val >= 20 ? 'medium' : 'low'}`}>
          {formatPercent(val)}
        </span>
      )
    },
    {
      key: 'dlc',
      label: 'DLC',
      render: (val) => {
        const dlcStatus = getDlcStatus(val);
        return (
          <span className={`dlc-badge ${dlcStatus.color}`}>
            <Calendar size={14} />
            {dlcStatus.label}
          </span>
        );
      }
    },
    {
      key: 'storageZone',
      label: 'Zone',
      render: (val) => (
        <span className="zone-badge">
          <Thermometer size={14} />
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (_, row) => (
        <ActionButtons
          row={row}
          actions={[
            { icon: Eye, label: 'Voir', onClick: (r) => setSelectedProduct(r) },
            { icon: Edit, label: 'Modifier', onClick: () => {} },
            { icon: QrCode, label: 'QR Code', onClick: () => {} },
          ]}
        />
      )
    }
  ];

  // Colonnes tableau mouvements
  const movementColumns = [
    {
      key: 'date',
      label: 'Date/Heure',
      render: (val) => (
        <div className="datetime-cell">
          <span className="date">{formatDate(val)}</span>
          <span className="time">{new Date(val).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: 'productName',
      label: 'Produit'
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className={`movement-type ${val}`}>
          {val === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
          {val === 'in' ? 'Entrée' : 'Sortie'}
        </span>
      )
    },
    {
      key: 'quantity',
      label: 'Quantité',
      align: 'right',
      render: (val, row) => (
        <span className={`quantity ${row.type}`}>
          {row.type === 'in' ? '+' : '-'}{val}
        </span>
      )
    },
    {
      key: 'reference',
      label: 'Référence'
    },
    {
      key: 'user',
      label: 'Utilisateur'
    }
  ];

  return (
    <div className="stocks-page">
      {/* Stats rapides */}
      <div className="quick-stats">
        <div className="quick-stat">
          <Package size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Produits</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <AlertTriangle size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.lowStock}</span>
            <span className="stat-label">Stock bas</span>
          </div>
        </div>
        <div className="quick-stat danger">
          <Calendar size={20} />
          <div className="stat-content">
            <span className="stat-value">{stats.expiringStock}</span>
            <span className="stat-label">DLC proche</span>
          </div>
        </div>
        <div className="quick-stat primary">
          <BarChart3 size={20} />
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
            <span className="stat-label">Valeur stock</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu selon tab */}
      {activeTab === 'inventory' && (
        <Card>
          {/* Filtres */}
          <div className="filters-bar">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom ou EAN..."
            />
            <Select
              value={categoryFilter || ''}
              onChange={(v) => setCategoryFilter(v || null)}
              options={categoryOptions}
              placeholder="Catégorie"
            />
            <Select
              value={zoneFilter || ''}
              onChange={(v) => setZoneFilter(v || null)}
              options={zoneOptions}
              placeholder="Zone"
            />
            <div className="filter-actions">
              <Button variant="ghost" icon={Download}>Exporter</Button>
              <Button variant="ghost" icon={Upload}>Importer</Button>
              <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                Nouveau produit
              </Button>
            </div>
          </div>

          {/* Tableau */}
          <Table
            columns={inventoryColumns}
            data={filteredProducts}
            onRowClick={setSelectedProduct}
            emptyMessage="Aucun produit trouvé"
          />
        </Card>
      )}

      {activeTab === 'movements' && (
        <Card>
          <div className="filters-bar">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un mouvement..."
            />
            <FilterPills
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'in', label: 'Entrées' },
                { value: 'out', label: 'Sorties' },
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
          <Table
            columns={movementColumns}
            data={stockMovements}
            emptyMessage="Aucun mouvement"
          />
        </Card>
      )}

      {activeTab === 'zones' && (
        <div className="zones-grid">
          {storageZones.map(zone => (
            <Card key={zone.id} className="zone-card">
              <div className="zone-header">
                <div className="zone-icon" style={{ background: `${zone.color}20`, color: zone.color }}>
                  <Thermometer size={24} />
                </div>
                <div className="zone-info">
                  <h3>{zone.name}</h3>
                  <span className="zone-temp">{zone.temperature}</span>
                </div>
              </div>
              <div className="zone-capacity">
                <div className="capacity-header">
                  <span>Capacité utilisée</span>
                  <span className="capacity-percent">{zone.usedPercentage}%</span>
                </div>
                <ProgressBar 
                  value={zone.usedPercentage} 
                  max={100}
                  color={zone.usedPercentage > 90 ? 'danger' : zone.usedPercentage > 75 ? 'warning' : 'success'}
                />
              </div>
              <div className="zone-stats">
                <div className="zone-stat">
                  <span className="stat-value">{zone.used}</span>
                  <span className="stat-label">Utilisé</span>
                </div>
                <div className="zone-stat">
                  <span className="stat-value">{zone.capacity}</span>
                  <span className="stat-label">Capacité</span>
                </div>
                <div className="zone-stat">
                  <span className="stat-value">{zone.productCount}</span>
                  <span className="stat-label">Produits</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-grid">
          <Card title="Stocks bas" className="alerts-column">
            {stockAlerts
              .filter(a => a.type === 'stock_low')
              .map((alert, idx) => (
                <Alert key={idx} type="warning" title={alert.productName}>
                  {alert.message}
                  <div className="alert-action">
                    <Button variant="outline" size="sm" icon={Truck}>
                      Commander
                    </Button>
                  </div>
                </Alert>
              ))}
          </Card>
          <Card title="DLC proche" className="alerts-column">
            {stockAlerts
              .filter(a => a.type === 'dlc_expiring')
              .map((alert, idx) => (
                <Alert key={idx} type="danger" title={alert.productName}>
                  {alert.message}
                  <div className="alert-action">
                    <Button variant="outline" size="sm" icon={Eye}>
                      Voir produit
                    </Button>
                  </div>
                </Alert>
              ))}
          </Card>
        </div>
      )}

      {/* Modal Nouveau produit */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouveau produit"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button variant="primary">
              Créer le produit
            </Button>
          </>
        }
      >
        <div className="form-grid">
          <Input label="Nom du produit" placeholder="Ex: Filet de bœuf" required />
          <Input label="Code EAN" placeholder="Ex: 3760012345678" required />
          <Select
            label="Catégorie"
            options={categoryOptions.filter(c => c.value)}
            placeholder="Sélectionner..."
          />
          <Select
            label="Zone de stockage"
            options={zoneOptions.filter(z => z.value)}
            placeholder="Sélectionner..."
          />
          <Input label="Prix d'achat HT" type="number" placeholder="0.00" />
          <Input label="Prix de vente HT" type="number" placeholder="0.00" />
          <Input label="Stock initial" type="number" placeholder="0" />
          <Input label="Stock minimum" type="number" placeholder="0" />
          <Input label="Stock maximum" type="number" placeholder="0" />
          <Input label="Unité" placeholder="kg, pièces, L..." />
          <Input label="DLC" type="date" />
          <Input label="N° de lot" placeholder="LOT-XXXX" />
        </div>
      </Modal>

      {/* Modal détail produit */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name}
        size="lg"
      >
        {selectedProduct && (
          <div className="product-detail">
            <div className="detail-section">
              <h4>Informations générales</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">EAN</span>
                  <span className="value">{selectedProduct.ean}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Catégorie</span>
                  <span className="value">{selectedProduct.category}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Fournisseur</span>
                  <span className="value">{selectedProduct.supplier}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Zone stockage</span>
                  <span className="value">{selectedProduct.storageZone}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>Stock</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Stock actuel</span>
                  <span className="value">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Stock minimum</span>
                  <span className="value">{selectedProduct.minStock} {selectedProduct.unit}</span>
                </div>
                <div className="detail-item">
                  <span className="label">N° Lot</span>
                  <span className="value">{selectedProduct.lotNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="label">DLC</span>
                  <span className="value">{formatDate(selectedProduct.dlc)}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>Prix et marge</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Prix d'achat</span>
                  <span className="value">{formatCurrency(selectedProduct.purchasePrice)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Prix de vente</span>
                  <span className="value">{formatCurrency(selectedProduct.sellingPrice)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Marge</span>
                  <span className="value highlight">{formatPercent(selectedProduct.margin)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Valeur stock</span>
                  <span className="value">{formatCurrency(selectedProduct.currentStock * selectedProduct.purchasePrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StocksPage;

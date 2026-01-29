import React, { useState, useMemo } from 'react';
import {
  Warehouse, Package, MapPin, Truck, ArrowRightLeft, ClipboardCheck,
  Search, Filter, Plus, Edit, Trash2, Eye, QrCode, Thermometer,
  AlertTriangle, Check, X, Clock, BarChart3, TrendingUp, Box,
  ArrowDown, ArrowUp, RotateCcw, Layers, Grid, Navigation,
  Scan, FileText, Download, Printer, RefreshCw, ChevronRight,
  ChevronDown, Settings, Users, Calendar, Timer, Target, Zap,
  PackageCheck, PackageX, PackagePlus, PackageMinus, Move,
  LayoutGrid, List, Map, CircleDot, Boxes, Container, Weight
} from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

// Données mockées WMS
const WAREHOUSE_ZONES = [
  { id: 'ZONE-A', name: 'Zone A - Frais', type: 'cold', temperature: { min: 0, max: 4 }, humidity: 85, capacity: 500, used: 380, color: '#3b82f6' },
  { id: 'ZONE-B', name: 'Zone B - Surgelés', type: 'frozen', temperature: { min: -25, max: -18 }, humidity: 70, capacity: 300, used: 245, color: '#8b5cf6' },
  { id: 'ZONE-C', name: 'Zone C - Sec', type: 'dry', temperature: { min: 15, max: 25 }, humidity: 50, capacity: 800, used: 520, color: '#f59e0b' },
  { id: 'ZONE-D', name: 'Zone D - Quai réception', type: 'dock', temperature: null, humidity: null, capacity: 100, used: 35, color: '#10b981' },
  { id: 'ZONE-E', name: 'Zone E - Quai expédition', type: 'dock', temperature: null, humidity: null, capacity: 100, used: 42, color: '#ef4444' },
];

const STORAGE_LOCATIONS = [
  { id: 'A-01-01', zone: 'ZONE-A', aisle: 'A', rack: '01', level: '01', type: 'pallet', status: 'occupied', product: 'PROD001', quantity: 50, maxWeight: 1000 },
  { id: 'A-01-02', zone: 'ZONE-A', aisle: 'A', rack: '01', level: '02', type: 'pallet', status: 'occupied', product: 'PROD002', quantity: 30, maxWeight: 1000 },
  { id: 'A-01-03', zone: 'ZONE-A', aisle: 'A', rack: '01', level: '03', type: 'pallet', status: 'empty', product: null, quantity: 0, maxWeight: 800 },
  { id: 'A-02-01', zone: 'ZONE-A', aisle: 'A', rack: '02', level: '01', type: 'pallet', status: 'occupied', product: 'PROD003', quantity: 75, maxWeight: 1000 },
  { id: 'A-02-02', zone: 'ZONE-A', aisle: 'A', rack: '02', level: '02', type: 'shelf', status: 'reserved', product: null, quantity: 0, maxWeight: 500 },
  { id: 'B-01-01', zone: 'ZONE-B', aisle: 'B', rack: '01', level: '01', type: 'pallet', status: 'occupied', product: 'PROD004', quantity: 40, maxWeight: 1000 },
  { id: 'B-01-02', zone: 'ZONE-B', aisle: 'B', rack: '01', level: '02', type: 'pallet', status: 'occupied', product: 'PROD005', quantity: 25, maxWeight: 1000 },
  { id: 'C-01-01', zone: 'ZONE-C', aisle: 'C', rack: '01', level: '01', type: 'bulk', status: 'occupied', product: 'PROD006', quantity: 200, maxWeight: 2000 },
  { id: 'C-02-01', zone: 'ZONE-C', aisle: 'C', rack: '02', level: '01', type: 'shelf', status: 'empty', product: null, quantity: 0, maxWeight: 300 },
];

const INBOUND_ORDERS = [
  { id: 'REC-001', supplier: 'METRO France', date: '2025-01-29', time: '08:30', status: 'in_progress', items: 12, received: 8, dock: 'D-01', priority: 'high' },
  { id: 'REC-002', supplier: 'Pomona', date: '2025-01-29', time: '10:00', status: 'pending', items: 8, received: 0, dock: 'D-02', priority: 'normal' },
  { id: 'REC-003', supplier: 'Transgourmet', date: '2025-01-29', time: '14:00', status: 'scheduled', items: 15, received: 0, dock: null, priority: 'normal' },
  { id: 'REC-004', supplier: 'Sysco France', date: '2025-01-28', time: '16:30', status: 'completed', items: 10, received: 10, dock: 'D-01', priority: 'low' },
];

const OUTBOUND_ORDERS = [
  { id: 'EXP-001', client: 'Restaurant Le Gourmet', date: '2025-01-29', time: '07:00', status: 'picking', items: 8, picked: 5, dock: 'E-01', priority: 'urgent', route: 'R-001' },
  { id: 'EXP-002', client: 'Brasserie du Port', date: '2025-01-29', time: '09:00', status: 'pending', items: 12, picked: 0, dock: null, priority: 'high', route: 'R-001' },
  { id: 'EXP-003', client: 'Hôtel & Spa Riviera', date: '2025-01-29', time: '11:00', status: 'packed', items: 6, picked: 6, dock: 'E-02', priority: 'normal', route: 'R-002' },
  { id: 'EXP-004', client: 'Café Central', date: '2025-01-29', time: '14:00', status: 'shipped', items: 4, picked: 4, dock: 'E-01', priority: 'normal', route: 'R-002' },
];

const PICKING_TASKS = [
  { id: 'PICK-001', order: 'EXP-001', location: 'A-01-01', product: 'Filet de bœuf', quantity: 5, picked: 3, status: 'in_progress', assignee: 'Lucas M.', priority: 1 },
  { id: 'PICK-002', order: 'EXP-001', location: 'A-02-01', product: 'Côte de porc', quantity: 10, picked: 10, status: 'completed', assignee: 'Lucas M.', priority: 2 },
  { id: 'PICK-003', order: 'EXP-001', location: 'B-01-01', product: 'Saumon frais', quantity: 8, picked: 0, status: 'pending', assignee: 'Lucas M.', priority: 3 },
  { id: 'PICK-004', order: 'EXP-002', location: 'C-01-01', product: 'Huile d\'olive', quantity: 6, picked: 0, status: 'pending', assignee: null, priority: 1 },
];

const INVENTORY_MOVEMENTS = [
  { id: 'MOV-001', type: 'transfer', from: 'A-01-01', to: 'A-02-03', product: 'PROD001', quantity: 10, date: '2025-01-29T09:15:00', user: 'Lucas M.', reason: 'Optimisation' },
  { id: 'MOV-002', type: 'receipt', from: 'DOCK-D1', to: 'B-01-02', product: 'PROD005', quantity: 50, date: '2025-01-29T08:45:00', user: 'Marie M.', reason: 'Réception REC-001' },
  { id: 'MOV-003', type: 'pick', from: 'A-02-01', to: 'DOCK-E1', product: 'PROD003', quantity: 15, date: '2025-01-29T07:30:00', user: 'Lucas M.', reason: 'Préparation EXP-001' },
  { id: 'MOV-004', type: 'adjustment', from: 'C-01-01', to: null, product: 'PROD006', quantity: -5, date: '2025-01-28T16:00:00', user: 'Admin', reason: 'Inventaire - écart' },
];

function WMSPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Stats globales
  const stats = useMemo(() => {
    const totalCapacity = WAREHOUSE_ZONES.reduce((sum, z) => sum + z.capacity, 0);
    const totalUsed = WAREHOUSE_ZONES.reduce((sum, z) => sum + z.used, 0);
    const emptyLocations = STORAGE_LOCATIONS.filter(l => l.status === 'empty').length;
    const pendingReceptions = INBOUND_ORDERS.filter(o => o.status !== 'completed').length;
    const pendingExpeditions = OUTBOUND_ORDERS.filter(o => o.status !== 'shipped').length;
    const activePicks = PICKING_TASKS.filter(t => t.status === 'in_progress').length;
    
    return {
      occupancyRate: ((totalUsed / totalCapacity) * 100).toFixed(1),
      totalCapacity,
      totalUsed,
      emptyLocations,
      pendingReceptions,
      pendingExpeditions,
      activePicks,
      movementsToday: INVENTORY_MOVEMENTS.filter(m => m.date.startsWith('2025-01-29')).length
    };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      empty: '#10b981',
      occupied: '#3b82f6',
      reserved: '#f59e0b',
      blocked: '#ef4444',
      pending: '#64748b',
      in_progress: '#f59e0b',
      picking: '#8b5cf6',
      packed: '#3b82f6',
      completed: '#10b981',
      shipped: '#10b981',
      scheduled: '#64748b'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status) => {
    const labels = {
      empty: 'Vide',
      occupied: 'Occupé',
      reserved: 'Réservé',
      blocked: 'Bloqué',
      pending: 'En attente',
      in_progress: 'En cours',
      picking: 'Préparation',
      packed: 'Emballé',
      completed: 'Terminé',
      shipped: 'Expédié',
      scheduled: 'Planifié'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = { urgent: '#ef4444', high: '#f59e0b', normal: '#3b82f6', low: '#64748b' };
    return colors[priority] || '#64748b';
  };

  return (
    <div className="wms-page">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'dashboard', icon: LayoutGrid, label: 'Vue d\'ensemble' },
          { id: 'zones', icon: Map, label: 'Zones & Emplacements' },
          { id: 'inbound', icon: ArrowDown, label: 'Réceptions' },
          { id: 'outbound', icon: ArrowUp, label: 'Expéditions' },
          { id: 'picking', icon: ClipboardCheck, label: 'Préparation' },
          { id: 'movements', icon: ArrowRightLeft, label: 'Mouvements' },
          { id: 'inventory', icon: Boxes, label: 'Inventaire' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--card-bg)',
              color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard WMS */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: Warehouse, label: 'Taux d\'occupation', value: `${stats.occupancyRate}%`, sub: `${stats.totalUsed}/${stats.totalCapacity} palettes`, color: '#3b82f6' },
              { icon: ArrowDown, label: 'Réceptions en attente', value: stats.pendingReceptions, sub: 'à traiter', color: '#10b981' },
              { icon: ArrowUp, label: 'Expéditions en attente', value: stats.pendingExpeditions, sub: 'à préparer', color: '#f59e0b' },
              { icon: ClipboardCheck, label: 'Picking actif', value: stats.activePicks, sub: 'tâches en cours', color: '#8b5cf6' }
            ].map((kpi, i) => (
              <div key={i} style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: `${kpi.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color
                }}>
                  <kpi.icon size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Zones overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Map size={20} style={{ color: 'var(--primary-color)' }} />
                  Zones de stockage
                </h3>
                <button 
                  onClick={() => setActiveTab('zones')}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Voir détails
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {WAREHOUSE_ZONES.slice(0, 3).map(zone => {
                    const occupancy = (zone.used / zone.capacity) * 100;
                    return (
                      <div
                        key={zone.id}
                        style={{
                          padding: '1.25rem',
                          background: 'var(--hover-bg)',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${zone.color}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{zone.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {zone.temperature ? `${zone.temperature.min}°C à ${zone.temperature.max}°C` : 'Température ambiante'}
                            </div>
                          </div>
                          {zone.type === 'cold' && <Thermometer size={20} style={{ color: '#3b82f6' }} />}
                          {zone.type === 'frozen' && <Thermometer size={20} style={{ color: '#8b5cf6' }} />}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span>{zone.used} / {zone.capacity}</span>
                            <span style={{ fontWeight: 600, color: occupancy > 90 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#10b981' }}>
                              {occupancy.toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${occupancy}%`,
                              background: occupancy > 90 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#10b981',
                              borderRadius: 4,
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alertes */}
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  Alertes
                </h3>
              </div>
              <div style={{ padding: '0.5rem' }}>
                {[
                  { type: 'warning', message: 'Zone B - Température élevée (-16°C)', time: '5 min' },
                  { type: 'info', message: 'Réception REC-001 en cours', time: '15 min' },
                  { type: 'danger', message: 'Emplacement A-03-02 bloqué', time: '1h' },
                  { type: 'success', message: 'Expédition EXP-004 terminée', time: '2h' }
                ].map((alert, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '0.25rem',
                    background: alert.type === 'danger' ? 'rgba(239,68,68,0.1)' : 
                               alert.type === 'warning' ? 'rgba(245,158,11,0.1)' : 
                               alert.type === 'success' ? 'rgba(16,185,129,0.1)' : 'var(--hover-bg)'
                  }}>
                    <CircleDot size={8} style={{ 
                      color: alert.type === 'danger' ? '#ef4444' : 
                             alert.type === 'warning' ? '#f59e0b' : 
                             alert.type === 'success' ? '#10b981' : '#3b82f6',
                      flexShrink: 0
                    }} />
                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{alert.message}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activité en cours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Réceptions du jour */}
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowDown size={20} style={{ color: '#10b981' }} />
                  Réceptions du jour
                </h3>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                  {INBOUND_ORDERS.filter(o => o.date === '2025-01-29').length} prévues
                </span>
              </div>
              <div>
                {INBOUND_ORDERS.slice(0, 3).map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: `${getStatusColor(order.status)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Truck size={18} style={{ color: getStatusColor(order.status) }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{order.supplier}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.id} • {order.time} • {order.items} articles
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                      {order.dock && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Quai {order.dock}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expéditions du jour */}
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUp size={20} style={{ color: '#f59e0b' }} />
                  Expéditions du jour
                </h3>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                  {OUTBOUND_ORDERS.filter(o => o.date === '2025-01-29').length} prévues
                </span>
              </div>
              <div>
                {OUTBOUND_ORDERS.slice(0, 3).map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: `${getPriorityColor(order.priority)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={18} style={{ color: getPriorityColor(order.priority) }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{order.client}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.id} • {order.time} • {order.picked}/{order.items} préparés
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Route {order.route}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zones & Emplacements */}
      {activeTab === 'zones' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Rechercher un emplacement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: 200, color: 'var(--text-primary)' }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '0.625rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="empty">Vide</option>
                <option value="occupied">Occupé</option>
                <option value="reserved">Réservé</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { id: 'grid', icon: Grid },
                { id: 'list', icon: List },
                { id: 'map', icon: Map }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: viewMode === v.id ? 'var(--primary-color)' : 'var(--card-bg)',
                    color: viewMode === v.id ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <v.icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Zones cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {WAREHOUSE_ZONES.map(zone => {
              const occupancy = (zone.used / zone.capacity) * 100;
              const zoneLocations = STORAGE_LOCATIONS.filter(l => l.zone === zone.id);
              const emptyCount = zoneLocations.filter(l => l.status === 'empty').length;
              
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: selectedZone === zone.id ? `2px solid ${zone.color}` : '1px solid var(--border-color)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: zone.color }} />
                          <span style={{ fontWeight: 600 }}>{zone.name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{zone.id}</div>
                      </div>
                      {zone.temperature && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          background: zone.type === 'frozen' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: zone.type === 'frozen' ? '#8b5cf6' : '#3b82f6'
                        }}>
                          <Thermometer size={12} />
                          {zone.temperature.min}° / {zone.temperature.max}°
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacité</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{zone.used}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{zone.capacity}</span></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emplacements vides</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{emptyCount}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Occupation</span>
                        <span style={{ fontWeight: 600, color: occupancy > 90 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#10b981' }}>
                          {occupancy.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--hover-bg)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${occupancy}%`,
                          background: `linear-gradient(90deg, ${zone.color}, ${zone.color}80)`,
                          borderRadius: 4
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emplacements de la zone sélectionnée */}
          {selectedZone && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  Emplacements - {WAREHOUSE_ZONES.find(z => z.id === selectedZone)?.name}
                </h3>
                <button
                  onClick={() => setSelectedZone(null)}
                  style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'var(--hover-bg)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {STORAGE_LOCATIONS.filter(l => l.zone === selectedZone).map(loc => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    style={{
                      padding: '1rem',
                      background: 'var(--hover-bg)',
                      borderRadius: '10px',
                      border: `2px solid ${getStatusColor(loc.status)}40`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{loc.id}</span>
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: getStatusColor(loc.status)
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {loc.type === 'pallet' ? 'Palette' : loc.type === 'shelf' ? 'Étagère' : 'Vrac'}
                    </div>
                    {loc.product ? (
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 500 }}>{loc.product}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Qté: {loc.quantity}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.875rem', color: getStatusColor(loc.status) }}>
                        {getStatusLabel(loc.status)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Réceptions */}
      {activeTab === 'inbound' && (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Réceptions</h3>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <Plus size={18} />
                Nouvelle réception
              </button>
            </div>
            
            <div>
              {INBOUND_ORDERS.map(order => (
                <div key={order.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }} className="hover-bg">
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: `${getStatusColor(order.status)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Truck size={22} style={{ color: getStatusColor(order.status) }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{order.id}</span>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: `${getPriorityColor(order.priority)}20`,
                        color: getPriorityColor(order.priority),
                        textTransform: 'uppercase'
                      }}>
                        {order.priority}
                      </span>
                    </div>
                    <div style={{ fontWeight: 500 }}>{order.supplier}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {order.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {order.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Package size={12} /> {order.received}/{order.items} articles
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusLabel(order.status)}
                    </span>
                    {order.dock && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Quai {order.dock}
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expéditions */}
      {activeTab === 'outbound' && (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Expéditions</h3>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <Plus size={18} />
                Nouvelle expédition
              </button>
            </div>
            
            <div>
              {OUTBOUND_ORDERS.map(order => (
                <div key={order.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }} className="hover-bg">
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: `${getPriorityColor(order.priority)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={22} style={{ color: getPriorityColor(order.priority) }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{order.id}</span>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: `${getPriorityColor(order.priority)}20`,
                        color: getPriorityColor(order.priority),
                        textTransform: 'uppercase'
                      }}>
                        {order.priority}
                      </span>
                    </div>
                    <div style={{ fontWeight: 500 }}>{order.client}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {order.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Package size={12} /> {order.picked}/{order.items} préparés
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Navigation size={12} /> {order.route}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ width: 100 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progression</span>
                      <span style={{ fontWeight: 500 }}>{Math.round((order.picked / order.items) * 100)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--hover-bg)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(order.picked / order.items) * 100}%`,
                        background: getStatusColor(order.status),
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Préparation / Picking */}
      {activeTab === 'picking' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Tâches de préparation</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                  {PICKING_TASKS.filter(t => t.status === 'in_progress').length} en cours
                </span>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(100,116,139,0.15)', color: '#64748b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>
                  {PICKING_TASKS.filter(t => t.status === 'pending').length} en attente
                </span>
              </div>
            </div>
            
            <div>
              {PICKING_TASKS.map(task => (
                <div key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  background: task.status === 'in_progress' ? 'rgba(245,158,11,0.05)' : 'transparent'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: task.status === 'completed' ? 'rgba(16,185,129,0.15)' : 
                               task.status === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'var(--hover-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {task.status === 'completed' ? (
                      <Check size={20} style={{ color: '#10b981' }} />
                    ) : (
                      <span style={{ fontWeight: 700, color: task.status === 'in_progress' ? '#f59e0b' : 'var(--text-muted)' }}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{task.product}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span style={{ fontFamily: 'monospace' }}>{task.location}</span>
                      <span>Cmd: {task.order}</span>
                      {task.assignee && <span>👤 {task.assignee}</span>}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {task.picked}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{task.quantity}</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>préparés</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {task.status === 'pending' && (
                      <button style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Démarrer
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Valider
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Panel aide picking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} style={{ color: 'var(--primary-color)' }} />
                Itinéraire optimisé
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['A-01-01', 'A-02-01', 'B-01-01'].map((loc, i) => (
                  <div key={loc} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: i === 0 ? 'rgba(59,130,246,0.1)' : 'var(--hover-bg)',
                    borderRadius: '8px',
                    border: i === 0 ? '1px solid rgba(59,130,246,0.3)' : 'none'
                  }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: i === 0 ? '#3b82f6' : 'var(--border-color)',
                      color: i === 0 ? 'white' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: i === 0 ? 600 : 400 }}>{loc}</span>
                    {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#3b82f6' }}>En cours</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scan size={18} style={{ color: 'var(--primary-color)' }} />
                Scanner
              </h4>
              <div style={{
                padding: '2rem',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <QrCode size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Scannez un emplacement ou produit
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mouvements */}
      {activeTab === 'movements' && (
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Mouvements de stock</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer'
              }}>
                <Download size={18} />
                Exporter
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <Plus size={18} />
                Nouveau mouvement
              </button>
            </div>
          </div>
          
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--hover-bg)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origine</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Produit</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantité</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {INVENTORY_MOVEMENTS.map(mov => (
                  <tr key={mov.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{mov.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: mov.type === 'receipt' ? 'rgba(16,185,129,0.15)' : 
                                   mov.type === 'pick' ? 'rgba(239,68,68,0.15)' : 
                                   mov.type === 'transfer' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                        color: mov.type === 'receipt' ? '#10b981' : 
                               mov.type === 'pick' ? '#ef4444' : 
                               mov.type === 'transfer' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {mov.type === 'receipt' && <ArrowDown size={12} />}
                        {mov.type === 'pick' && <ArrowUp size={12} />}
                        {mov.type === 'transfer' && <ArrowRightLeft size={12} />}
                        {mov.type === 'adjustment' && <RefreshCw size={12} />}
                        {mov.type === 'receipt' ? 'Réception' : 
                         mov.type === 'pick' ? 'Prélèvement' : 
                         mov.type === 'transfer' ? 'Transfert' : 'Ajustement'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{mov.from}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{mov.to || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{mov.product}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: mov.quantity > 0 ? '#10b981' : '#ef4444' }}>
                      {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(mov.date).toLocaleString('fr-FR')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{mov.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventaire */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Inventaire par emplacement</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}>
                  <Printer size={18} />
                  Imprimer
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500
                }}>
                  <ClipboardCheck size={18} />
                  Nouvel inventaire
                </button>
              </div>
            </div>
            
            <div style={{ overflow: 'auto', maxHeight: 500 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emplacement</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Zone</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Produit</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantité</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {STORAGE_LOCATIONS.map(loc => (
                    <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontWeight: 500 }}>{loc.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{loc.zone}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', textTransform: 'capitalize' }}>{loc.type}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{loc.product || '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{loc.quantity || '-'}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: `${getStatusColor(loc.status)}20`,
                          color: getStatusColor(loc.status)
                        }}>
                          {getStatusLabel(loc.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Stats inventaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1.25rem 0' }}>Résumé</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Total emplacements', value: STORAGE_LOCATIONS.length, color: 'var(--text-primary)' },
                  { label: 'Occupés', value: STORAGE_LOCATIONS.filter(l => l.status === 'occupied').length, color: '#3b82f6' },
                  { label: 'Vides', value: STORAGE_LOCATIONS.filter(l => l.status === 'empty').length, color: '#10b981' },
                  { label: 'Réservés', value: STORAGE_LOCATIONS.filter(l => l.status === 'reserved').length, color: '#f59e0b' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1.25rem 0' }}>Dernier inventaire</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ fontWeight: 500 }}>28/01/2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Écarts</span>
                  <span style={{ fontWeight: 500, color: '#f59e0b' }}>3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Valeur écarts</span>
                  <span style={{ fontWeight: 500, color: '#ef4444' }}>-245,80 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-bg:hover { background: var(--hover-bg); }
      `}</style>
    </div>
  );
}

export default WMSPage;

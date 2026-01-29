import React, { useState, useMemo, useCallback } from 'react';
import { 
  ShoppingCart, Truck, Clock, CheckCircle, Package, Search, Plus, Calendar, 
  AlertCircle, X, FileText, Phone, Mail, MapPin, Download, Printer,
  TrendingUp, BarChart3, ChevronRight
} from 'lucide-react';
import { purchases, suppliers, products } from '../data/mockData';

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  received: { label: 'Reçu', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle },
  partial: { label: 'Partiel', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: AlertCircle },
  cancelled: { label: 'Annulé', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: X },
};

function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  const getSupplier = useCallback((id) => suppliers.find(s => s.id === id), []);
  const getProduct = useCallback((id) => products.find(p => p.id === id), []);
  
  const stats = useMemo(() => {
    const thisMonth = purchases.filter(p => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: purchases.length,
      totalAmount: purchases.reduce((s, p) => s + p.total, 0),
      pending: purchases.filter(p => p.status === 'pending').length,
      pendingAmount: purchases.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0),
      received: purchases.filter(p => p.status === 'received').length,
      thisMonth: thisMonth.length,
      thisMonthAmount: thisMonth.reduce((s, p) => s + p.total, 0),
      avgOrderValue: purchases.length > 0 ? purchases.reduce((s, p) => s + p.total, 0) / purchases.length : 0,
    };
  }, []);
  
  const filteredPurchases = useMemo(() => {
    let result = [...purchases];
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (supplierFilter !== 'all') result = result.filter(p => p.supplierId === supplierFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.id.toLowerCase().includes(term) || getSupplier(p.supplierId)?.name?.toLowerCase().includes(term));
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [statusFilter, supplierFilter, searchTerm, getSupplier]);

  const supplierStats = useMemo(() => {
    const stats = {};
    purchases.forEach(p => {
      if (!stats[p.supplierId]) stats[p.supplierId] = { orders: 0, total: 0 };
      stats[p.supplierId].orders++;
      stats[p.supplierId].total += p.total;
    });
    return stats;
  }, []);

  const tabs = [
    { id: 'orders', label: 'Commandes', icon: ShoppingCart, count: purchases.length },
    { id: 'reception', label: 'Réceptions', icon: Truck, count: stats.received },
    { id: 'invoices', label: 'Factures fournisseurs', icon: FileText, count: purchases.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { icon: ShoppingCart, label: 'Total achats', value: stats.total, sub: formatCurrency(stats.totalAmount), color: '#3b82f6' },
          { icon: Clock, label: 'En attente', value: stats.pending, sub: formatCurrency(stats.pendingAmount), color: '#f59e0b' },
          { icon: CheckCircle, label: 'Reçus', value: stats.received, color: '#10b981' },
          { icon: TrendingUp, label: 'Ce mois', value: stats.thisMonth, sub: formatCurrency(stats.thisMonthAmount), color: '#8b5cf6' },
          { icon: BarChart3, label: 'Panier moyen', value: formatCurrency(stats.avgOrderValue), color: '#06b6d4' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={24} /></div>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block' }}>{s.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{typeof s.value === 'number' && !s.label.includes('Panier') ? s.value : s.value}</span>
              {s.sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent', border: activeTab === tab.id ? '1px solid var(--border-color)' : '1px solid transparent', borderBottom: activeTab === tab.id ? '1px solid var(--card-bg)' : '1px solid transparent', borderRadius: '8px 8px 0 0', marginBottom: '-1px', color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === tab.id ? 600 : 400 }}>
            <tab.icon size={18} />{tab.label}
            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--hover-bg)', color: activeTab === tab.id ? 'white' : 'var(--text-muted)' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: selectedPurchase ? '0 0 60%' : '1', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'flex 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>{activeTab === 'orders' ? 'Commandes fournisseurs' : activeTab === 'reception' ? 'Réceptions en cours' : 'Factures fournisseurs'}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} style={{ padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <option value="all">Tous les fournisseurs</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="received">Reçus</option>
                <option value="partial">Partiels</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '150px' }} />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}><Plus size={18} />Nouvel achat</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                <tr style={{ background: 'var(--hover-bg)' }}>
                  {['N° Achat', 'Fournisseur', 'Date', 'Livraison', 'Articles', 'Total TTC', 'Statut', ''].map(h => <th key={h} style={{ textAlign: h.includes('Total') || h === 'Articles' ? 'right' : 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(pur => {
                  const supplier = getSupplier(pur.supplierId);
                  const config = STATUS_CONFIG[pur.status];
                  const isSelected = selectedPurchase?.id === pur.id;
                  return (
                    <tr key={pur.id} onClick={() => setSelectedPurchase(pur)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: isSelected ? 'var(--primary-color)10' : 'transparent' }} onMouseOver={(e) => !isSelected && (e.currentTarget.style.background = 'var(--hover-bg)')} onMouseOut={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '1rem 1.5rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={16} style={{ color: 'var(--text-muted)' }} /><span style={{ fontWeight: 500 }}>{pur.id}</span></div></td>
                      <td style={{ padding: '1rem 1.5rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{supplier?.name?.charAt(0)}</div><div><div style={{ fontWeight: 500 }}>{supplier?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{supplier?.contact}</div></div></div></td>
                      <td style={{ padding: '1rem 1.5rem' }}>{formatDate(pur.date)}</td>
                      <td style={{ padding: '1rem 1.5rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} style={{ color: 'var(--text-muted)' }} />{formatDate(pur.expectedDate)}</div></td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}><span style={{ background: 'var(--hover-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{pur.items.length} art.</span></td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(pur.total)}</td>
                      <td style={{ padding: '1rem 1.5rem' }}><span style={{ padding: '0.375rem 0.75rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500, background: config.bg, color: config.color, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}><config.icon size={14} />{config.label}</span></td>
                      <td style={{ padding: '1rem 1.5rem' }}><ChevronRight size={18} style={{ color: 'var(--text-muted)' }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedPurchase && (
          <div style={{ flex: '0 0 38%', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{selectedPurchase.id}</h3>
                <span style={{ padding: '0.25rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, background: STATUS_CONFIG[selectedPurchase.status].bg, color: STATUS_CONFIG[selectedPurchase.status].color }}>{STATUS_CONFIG[selectedPurchase.status].label}</span>
              </div>
              <button onClick={() => setSelectedPurchase(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--hover-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fournisseur</h4>
              {(() => {
                const supplier = getSupplier(selectedPurchase.supplierId);
                return supplier ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>{supplier.name.charAt(0)}</div>
                      <div><div style={{ fontWeight: 600 }}>{supplier.name}</div><div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{supplier.contact}</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><Phone size={14} /> {supplier.phone}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><Mail size={14} /> {supplier.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><MapPin size={14} /> {supplier.address}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{supplierStats[supplier.id]?.orders || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commandes</div></div>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(supplierStats[supplier.id]?.total || 0)}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total achats</div></div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dates</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date commande</div><div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> {formatDate(selectedPurchase.date)}</div></div>
                <div style={{ padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Livraison prévue</div><div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={14} /> {formatDate(selectedPurchase.expectedDate)}</div></div>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Articles ({selectedPurchase.items.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedPurchase.items.map((item, idx) => {
                  const product = getProduct(item.productId);
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Package size={18} style={{ color: 'var(--text-muted)' }} /><div><div style={{ fontWeight: 500 }}>{product?.name || item.productId}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} × {formatCurrency(item.unitPrice)}</div></div></div>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-secondary)' }}>Sous-total HT</span><span>{formatCurrency(selectedPurchase.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-secondary)' }}>TVA (10%)</span><span>{formatCurrency(selectedPurchase.tax)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontWeight: 700, fontSize: '1.125rem' }}><span>Total TTC</span><span style={{ color: 'var(--primary-color)' }}>{formatCurrency(selectedPurchase.total)}</span></div>
            </div>

            {selectedPurchase.notes && (
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notes</h4>
                <p style={{ margin: 0, padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.875rem' }}>{selectedPurchase.notes}</p>
              </div>
            )}

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {selectedPurchase.status === 'pending' && <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}><CheckCircle size={18} /> Marquer reçu</button>}
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 500 }}><Printer size={18} /> Imprimer</button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 500 }}><Download size={18} /> PDF</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchasesPage;

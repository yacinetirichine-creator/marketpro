import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Plus, Phone, Mail, MapPin, Star, TrendingUp, 
  Package, FileText, Calendar, ChevronRight, X, Clock, CheckCircle,
  Euro, Truck, AlertCircle, Filter, MoreHorizontal, Edit, Eye
} from 'lucide-react';
import { suppliers, purchases, products } from '../data/mockData';

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Stats globales
  const globalStats = useMemo(() => {
    const totalPurchases = purchases.reduce((s, p) => s + p.total, 0);
    const pendingOrders = purchases.filter(p => p.status === 'pending').length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    return { totalPurchases, pendingOrders, activeSuppliers, totalSuppliers: suppliers.length };
  }, []);

  // Stats par fournisseur
  const supplierStats = useMemo(() => {
    const stats = {};
    suppliers.forEach(s => {
      const supplierPurchases = purchases.filter(p => p.supplierId === s.id);
      stats[s.id] = {
        totalOrders: supplierPurchases.length,
        totalAmount: supplierPurchases.reduce((sum, p) => sum + p.total, 0),
        pendingOrders: supplierPurchases.filter(p => p.status === 'pending').length,
        lastOrder: supplierPurchases.length > 0 ? supplierPurchases.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null,
        products: products.filter(p => p.supplier === s.id).length
      };
    });
    return stats;
  }, []);

  // Catégories uniques
  const allCategories = useMemo(() => {
    const cats = new Set();
    suppliers.forEach(s => s.categories?.forEach(c => cats.add(c)));
    return Array.from(cats);
  }, []);

  // Fournisseurs filtrés
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(term) || s.contact?.toLowerCase().includes(term));
    }
    if (categoryFilter !== 'all') {
      result = result.filter(s => s.categories?.includes(categoryFilter));
    }
    return result.sort((a, b) => (supplierStats[b.id]?.totalAmount || 0) - (supplierStats[a.id]?.totalAmount || 0));
  }, [searchTerm, categoryFilter, supplierStats]);

  const getCategoryLabel = (cat) => {
    const labels = { viandes: 'Viandes', poissons: 'Poissons', fromages: 'Fromages', cremerie: 'Crèmerie', 'fruits-legumes': 'Fruits & Légumes', epicerie: 'Épicerie' };
    return labels[cat] || cat;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { icon: Building2, label: 'Fournisseurs actifs', value: globalStats.activeSuppliers, sub: `/${globalStats.totalSuppliers} total`, color: '#3b82f6' },
          { icon: Euro, label: 'Volume achats', value: formatCurrency(globalStats.totalPurchases), color: '#10b981' },
          { icon: Clock, label: 'Commandes en cours', value: globalStats.pendingOrders, color: '#f59e0b' },
          { icon: Star, label: 'Note moyenne', value: (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1), sub: '/5', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={24} /></div>
            <div><span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block' }}>{s.label}</span><span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</span>{s.sub && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.sub}</span>}</div>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Liste fournisseurs */}
        <div style={{ flex: selectedSupplier ? '0 0 55%' : '1', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'flex 0.3s' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Fournisseurs ({filteredSuppliers.length})</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                <option value="all">Toutes catégories</option>
                {allCategories.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '150px' }} />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}><Plus size={18} />Ajouter</button>
            </div>
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
            {filteredSuppliers.map(supplier => {
              const stats = supplierStats[supplier.id];
              const isSelected = selectedSupplier?.id === supplier.id;
              return (
                <div key={supplier.id} onClick={() => setSelectedSupplier(supplier)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: isSelected ? 'var(--primary-color)10' : 'transparent', transition: 'background 0.15s' }} onMouseOver={(e) => !isSelected && (e.currentTarget.style.background = 'var(--hover-bg)')} onMouseOut={(e) => !isSelected && (e.currentTarget.style.background = isSelected ? 'var(--primary-color)10' : 'transparent')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>{supplier.name.charAt(0)}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{supplier.name}</span>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '10px', fontSize: '0.6875rem', background: supplier.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: supplier.status === 'active' ? '#10b981' : '#ef4444' }}>{supplier.status === 'active' ? 'Actif' : 'Inactif'}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{supplier.contact} • {supplier.categories?.map(c => getCategoryLabel(c)).join(', ')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(stats?.totalAmount || 0)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats?.totalOrders || 0} commandes</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                      <Star size={16} fill="#f59e0b" />
                      <span style={{ fontWeight: 500 }}>{supplier.rating}</span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel détails */}
        {selectedSupplier && (
          <div style={{ flex: '0 0 43%', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>{selectedSupplier.name.charAt(0)}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedSupplier.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, background: selectedSupplier.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: selectedSupplier.status === 'active' ? '#10b981' : '#ef4444' }}>{selectedSupplier.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}><Star size={14} fill="#f59e0b" /><span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{selectedSupplier.rating}/5</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--hover-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={16} /></button>
                <button onClick={() => setSelectedSupplier(null)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--hover-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
              </div>
            </div>

            {/* Contact */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={16} style={{ color: 'var(--text-muted)' }} /></div>{selectedSupplier.contact}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} style={{ color: 'var(--text-muted)' }} /></div>{selectedSupplier.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} style={{ color: 'var(--text-muted)' }} /></div><a href={`mailto:${selectedSupplier.email}`} style={{ color: 'var(--primary-color)' }}>{selectedSupplier.email}</a></div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem' }}><div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={16} style={{ color: 'var(--text-muted)' }} /></div>{selectedSupplier.address}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statistiques</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '10px', textAlign: 'center' }}><TrendingUp size={20} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} /><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(supplierStats[selectedSupplier.id]?.totalAmount || 0)}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total achats</div></div>
                <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '10px', textAlign: 'center' }}><Package size={20} style={{ color: '#10b981', marginBottom: '0.5rem' }} /><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{supplierStats[selectedSupplier.id]?.totalOrders || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commandes</div></div>
                <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '10px', textAlign: 'center' }}><Clock size={20} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} /><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{supplierStats[selectedSupplier.id]?.pendingOrders || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>En cours</div></div>
                <div style={{ padding: '1rem', background: 'var(--hover-bg)', borderRadius: '10px', textAlign: 'center' }}><FileText size={20} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} /><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedSupplier.paymentTerms}j</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Délai paiement</div></div>
              </div>
            </div>

            {/* Conditions */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conditions commerciales</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Commande minimum</span><span style={{ fontWeight: 600 }}>{formatCurrency(selectedSupplier.minOrder)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Délai de paiement</span><span style={{ fontWeight: 600 }}>{selectedSupplier.paymentTerms} jours</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>SIRET</span><span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{selectedSupplier.siret}</span></div>
              </div>
            </div>

            {/* Livraisons */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jours de livraison</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedSupplier.deliveryDays?.map(day => (
                  <span key={day} style={{ padding: '0.5rem 0.875rem', background: 'var(--primary-color)15', color: 'var(--primary-color)', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500, textTransform: 'capitalize' }}>{day}</span>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Catégories</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedSupplier.categories?.map(cat => (
                  <span key={cat} style={{ padding: '0.5rem 0.875rem', background: 'var(--hover-bg)', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500 }}>{getCategoryLabel(cat)}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}><Plus size={18} /> Nouvelle commande</button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 500 }}><Eye size={18} /> Historique</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuppliersPage;

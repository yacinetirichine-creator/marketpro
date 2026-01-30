// ============================================
// MARKET PRO - Page Inventaire
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Calendar, Users, Package, MapPin, BarChart3,
  Plus, Search, Filter, Play, Pause, Check, X, AlertTriangle,
  Eye, Edit, Trash2, Download, RefreshCw, Loader2, CheckCircle,
  ChevronDown, ChevronRight, Calculator
} from 'lucide-react';
import api from '../services/api';

const InventoryPage = () => {

  // States
  const [inventories, setInventories] = useState([]);
  const [activeInventory, setActiveInventory] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, planned, history

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [currentCountItem, setCurrentCountItem] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoriesRes, activeRes] = await Promise.all([
        api.get('/inventory?limit=50'),
        api.get('/inventory/active')
      ]);

      setInventories(inventoriesRes.data?.data || []);
      if (activeRes.data?.length > 0) {
        setActiveInventory(activeRes.data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer un inventaire
  const createInventory = async (data) => {
    try {
      const response = await api.post('/inventory', data);
      await loadData();
      setShowCreateModal(false);
      setSelectedInventory(response.data);
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // Initialiser l'inventaire
  const initializeInventory = async (inventoryId) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/initialize`);
      setSelectedInventory(response.data.inventory);
      await loadData();
    } catch (error) {
      console.error('Erreur initialisation:', error);
    }
  };

  // Démarrer l'inventaire
  const startInventory = async (inventoryId) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/start`);
      setSelectedInventory(response.data);
      setActiveInventory(response.data);
      await loadData();
    } catch (error) {
      console.error('Erreur démarrage:', error);
    }
  };

  // Enregistrer un comptage
  const recordCount = async (inventoryId, countData) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/count`, countData);
      setSelectedInventory(response.data);
      setShowCountModal(false);
      setCurrentCountItem(null);
    } catch (error) {
      console.error('Erreur comptage:', error);
    }
  };

  // Valider un comptage
  const validateCount = async (inventoryId, countIndex, finalQty, reason) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/validate/${countIndex}`, {
        finalQty,
        reason
      });
      setSelectedInventory(response.data);
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  // Effectuer les régularisations
  const adjustInventory = async (inventoryId) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/adjust`);
      setSelectedInventory(response.data.inventory);
      await loadData();
    } catch (error) {
      console.error('Erreur régularisation:', error);
    }
  };

  // Terminer l'inventaire
  const completeInventory = async (inventoryId) => {
    try {
      const response = await api.post(`/inventory/${inventoryId}/complete`);
      setSelectedInventory(response.data);
      setActiveInventory(null);
      await loadData();
    } catch (error) {
      console.error('Erreur finalisation:', error);
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  // Styles
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--color-text)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid var(--color-border)',
      paddingBottom: '12px'
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    tabActive: {
      background: 'var(--color-primary)',
      color: 'white'
    },
    tabInactive: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-secondary)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: selectedInventory ? '1fr 1.5fr' : '1fr',
      gap: '24px'
    },
    card: {
      background: 'var(--color-surface)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      background: 'var(--color-primary)',
      color: 'white'
    },
    buttonSecondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)'
    },
    inventoryCard: {
      padding: '16px',
      borderRadius: '10px',
      background: 'var(--color-bg)',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '2px solid transparent'
    },
    inventoryCardSelected: {
      borderColor: 'var(--color-primary)'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    progressBar: {
      height: '8px',
      background: 'var(--color-bg)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    progressFill: {
      height: '100%',
      background: 'var(--color-primary)',
      transition: 'width 0.3s'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'var(--color-surface)',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    input: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      fontSize: '14px',
      width: '100%'
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLANNED': { bg: '#6B7280', text: 'white' },
      'IN_PROGRESS': { bg: '#3B82F6', text: 'white' },
      'COUNTING': { bg: '#F59E0B', text: 'white' },
      'VALIDATION': { bg: '#8B5CF6', text: 'white' },
      'ADJUSTMENT': { bg: '#EC4899', text: 'white' },
      'COMPLETED': { bg: '#10B981', text: 'white' },
      'CANCELLED': { bg: '#EF4444', text: 'white' }
    };
    return colors[status] || colors['PLANNED'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PLANNED': 'Planifié',
      'IN_PROGRESS': 'En cours',
      'COUNTING': 'Comptage',
      'VALIDATION': 'Validation',
      'ADJUSTMENT': 'Régularisation',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'FULL': 'Complet',
      'PARTIAL': 'Partiel',
      'CYCLIC': 'Tournant',
      'SPOT': 'Ponctuel'
    };
    return labels[type] || type;
  };

  // Filtrer les inventaires selon l'onglet
  const filteredInventories = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return inventories.filter(i => ['IN_PROGRESS', 'COUNTING', 'VALIDATION', 'ADJUSTMENT'].includes(i.status));
      case 'planned':
        return inventories.filter(i => i.status === 'PLANNED');
      case 'history':
        return inventories.filter(i => ['COMPLETED', 'CANCELLED'].includes(i.status));
      default:
        return inventories;
    }
  }, [inventories, activeTab]);

  // Rendu liste des inventaires
  const renderInventoryList = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ClipboardList size={20} color="var(--color-primary)" />
        {activeTab === 'active' ? 'Inventaires en cours' :
         activeTab === 'planned' ? 'Inventaires planifiés' : 'Historique'}
        <span style={{
          fontSize: '12px',
          padding: '2px 10px',
          borderRadius: '10px',
          background: 'var(--color-primary)',
          color: 'white',
          marginLeft: '8px'
        }}>
          {filteredInventories.length}
        </span>
      </h3>

      {filteredInventories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <ClipboardList size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>Aucun inventaire</p>
        </div>
      ) : (
        filteredInventories.map(inventory => (
          <div
            key={inventory._id}
            style={{
              ...styles.inventoryCard,
              ...(selectedInventory?._id === inventory._id ? styles.inventoryCardSelected : {})
            }}
            onClick={() => setSelectedInventory(inventory)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{inventory.inventoryNumber}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {getTypeLabel(inventory.type)}
                </p>
              </div>
              <span style={{
                ...styles.statusBadge,
                background: getStatusColor(inventory.status).bg,
                color: getStatusColor(inventory.status).text
              }}>
                {getStatusLabel(inventory.status)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Package size={14} />
                {inventory.stats?.countedProducts || 0} / {inventory.stats?.totalProducts || 0}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                {new Date(inventory.dates?.planned || inventory.createdAt).toLocaleDateString()}
              </span>
            </div>

            {inventory.stats?.totalProducts > 0 && (
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${(inventory.stats.countedProducts / inventory.stats.totalProducts) * 100}%`
                }} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Rendu détail inventaire
  const renderInventoryDetail = () => {
    if (!selectedInventory) return null;

    const progress = selectedInventory.stats?.totalProducts > 0
      ? Math.round((selectedInventory.stats.countedProducts / selectedInventory.stats.totalProducts) * 100)
      : 0;

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} color="var(--color-primary)" />
            {selectedInventory.inventoryNumber}
          </h3>
          <button
            style={{ ...styles.button, padding: '8px' }}
            onClick={() => setSelectedInventory(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
              {progress}%
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Progression</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>
              {selectedInventory.stats?.totalProducts || 0}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Articles</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
              {(selectedInventory.stats?.positiveVariances || 0) + (selectedInventory.stats?.negativeVariances || 0)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Écarts</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
              {selectedInventory.stats?.accuracy || 0}%
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Précision</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {selectedInventory.status === 'PLANNED' && (
            <>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => initializeInventory(selectedInventory._id)}
              >
                <RefreshCw size={18} />
                Initialiser
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => startInventory(selectedInventory._id)}
                disabled={!selectedInventory.counts?.length}
              >
                <Play size={18} />
                Démarrer
              </button>
            </>
          )}

          {['IN_PROGRESS', 'COUNTING'].includes(selectedInventory.status) && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => {
                const nextPending = selectedInventory.counts?.find(c => c.status === 'PENDING');
                if (nextPending) {
                  setCurrentCountItem(nextPending);
                  setShowCountModal(true);
                }
              }}
            >
              <Calculator size={18} />
              Continuer le comptage
            </button>
          )}

          {selectedInventory.status === 'VALIDATION' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => adjustInventory(selectedInventory._id)}
            >
              <CheckCircle size={18} />
              Effectuer les régularisations
            </button>
          )}

          {selectedInventory.status === 'ADJUSTMENT' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => completeInventory(selectedInventory._id)}
            >
              <Check size={18} />
              Terminer l'inventaire
            </button>
          )}
        </div>

        {/* Liste des comptages */}
        <h4 style={{ marginBottom: '12px' }}>
          Comptages ({selectedInventory.counts?.length || 0})
        </h4>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {selectedInventory.counts?.map((count, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'var(--color-bg)',
                borderRadius: '8px',
                marginBottom: '8px',
                borderLeft: `4px solid ${
                  count.status === 'VALIDATED' ? '#10B981' :
                  count.status === 'VARIANCE' ? '#F59E0B' :
                  count.status === 'PENDING' ? '#6B7280' : '#3B82F6'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '600' }}>
                    {count.product?.name || 'Article'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={12} style={{ marginRight: '4px' }} />
                    {count.locationCode || '-'}
                    {' | '}
                    Théorique: {count.theoreticalQty} {count.unit}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {count.countedQty !== undefined && (
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: count.variance?.quantity === 0 ? '#10B981' :
                                  count.variance?.quantity > 0 ? '#3B82F6' : '#EF4444',
                      color: 'white'
                    }}>
                      Compté: {count.countedQty}
                      {count.variance?.quantity !== 0 && (
                        <span style={{ marginLeft: '4px' }}>
                          ({count.variance?.quantity > 0 ? '+' : ''}{count.variance?.quantity})
                        </span>
                      )}
                    </span>
                  )}

                  {count.status === 'PENDING' && ['IN_PROGRESS', 'COUNTING'].includes(selectedInventory.status) && (
                    <button
                      onClick={() => {
                        setCurrentCountItem({ ...count, index });
                        setShowCountModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Compter
                    </button>
                  )}

                  {count.status === 'VARIANCE' && (
                    <button
                      onClick={() => validateCount(selectedInventory._id, index, count.countedQty, 'COUNTING_ERROR')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modal création inventaire
  const CreateInventoryModal = () => {
    const [formData, setFormData] = useState({
      type: 'FULL',
      plannedDate: new Date().toISOString().split('T')[0],
      zones: [],
      categories: []
    });

    if (!showCreateModal) return null;

    return (
      <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px' }}>Nouvel inventaire</h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Type d'inventaire</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { value: 'FULL', label: 'Complet', desc: 'Tout l\'entrepôt' },
                { value: 'PARTIAL', label: 'Partiel', desc: 'Par zone' },
                { value: 'CYCLIC', label: 'Tournant', desc: 'Hebdomadaire' },
                { value: 'SPOT', label: 'Ponctuel', desc: 'Articles spécifiques' }
              ].map(type => (
                <button
                  key={type.value}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: formData.type === type.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.type === type.value ? 'rgba(0, 212, 170, 0.1)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                >
                  <p style={{ fontWeight: '600' }}>{type.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date planifiée</label>
            <input
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              style={styles.input}
            />
          </div>

          {formData.type === 'PARTIAL' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Zones</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['F', 'S', 'C', 'Q', 'P'].map(zone => (
                  <button
                    key={zone}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: formData.zones.includes(zone) ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: formData.zones.includes(zone) ? 'white' : 'var(--color-text)'
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        zones: prev.zones.includes(zone)
                          ? prev.zones.filter(z => z !== zone)
                          : [...prev.zones, zone]
                      }));
                    }}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => createInventory({
                type: formData.type,
                dates: { planned: formData.plannedDate },
                scope: {
                  zones: formData.zones.length > 0 ? formData.zones : undefined
                }
              })}
            >
              <Plus size={18} />
              Créer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal comptage
  const CountModal = () => {
    const [countedQty, setCountedQty] = useState('');

    if (!showCountModal || !currentCountItem) return null;

    return (
      <div style={styles.modal} onClick={() => setShowCountModal(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px' }}>Comptage</h2>

          <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontWeight: '600', fontSize: '18px' }}>
              {currentCountItem.product?.name || 'Article'}
            </p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              <MapPin size={14} style={{ marginRight: '4px' }} />
              Emplacement: {currentCountItem.locationCode || '-'}
            </p>
            <p style={{ marginTop: '8px' }}>
              Quantité théorique: <strong>{currentCountItem.theoreticalQty} {currentCountItem.unit}</strong>
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Quantité comptée
            </label>
            <input
              type="number"
              value={countedQty}
              onChange={(e) => setCountedQty(e.target.value)}
              placeholder="Entrez la quantité..."
              style={{ ...styles.input, fontSize: '24px', textAlign: 'center' }}
              autoFocus
            />
          </div>

          {countedQty && parseInt(countedQty) !== currentCountItem.theoreticalQty && (
            <div style={{
              padding: '12px',
              background: '#FEF3C7',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} color="#F59E0B" />
              <span>
                Écart détecté: {parseInt(countedQty) - currentCountItem.theoreticalQty}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => {
                setShowCountModal(false);
                setCurrentCountItem(null);
              }}
            >
              Annuler
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => recordCount(selectedInventory._id, {
                product: currentCountItem.product?._id || currentCountItem.product,
                locationCode: currentCountItem.locationCode,
                theoreticalQty: currentCountItem.theoreticalQty,
                countedQty: parseInt(countedQty),
                unit: currentCountItem.unit
              })}
              disabled={!countedQty}
            >
              <Check size={18} />
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <ClipboardList size={32} color="var(--color-primary)" />
          Inventaire
        </h1>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Nouvel inventaire
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'active' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('active')}
        >
          En cours
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'planned' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('planned')}
        >
          Planifiés
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '16px' }}>Chargement...</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {renderInventoryList()}
          {selectedInventory && renderInventoryDetail()}
        </div>
      )}

      {/* Modals */}
      <CreateInventoryModal />
      <CountModal />
    </div>
  );
};

export default InventoryPage;

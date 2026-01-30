// ============================================
// MARKET PRO - Page Préparation Commandes (Picking)
// ============================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardCheck, Package, MapPin, Scan, Check, X, AlertTriangle,
  Play, Pause, Clock, User, Truck, ChevronRight, ChevronDown,
  QrCode, Camera, Search, Filter, Plus, Eye, Loader2, BarChart3,
  ArrowRight, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import pickingService from '../services/pickingService';

const PickingPage = () => {
  const { t } = useTranslation();

  // States
  const [pickingLists, setPickingLists] = useState([]);
  const [myLists, setMyLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-lists'); // my-lists, pending, all

  // Picking mode
  const [pickingMode, setPickingMode] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [pickedQty, setPickedQty] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes, pendingRes, statsRes] = await Promise.all([
        api.get('/picking?limit=50'),
        api.get('/picking/my-lists'),
        api.get('/picking/pending'),
        api.get('/picking/stats')
      ]);

      setPickingLists(allRes.data?.data || []);
      setMyLists(myRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // S'auto-assigner une liste
  const selfAssign = async (listId) => {
    try {
      const response = await api.post(`/picking/${listId}/self-assign`);
      setSelectedList(response.data);
      await loadData();
    } catch (error) {
      console.error('Erreur assignation:', error);
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  // Démarrer le picking
  const startPicking = async (listId) => {
    try {
      const response = await api.post(`/picking/${listId}/start`);
      setSelectedList(response.data);
      setPickingMode(true);
      setCurrentItemIndex(0);
      await loadData();
    } catch (error) {
      console.error('Erreur démarrage:', error);
    }
  };

  // Prélever un article
  const pickItem = async (itemIndex, qty, scannedBarcode = null) => {
    try {
      const response = await api.post(`/picking/${selectedList._id}/items/${itemIndex}/pick`, {
        pickedQty: qty,
        scannedBarcode
      });
      setSelectedList(response.data);
      setPickedQty('');

      // Passer au suivant
      const nextPending = response.data.items.findIndex((item, i) =>
        i > itemIndex && item.status === 'IN_PROGRESS'
      );
      if (nextPending >= 0) {
        setCurrentItemIndex(nextPending);
      } else {
        const firstPending = response.data.items.findIndex(item => item.status === 'PENDING');
        if (firstPending >= 0) {
          setCurrentItemIndex(firstPending);
        }
      }
    } catch (error) {
      console.error('Erreur picking:', error);
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  // Signaler un problème
  const reportIssue = async (itemIndex, issueType, description) => {
    try {
      const response = await api.post(`/picking/${selectedList._id}/items/${itemIndex}/issue`, {
        type: issueType,
        description
      });
      setSelectedList(response.data);
    } catch (error) {
      console.error('Erreur signalement:', error);
    }
  };

  // Terminer le picking
  const completePicking = async () => {
    try {
      const response = await api.post(`/picking/${selectedList._id}/complete`);
      setSelectedList(response.data);
      setPickingMode(false);
      await loadData();
    } catch (error) {
      console.error('Erreur finalisation:', error);
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  // Mettre en pause
  const pausePicking = async () => {
    try {
      const response = await api.post(`/picking/${selectedList._id}/pause`);
      setSelectedList(response.data);
      setPickingMode(false);
    } catch (error) {
      console.error('Erreur pause:', error);
    }
  };

  // Reprendre
  const resumePicking = async () => {
    try {
      const response = await api.post(`/picking/${selectedList._id}/resume`);
      setSelectedList(response.data);
      setPickingMode(true);
    } catch (error) {
      console.error('Erreur reprise:', error);
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '24px'
    },
    statCard: {
      padding: '16px',
      borderRadius: '12px',
      background: 'var(--color-surface)',
      textAlign: 'center'
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
      gridTemplateColumns: pickingMode ? '1fr' : selectedList ? '1fr 1.5fr' : '1fr',
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
    buttonDanger: {
      background: '#EF4444',
      color: 'white'
    },
    listCard: {
      padding: '16px',
      borderRadius: '10px',
      background: 'var(--color-bg)',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '2px solid transparent'
    },
    listCardSelected: {
      borderColor: 'var(--color-primary)'
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
    pickingItem: {
      padding: '24px',
      borderRadius: '16px',
      background: 'var(--color-surface)',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    bigInput: {
      padding: '20px',
      fontSize: '32px',
      textAlign: 'center',
      borderRadius: '12px',
      border: '2px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      width: '100%'
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#6B7280',
      'ASSIGNED': '#3B82F6',
      'IN_PROGRESS': '#F59E0B',
      'PAUSED': '#8B5CF6',
      'COMPLETED': '#10B981',
      'CANCELLED': '#EF4444'
    };
    return colors[status] || colors['PENDING'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'En attente',
      'ASSIGNED': 'Assigné',
      'IN_PROGRESS': 'En cours',
      'PAUSED': 'En pause',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': '#6B7280',
      'NORMAL': '#3B82F6',
      'HIGH': '#F59E0B',
      'URGENT': '#EF4444'
    };
    return colors[priority] || colors['NORMAL'];
  };

  // Filtrer les listes selon l'onglet
  const displayedLists = useMemo(() => {
    switch (activeTab) {
      case 'my-lists':
        return myLists;
      case 'pending':
        return pickingLists.filter(l => l.status === 'PENDING');
      default:
        return pickingLists;
    }
  }, [activeTab, pickingLists, myLists]);

  // Rendu stats
  const renderStats = () => (
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-primary)' }}>
          {stats?.global?.pending || 0}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>En attente</p>
      </div>
      <div style={styles.statCard}>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>
          {stats?.global?.inProgress || 0}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>En cours</p>
      </div>
      <div style={styles.statCard}>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>
          {myLists.length}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Mes listes</p>
      </div>
      <div style={styles.statCard}>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>
          {stats?.global?.totalItemsToPick || 0}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Articles à prélever</p>
      </div>
    </div>
  );

  // Rendu liste des picking
  const renderPickingLists = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ClipboardCheck size={20} color="var(--color-primary)" />
        {activeTab === 'my-lists' ? 'Mes listes' :
         activeTab === 'pending' ? 'En attente d\'assignation' : 'Toutes les listes'}
        <span style={{
          fontSize: '12px',
          padding: '2px 10px',
          borderRadius: '10px',
          background: 'var(--color-primary)',
          color: 'white',
          marginLeft: '8px'
        }}>
          {displayedLists.length}
        </span>
      </h3>

      {displayedLists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <ClipboardCheck size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>Aucune liste</p>
        </div>
      ) : (
        displayedLists.map(list => (
          <div
            key={list._id}
            style={{
              ...styles.listCard,
              ...(selectedList?._id === list._id ? styles.listCardSelected : {})
            }}
            onClick={() => setSelectedList(list)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{list.pickingNumber}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {list.orders?.length || 0} commande(s)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: getPriorityColor(list.priority),
                  color: 'white'
                }}>
                  {list.priority}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: getStatusColor(list.status),
                  color: 'white'
                }}>
                  {getStatusLabel(list.status)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Package size={14} />
                {list.stats?.pickedItems || 0} / {list.stats?.totalItems || 0}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                ~{list.route?.estimatedTime || 0} min
              </span>
            </div>

            {list.stats?.totalItems > 0 && (
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${(list.stats.pickedItems / list.stats.totalItems) * 100}%`
                }} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Rendu détail picking
  const renderPickingDetail = () => {
    if (!selectedList) return null;

    const progress = selectedList.stats?.totalItems > 0
      ? Math.round((selectedList.stats.pickedItems / selectedList.stats.totalItems) * 100)
      : 0;

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={20} color="var(--color-primary)" />
            {selectedList.pickingNumber}
          </h3>
          <button
            style={{ ...styles.button, padding: '8px' }}
            onClick={() => setSelectedList(null)}
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
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Progression</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>
              {selectedList.stats?.totalItems || 0}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Articles</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>
              {selectedList.route?.totalDistance || 0}m
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Distance</p>
          </div>
          <div style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>
              {selectedList.route?.estimatedTime || 0}min
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Temps estimé</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {selectedList.status === 'PENDING' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => selfAssign(selectedList._id)}
            >
              <User size={18} />
              Prendre cette liste
            </button>
          )}

          {selectedList.status === 'ASSIGNED' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => startPicking(selectedList._id)}
            >
              <Play size={18} />
              Démarrer le picking
            </button>
          )}

          {selectedList.status === 'IN_PROGRESS' && (
            <>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => setPickingMode(true)}
              >
                <ArrowRight size={18} />
                Continuer
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={pausePicking}
              >
                <Pause size={18} />
                Pause
              </button>
            </>
          )}

          {selectedList.status === 'PAUSED' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={resumePicking}
            >
              <Play size={18} />
              Reprendre
            </button>
          )}
        </div>

        {/* Commandes */}
        <h4 style={{ marginBottom: '12px' }}>
          Commandes ({selectedList.orders?.length || 0})
        </h4>
        <div style={{ marginBottom: '20px' }}>
          {selectedList.orders?.map((order, i) => (
            <div key={i} style={{
              padding: '10px',
              background: 'var(--color-bg)',
              borderRadius: '8px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '500' }}>{order.orderNumber}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {order.clientName}
                </p>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                background: order.deliveryMode === 'DELIVERY' ? '#3B82F6' : '#10B981',
                color: 'white'
              }}>
                {order.deliveryMode === 'DELIVERY' ? 'Livraison' : 'Retrait'}
              </span>
            </div>
          ))}
        </div>

        {/* Liste des articles */}
        <h4 style={{ marginBottom: '12px' }}>
          Articles ({selectedList.items?.length || 0})
        </h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {selectedList.items?.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'var(--color-bg)',
                borderRadius: '8px',
                marginBottom: '8px',
                borderLeft: `4px solid ${
                  item.status === 'PICKED' ? '#10B981' :
                  item.status === 'IN_PROGRESS' ? '#F59E0B' :
                  item.status === 'SHORTAGE' ? '#EF4444' :
                  '#6B7280'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: '600' }}>
                    {item.sequence}. {item.productName || 'Article'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={12} style={{ marginRight: '4px' }} />
                    {item.locationCode || '-'}
                    {' | '}
                    {item.requestedQty} {item.unit}
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: item.status === 'PICKED' ? '#10B981' :
                              item.status === 'SHORTAGE' ? '#EF4444' : '#6B7280',
                  color: 'white'
                }}>
                  {item.pickedQty || 0} / {item.requestedQty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu mode picking (plein écran)
  const renderPickingMode = () => {
    if (!pickingMode || !selectedList) return null;

    const currentItem = selectedList.items?.[currentItemIndex];
    const totalItems = selectedList.items?.length || 0;
    const pickedItems = selectedList.items?.filter(i => i.status === 'PICKED').length || 0;

    if (!currentItem || currentItem.status === 'PICKED') {
      // Trouver le prochain article à prélever
      const nextIndex = selectedList.items?.findIndex(i =>
        i.status === 'PENDING' || i.status === 'IN_PROGRESS'
      );

      if (nextIndex >= 0 && nextIndex !== currentItemIndex) {
        setCurrentItemIndex(nextIndex);
        return null;
      }

      // Tous les articles sont prélevés
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--color-bg)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <CheckCircle size={80} color="#10B981" />
          <h2 style={{ marginTop: '24px', marginBottom: '12px' }}>Picking terminé !</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {pickedItems} articles prélevés
          </p>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary, padding: '16px 32px', fontSize: '18px' }}
            onClick={completePicking}
          >
            <Check size={24} />
            Valider et terminer
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '12px' }}
            onClick={() => setPickingMode(false)}
          >
            Retour à la liste
          </button>
        </div>
      );
    }

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--color-bg)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3>{selectedList.pickingNumber}</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Article {currentItemIndex + 1} / {totalItems}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={pausePicking}
            >
              <Pause size={18} />
              Pause
            </button>
            <button
              style={{ ...styles.button, padding: '8px' }}
              onClick={() => setPickingMode(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: 'var(--color-surface)' }}>
          <div style={{
            height: '100%',
            background: 'var(--color-primary)',
            width: `${(pickedItems / totalItems) * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Location */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <MapPin size={32} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '14px', opacity: 0.8 }}>EMPLACEMENT</p>
            <p style={{ fontSize: '48px', fontWeight: '700' }}>{currentItem.locationCode || 'N/A'}</p>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>Zone {currentItem.zone}</p>
          </div>

          {/* Product info */}
          <div style={styles.pickingItem}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--color-bg)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={40} color="var(--color-text-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', fontSize: '20px', marginBottom: '4px' }}>
                  {currentItem.productName || 'Article'}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  SKU: {currentItem.sku || '-'}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Code-barres: {currentItem.barcode || '-'}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div style={{
              padding: '20px',
              background: 'var(--color-bg)',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                QUANTITÉ À PRÉLEVER
              </p>
              <p style={{ fontSize: '56px', fontWeight: '700', color: 'var(--color-primary)' }}>
                {currentItem.requestedQty}
              </p>
              <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>
                {currentItem.unit}
              </p>
            </div>

            {/* Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Quantité prélevée
              </label>
              <input
                type="number"
                value={pickedQty}
                onChange={(e) => setPickedQty(e.target.value)}
                placeholder={String(currentItem.requestedQty)}
                style={styles.bigInput}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  flex: 2,
                  justifyContent: 'center',
                  padding: '16px',
                  fontSize: '18px'
                }}
                onClick={() => pickItem(
                  currentItemIndex,
                  pickedQty ? parseInt(pickedQty) : currentItem.requestedQty
                )}
              >
                <Check size={24} />
                Valider
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.buttonDanger,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '16px'
                }}
                onClick={() => {
                  const reason = prompt('Raison du problème:');
                  if (reason) {
                    reportIssue(currentItemIndex, 'SHORTAGE', reason);
                  }
                }}
              >
                <AlertTriangle size={20} />
                Problème
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {pickingMode ? (
        renderPickingMode()
      ) : (
        <>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>
              <ClipboardCheck size={32} color="var(--color-primary)" />
              Préparation Commandes
            </h1>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={loadData}
            >
              <RefreshCw size={18} />
              Actualiser
            </button>
          </div>

          {/* Stats */}
          {renderStats()}

          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'my-lists' ? styles.tabActive : styles.tabInactive) }}
              onClick={() => setActiveTab('my-lists')}
            >
              Mes listes ({myLists.length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'pending' ? styles.tabActive : styles.tabInactive) }}
              onClick={() => setActiveTab('pending')}
            >
              En attente
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : styles.tabInactive) }}
              onClick={() => setActiveTab('all')}
            >
              Toutes
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
              {renderPickingLists()}
              {selectedList && renderPickingDetail()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PickingPage;

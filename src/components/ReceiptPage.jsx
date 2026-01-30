// ============================================
// MARKET PRO - Page Réception Marchandises avec OCR
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Package, Upload, Camera, Scan, Check, X, AlertTriangle,
  FileText, Truck, Clock, MapPin, ChevronRight, ChevronDown,
  Search, Filter, Plus, Eye, Edit, Trash2, Download,
  QrCode, BarChart3, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ocrService from '../services/ocrService';
import { generateLocationCode, suggestStorageZone } from '../services/skuService';

const ReceiptPage = () => {
  const { t } = useTranslation();

  // States
  const [receipts, setReceipts] = useState([]);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, new

  // OCR States
  const [ocrMode, setOcrMode] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // Form States
  const [newReceipt, setNewReceipt] = useState({
    supplier: '',
    deliveryNoteNumber: '',
    items: [],
    notes: ''
  });

  // Refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [receiptsRes, pendingRes, suppliersRes] = await Promise.all([
        api.get('/receipts?limit=50'),
        api.get('/receipts/pending'),
        api.get('/suppliers?status=ACTIVE')
      ]);

      setReceipts(receiptsRes.data?.data || []);
      setPendingReceipts(pendingRes.data || []);
      setSuppliers(suppliersRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion OCR
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await processOCR(file);
  };

  const handleCameraCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await processOCR(file);
  };

  const processOCR = async (file) => {
    setOcrProcessing(true);
    setOcrProgress(0);
    setOcrResult(null);

    try {
      // Initialiser l'OCR
      await ocrService.initializeOCR('fra');

      // Traiter avec prétraitement
      const result = await ocrService.recognizeWithPreprocessing(file, {
        lang: 'fra',
        parseDeliveryNote: true
      });

      setOcrResult(result);

      // Pré-remplir le formulaire si des données ont été extraites
      if (result.parsed) {
        setNewReceipt(prev => ({
          ...prev,
          deliveryNoteNumber: result.parsed.blNumber || prev.deliveryNoteNumber,
          items: result.parsed.items?.map((item, index) => ({
            ...item,
            id: `ocr-${index}`,
            status: 'PENDING'
          })) || prev.items
        }));
      }

      setActiveTab('new');
    } catch (error) {
      console.error('Erreur OCR:', error);
      alert('Erreur lors de la reconnaissance: ' + error.message);
    } finally {
      setOcrProcessing(false);
    }
  };

  // Créer une réception depuis les données OCR
  const createReceiptFromOCR = async () => {
    if (!newReceipt.supplier) {
      alert('Veuillez sélectionner un fournisseur');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/receipts/from-ocr', {
        supplier: newReceipt.supplier,
        ocrData: ocrResult.parsed,
        documentUrl: '' // URL si uploadé
      });

      await loadData();
      setSelectedReceipt(response.data);
      setActiveTab('pending');
      setOcrResult(null);
      setNewReceipt({ supplier: '', deliveryNoteNumber: '', items: [], notes: '' });
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Démarrer la réception
  const startReceipt = async (receiptId) => {
    try {
      const response = await api.post(`/receipts/${receiptId}/start`);
      setSelectedReceipt(response.data);
      await loadData();
    } catch (error) {
      console.error('Erreur démarrage:', error);
    }
  };

  // Recevoir un article
  const receiveItem = async (receiptId, itemIndex, data) => {
    try {
      const response = await api.post(`/receipts/${receiptId}/items/${itemIndex}/receive`, data);
      setSelectedReceipt(response.data);
    } catch (error) {
      console.error('Erreur réception article:', error);
    }
  };

  // Terminer la réception
  const completeReceipt = async (receiptId) => {
    try {
      const response = await api.post(`/receipts/${receiptId}/complete`);
      setSelectedReceipt(response.data);
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
      gridTemplateColumns: selectedReceipt ? '1fr 1.5fr' : '1fr',
      gap: '24px'
    },
    card: {
      background: 'var(--color-surface)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    ocrZone: {
      border: '2px dashed var(--color-border)',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    ocrZoneHover: {
      borderColor: 'var(--color-primary)',
      background: 'rgba(0, 212, 170, 0.05)'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
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
    receiptCard: {
      padding: '16px',
      borderRadius: '10px',
      background: 'var(--color-bg)',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '2px solid transparent'
    },
    receiptCardSelected: {
      borderColor: 'var(--color-primary)'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    itemRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 100px 100px 120px 100px',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      background: 'var(--color-bg)',
      marginBottom: '8px',
      alignItems: 'center'
    },
    input: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      fontSize: '14px',
      width: '100%'
    },
    select: {
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
      'DRAFT': { bg: '#6B7280', text: 'white' },
      'IN_PROGRESS': { bg: '#3B82F6', text: 'white' },
      'PENDING_QC': { bg: '#F59E0B', text: 'white' },
      'COMPLETED': { bg: '#10B981', text: 'white' },
      'CANCELLED': { bg: '#EF4444', text: 'white' }
    };
    return colors[status] || colors['DRAFT'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'PENDING_QC': 'Contrôle qualité',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  };

  // Rendu de la zone OCR
  const renderOCRZone = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Scan size={20} color="var(--color-primary)" />
        Scanner un Bon de Livraison
      </h3>

      {ocrProcessing ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
          <p>Analyse en cours... {ocrProgress}%</p>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--color-bg)',
            borderRadius: '4px',
            marginTop: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${ocrProgress}%`,
              height: '100%',
              background: 'var(--color-primary)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      ) : (
        <div
          style={styles.ocrZone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) processOCR(file);
          }}
        >
          <Upload size={48} color="var(--color-text-secondary)" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            Glissez un document ici ou cliquez pour sélectionner
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Formats acceptés: JPG, PNG, PDF
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText size={18} />
          Importer fichier
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera size={18} />
          Prendre photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraCapture}
      />

      {/* Résultat OCR */}
      {ocrResult && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#10B981" />
            Données extraites
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '10px',
              background: ocrResult.confidence > 70 ? '#10B981' : '#F59E0B',
              color: 'white',
              marginLeft: '8px'
            }}>
              {Math.round(ocrResult.confidence)}% confiance
            </span>
          </h4>

          <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>N° BL</label>
              <p style={{ fontWeight: '600' }}>{ocrResult.parsed?.blNumber || 'Non détecté'}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Date</label>
              <p style={{ fontWeight: '600' }}>
                {ocrResult.parsed?.date ? new Date(ocrResult.parsed.date).toLocaleDateString() : 'Non détectée'}
              </p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Articles détectés</label>
              <p style={{ fontWeight: '600' }}>{ocrResult.parsed?.items?.length || 0} articles</p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                Fournisseur *
              </label>
              <select
                style={styles.select}
                value={newReceipt.supplier}
                onChange={(e) => setNewReceipt({ ...newReceipt, supplier: e.target.value })}
              >
                <option value="">-- Sélectionner --</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.company?.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              style={{ ...styles.button, ...styles.buttonPrimary, width: '100%', marginTop: '16px', justifyContent: 'center' }}
              onClick={createReceiptFromOCR}
              disabled={!newReceipt.supplier}
            >
              <Plus size={18} />
              Créer la réception
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Rendu liste des réceptions
  const renderReceiptsList = () => {
    const displayReceipts = activeTab === 'pending' ? pendingReceipts : receipts;

    return (
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} color="var(--color-primary)" />
          {activeTab === 'pending' ? 'Réceptions en attente' : 'Toutes les réceptions'}
          <span style={{
            fontSize: '12px',
            padding: '2px 10px',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            color: 'white',
            marginLeft: '8px'
          }}>
            {displayReceipts.length}
          </span>
        </h3>

        {displayReceipts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            <Package size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>Aucune réception</p>
          </div>
        ) : (
          displayReceipts.map(receipt => (
            <div
              key={receipt._id}
              style={{
                ...styles.receiptCard,
                ...(selectedReceipt?._id === receipt._id ? styles.receiptCardSelected : {})
              }}
              onClick={() => setSelectedReceipt(receipt)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '16px' }}>{receipt.receiptNumber}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {receipt.supplier?.company?.name || 'Fournisseur inconnu'}
                  </p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(receipt.status).bg,
                  color: getStatusColor(receipt.status).text
                }}>
                  {getStatusLabel(receipt.status)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} />
                  BL: {receipt.deliveryNote?.number || '-'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={14} />
                  {receipt.totals?.receivedItems || 0} / {receipt.totals?.expectedItems || 0} articles
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Rendu détail réception
  const renderReceiptDetail = () => {
    if (!selectedReceipt) return null;

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--color-primary)" />
            {selectedReceipt.receiptNumber}
          </h3>
          <button
            style={{ ...styles.button, padding: '8px' }}
            onClick={() => setSelectedReceipt(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Infos générales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px',
          background: 'var(--color-bg)',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Fournisseur</label>
            <p style={{ fontWeight: '600' }}>{selectedReceipt.supplier?.company?.name}</p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>N° BL</label>
            <p style={{ fontWeight: '600' }}>{selectedReceipt.deliveryNote?.number || '-'}</p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Statut</label>
            <span style={{
              ...styles.statusBadge,
              background: getStatusColor(selectedReceipt.status).bg,
              color: getStatusColor(selectedReceipt.status).text
            }}>
              {getStatusLabel(selectedReceipt.status)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {selectedReceipt.status === 'DRAFT' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => startReceipt(selectedReceipt._id)}
            >
              <Check size={18} />
              Démarrer la réception
            </button>
          )}
          {selectedReceipt.status === 'IN_PROGRESS' && (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => completeReceipt(selectedReceipt._id)}
            >
              <CheckCircle size={18} />
              Terminer la réception
            </button>
          )}
        </div>

        {/* Liste des articles */}
        <h4 style={{ marginBottom: '12px' }}>Articles ({selectedReceipt.items?.length || 0})</h4>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {selectedReceipt.items?.map((item, index) => (
            <ReceiptItemRow
              key={index}
              item={item}
              index={index}
              receiptId={selectedReceipt._id}
              receiptStatus={selectedReceipt.status}
              onReceive={receiveItem}
            />
          ))}
        </div>

        {/* Totaux */}
        {selectedReceipt.totals && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--color-bg)',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Articles attendus</label>
              <p style={{ fontWeight: '600', fontSize: '18px' }}>{selectedReceipt.totals.totalExpectedQty}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Articles reçus</label>
              <p style={{ fontWeight: '600', fontSize: '18px', color: '#10B981' }}>{selectedReceipt.totals.totalReceivedQty}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Acceptés</label>
              <p style={{ fontWeight: '600', fontSize: '18px', color: '#3B82F6' }}>{selectedReceipt.totals.totalAcceptedQty}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Rejetés</label>
              <p style={{ fontWeight: '600', fontSize: '18px', color: '#EF4444' }}>{selectedReceipt.totals.totalRejectedQty}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Truck size={32} color="var(--color-primary)" />
          Réception Marchandises
        </h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'pending' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('pending')}
        >
          En attente ({pendingReceipts.length})
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('all')}
        >
          Toutes les réceptions
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'new' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('new')}
        >
          <Plus size={16} style={{ marginRight: '4px' }} />
          Nouvelle réception
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
          {activeTab === 'new' ? (
            renderOCRZone()
          ) : (
            renderReceiptsList()
          )}

          {selectedReceipt && renderReceiptDetail()}
        </div>
      )}
    </div>
  );
};

// Composant ligne d'article
const ReceiptItemRow = ({ item, index, receiptId, receiptStatus, onReceive }) => {
  const [editing, setEditing] = useState(false);
  const [receivedQty, setReceivedQty] = useState(item.receivedQuantity || item.expectedQuantity || 0);
  const [locationCode, setLocationCode] = useState(item.locationCode || '');

  const handleReceive = () => {
    onReceive(receiptId, index, {
      receivedQuantity: receivedQty,
      acceptedQuantity: receivedQty,
      locationCode
    });
    setEditing(false);
  };

  const getItemStatusColor = (status) => {
    const colors = {
      'PENDING': '#6B7280',
      'RECEIVED': '#3B82F6',
      'STORED': '#10B981',
      'REJECTED': '#EF4444'
    };
    return colors[status] || colors['PENDING'];
  };

  return (
    <div style={{
      padding: '12px',
      borderRadius: '8px',
      background: 'var(--color-bg)',
      marginBottom: '8px',
      borderLeft: `4px solid ${getItemStatusColor(item.status)}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600' }}>{item.description || item.product?.name || 'Article'}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Réf: {item.supplierRef || '-'} | Attendu: {item.expectedQuantity} {item.unit}
          </p>
        </div>

        {editing ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={receivedQty}
              onChange={(e) => setReceivedQty(parseFloat(e.target.value))}
              style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
            />
            <input
              type="text"
              placeholder="F-A-01-01"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value.toUpperCase())}
              style={{ width: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
            />
            <button
              onClick={handleReceive}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#10B981', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#6B7280', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {item.status === 'STORED' && (
              <span style={{ fontSize: '12px', color: '#10B981' }}>
                <MapPin size={14} style={{ marginRight: '4px' }} />
                {item.locationCode}
              </span>
            )}
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              background: getItemStatusColor(item.status),
              color: 'white'
            }}>
              {item.receivedQuantity || 0} / {item.expectedQuantity}
            </span>
            {receiptStatus === 'IN_PROGRESS' && item.status === 'PENDING' && (
              <button
                onClick={() => setEditing(true)}
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
                Recevoir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPage;

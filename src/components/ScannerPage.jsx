import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Scan, Camera, Upload, X, Check, AlertCircle, Package, 
  Plus, Minus, ShoppingCart, FileText, Search, History, Zap,
  Volume2, VolumeX, Settings, RefreshCw, Smartphone, Monitor,
  QrCode, Image, Eye, Trash2, Save, Printer
} from 'lucide-react';
import { products, clients } from '../data/mockData';

const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

// Simulation de codes-barres pour les produits
const PRODUCT_BARCODES = {
  '3760001234567': 'PROD001',
  '3760001234574': 'PROD002',
  '3760001234581': 'PROD003',
  '3760001234598': 'PROD004',
  '3760001234604': 'PROD005',
  '3760001234611': 'PROD006',
  '3760001234628': 'PROD007',
  '3760001234635': 'PROD008'
};

// Historique des scans mockés
const SCAN_HISTORY = [
  { id: 1, barcode: '3760001234567', product: 'PROD001', type: 'entry', quantity: 50, date: '2025-01-29T10:30:00', user: 'Lucas Moreau' },
  { id: 2, barcode: '3760001234574', product: 'PROD002', type: 'exit', quantity: 10, date: '2025-01-29T09:15:00', user: 'Lucas Moreau' },
  { id: 3, barcode: '3760001234581', product: 'PROD003', type: 'inventory', quantity: 75, date: '2025-01-28T16:45:00', user: 'Marie Martin' },
  { id: 4, barcode: '3760001234598', product: 'PROD004', type: 'entry', quantity: 30, date: '2025-01-28T14:20:00', user: 'Lucas Moreau' },
];

function ScannerPage() {
  const [mode, setMode] = useState('scan'); // scan, ocr, cart, history
  const [scanInput, setScanInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [operationType, setOperationType] = useState('exit'); // entry, exit, inventory
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [scanHistory, setScanHistory] = useState(SCAN_HISTORY);
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  
  // Focus auto sur l'input pour la douchette
  useEffect(() => {
    if (mode === 'scan' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);
  
  // Son de scan
  const playSound = (type) => {
    if (!soundEnabled) return;
    const audio = new Audio();
    audio.volume = 0.3;
    if (type === 'success') {
      // Beep court
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1000;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => osc.stop(), 100);
    } else if (type === 'error') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 300;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => osc.stop(), 300);
    }
  };
  
  // Notification temporaire
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Traitement du scan
  const handleScan = (barcode) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    
    const productId = PRODUCT_BARCODES[cleanBarcode];
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        playSound('success');
        setScannedProduct({ ...product, barcode: cleanBarcode });
        showNotification(`Produit trouvé: ${product.name}`, 'success');
        
        if (autoMode && operationType === 'exit') {
          // Ajout auto au panier
          addToCart(product, 1);
        }
      }
    } else {
      playSound('error');
      showNotification('Code-barres non reconnu', 'error');
      setScannedProduct(null);
    }
    
    setScanInput('');
  };
  
  // Gestion de l'input douchette (détection Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleScan(scanInput);
    }
  };
  
  // Ajout au panier
  const addToCart = (product, qty = quantity) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: qty }]);
    }
    showNotification(`${product.name} ajouté au panier`, 'success');
    setQuantity(1);
  };
  
  // Retrait du panier
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };
  
  // Modification quantité panier
  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };
  
  // Total panier
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  // Enregistrer le mouvement de stock
  const saveStockMovement = () => {
    const movement = {
      id: Date.now(),
      type: operationType,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        barcode: item.barcode || 'N/A'
      })),
      client: selectedClient,
      date: new Date().toISOString(),
      user: 'Utilisateur actuel',
      total: operationType === 'exit' ? cartTotal : null
    };
    
    // Ajout à l'historique
    setScanHistory([
      ...cart.map((item, idx) => ({
        id: Date.now() + idx,
        barcode: item.barcode || 'N/A',
        product: item.id,
        type: operationType,
        quantity: item.quantity,
        date: new Date().toISOString(),
        user: 'Utilisateur actuel'
      })),
      ...scanHistory
    ]);
    
    showNotification(`Mouvement de stock enregistré (${cart.length} articles)`, 'success');
    setCart([]);
    setSelectedClient(null);
  };
  
  // Simulation OCR
  const handleOCR = async (imageFile) => {
    setOcrProcessing(true);
    setOcrResult(null);
    
    // Simulation de traitement OCR
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Résultat simulé
    const mockOCRResult = {
      rawText: `BON DE LIVRAISON N° BL-2025-0142
Date: 29/01/2025

Fournisseur: METRO France
SIRET: 123 456 789 00012

Articles:
- Entrecôte de bœuf x 10 kg - 189.00€
- Côte de porc x 15 kg - 112.50€
- Saumon frais x 8 kg - 144.00€

Total HT: 445.50€
TVA 5.5%: 24.50€
Total TTC: 470.00€`,
      extractedData: {
        documentType: 'delivery_note',
        documentNumber: 'BL-2025-0142',
        date: '2025-01-29',
        supplier: 'METRO France',
        siret: '123456789 00012',
        items: [
          { name: 'Entrecôte de bœuf', quantity: 10, unit: 'kg', price: 189.00 },
          { name: 'Côte de porc', quantity: 15, unit: 'kg', price: 112.50 },
          { name: 'Saumon frais', quantity: 8, unit: 'kg', price: 144.00 }
        ],
        totalHT: 445.50,
        tva: 24.50,
        totalTTC: 470.00
      },
      confidence: 0.94,
      barcodes: ['3760001234567', '3760001234574']
    };
    
    setOcrResult(mockOCRResult);
    setOcrProcessing(false);
    showNotification('Document analysé avec succès', 'success');
  };
  
  // Upload d'image pour OCR
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOcrImage(event.target.result);
        handleOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Recherche manuelle de produit
  const handleManualSearch = (term) => {
    setManualSearch(term);
    if (term.length >= 2) {
      const results = products.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.id.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  
  // Import des données OCR vers le stock
  const importOCRToStock = () => {
    if (!ocrResult?.extractedData?.items) return;
    
    const newHistory = ocrResult.extractedData.items.map((item, idx) => ({
      id: Date.now() + idx,
      barcode: ocrResult.barcodes?.[idx] || 'OCR-IMPORT',
      product: item.name,
      type: 'entry',
      quantity: item.quantity,
      date: new Date().toISOString(),
      user: 'Import OCR'
    }));
    
    setScanHistory([...newHistory, ...scanHistory]);
    showNotification('Données importées dans le stock', 'success');
    setOcrResult(null);
    setOcrImage(null);
    setMode('history');
  };
  
  const getOperationLabel = (type) => {
    const labels = { entry: 'Entrée stock', exit: 'Sortie stock', inventory: 'Inventaire' };
    return labels[type] || type;
  };
  
  const getOperationColor = (type) => {
    const colors = { entry: '#10b981', exit: '#ef4444', inventory: '#3b82f6' };
    return colors[type] || '#64748b';
  };

  return (
    <div className="scanner-page">
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}
      
      {/* Header avec modes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'scan', icon: Scan, label: 'Scanner' },
            { id: 'ocr', icon: FileText, label: 'OCR' },
            { id: 'cart', icon: ShoppingCart, label: `Panier (${cart.length})` },
            { id: 'history', icon: History, label: 'Historique' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: mode === m.id ? 'var(--primary-color)' : 'var(--card-bg)',
                color: mode === m.id ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <m.icon size={18} />
              {m.label}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: soundEnabled ? 'var(--primary-color)' : 'var(--text-muted)'
            }}
            title={soundEnabled ? 'Son activé' : 'Son désactivé'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: autoMode ? 'rgba(16,185,129,0.15)' : 'var(--card-bg)',
            border: `1px solid ${autoMode ? '#10b981' : 'var(--border-color)'}`,
            borderRadius: '10px',
            cursor: 'pointer'
          }} onClick={() => setAutoMode(!autoMode)}>
            <Zap size={16} style={{ color: autoMode ? '#10b981' : 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Auto</span>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Zone principale */}
        <div style={{ flex: '1', minWidth: 0 }}>
          {/* Mode Scanner */}
          {mode === 'scan' && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              {/* Type d'opération */}
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Type d'opération</h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { id: 'exit', icon: Minus, label: 'Sortie', color: '#ef4444' },
                    { id: 'entry', icon: Plus, label: 'Entrée', color: '#10b981' },
                    { id: 'inventory', icon: RefreshCw, label: 'Inventaire', color: '#3b82f6' }
                  ].map(op => (
                    <button
                      key={op.id}
                      onClick={() => setOperationType(op.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: operationType === op.id ? `2px solid ${op.color}` : '1px solid var(--border-color)',
                        background: operationType === op.id ? `${op.color}15` : 'transparent',
                        color: operationType === op.id ? op.color : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      <op.icon size={20} />
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Zone de scan */}
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getOperationColor(operationType)}30, ${getOperationColor(operationType)}10)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Scan size={48} style={{ color: getOperationColor(operationType) }} />
                </div>
                
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Scanner un code-barres</h2>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0' }}>
                  Utilisez votre douchette ou saisissez le code manuellement
                </p>
                
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'var(--input-bg)',
                    border: '2px solid var(--primary-color)',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <QrCode size={24} style={{ color: 'var(--primary-color)' }} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Code-barres (EAN-13, EAN-8, Code 128...)"
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        fontSize: '1.125rem',
                        outline: 'none',
                        color: 'var(--text-primary)'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleScan(scanInput)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      Valider
                    </button>
                  </div>
                  
                  {/* Recherche manuelle */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px'
                    }}>
                      <Search size={18} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={manualSearch}
                        onChange={(e) => handleManualSearch(e.target.value)}
                        placeholder="Ou rechercher un produit..."
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    
                    {/* Résultats recherche */}
                    {searchResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        marginTop: '0.5rem',
                        maxHeight: 250,
                        overflow: 'auto',
                        zIndex: 10,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                      }}>
                        {searchResults.map(product => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setScannedProduct(product);
                              setManualSearch('');
                              setSearchResults([]);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.875rem 1rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color)'
                            }}
                            className="hover-bg"
                          >
                            <Package size={18} style={{ color: 'var(--text-muted)' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.id} • Stock: {product.stock}</div>
                            </div>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Codes de test */}
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--hover-bg)', borderRadius: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>Codes de test :</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.keys(PRODUCT_BARCODES).slice(0, 4).map(code => (
                      <button
                        key={code}
                        onClick={() => handleScan(code)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Produit scanné */}
              {scannedProduct && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }}>
                      {scannedProduct.name.charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.25rem 0' }}>{scannedProduct.name}</h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <span>Réf: {scannedProduct.id}</span>
                        <span>Stock: {scannedProduct.stock} {scannedProduct.unit}</span>
                        <span>DLC: {scannedProduct.dlc}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {formatCurrency(scannedProduct.price)} / {scannedProduct.unit}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', borderRadius: '10px', padding: '0.25rem' }}>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          style={{ width: 36, height: 36, borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={18} />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ width: 60, textAlign: 'center', border: 'none', background: 'transparent', fontSize: '1.125rem', fontWeight: 600 }}
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          style={{ width: 36, height: 36, borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => addToCart(scannedProduct, quantity)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.875rem 1.5rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: getOperationColor(operationType),
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <ShoppingCart size={18} />
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mode OCR */}
          {mode === 'ocr' && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0 }}>Reconnaissance de documents (OCR)</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Importez un bon de livraison, facture ou document pour extraction automatique
                </p>
              </div>
              
              <div style={{ padding: '2rem' }}>
                {!ocrImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '16px',
                      padding: '3rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="hover-border-primary"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'var(--primary-color)15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <Upload size={32} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Importer un document</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      Glissez-déposez ou cliquez pour sélectionner<br />
                      <span style={{ fontSize: '0.75rem' }}>Formats: JPG, PNG, PDF</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Image uploadée */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div style={{ flex: '0 0 300px' }}>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={ocrImage} alt="Document" style={{ width: '100%', display: 'block' }} />
                          <button
                            onClick={() => { setOcrImage(null); setOcrResult(null); }}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Résultat OCR */}
                      <div style={{ flex: 1 }}>
                        {ocrProcessing ? (
                          <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              border: '3px solid var(--border-color)',
                              borderTopColor: 'var(--primary-color)',
                              animation: 'spin 1s linear infinite',
                              margin: '0 auto 1rem'
                            }} />
                            <p style={{ color: 'var(--text-muted)' }}>Analyse en cours...</p>
                          </div>
                        ) : ocrResult ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h4 style={{ margin: 0 }}>Données extraites</h4>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(16,185,129,0.15)',
                                color: '#10b981',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}>
                                Confiance: {(ocrResult.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                                <span style={{ fontWeight: 500 }}>Bon de livraison</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>N°</span>
                                <span style={{ fontWeight: 500 }}>{ocrResult.extractedData.documentNumber}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Fournisseur</span>
                                <span style={{ fontWeight: 500 }}>{ocrResult.extractedData.supplier}</span>
                              </div>
                            </div>
                            
                            <h5 style={{ margin: '0 0 0.75rem 0' }}>Articles détectés</h5>
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                              {ocrResult.extractedData.items.map((item, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.75rem 1rem',
                                  borderBottom: idx < ocrResult.extractedData.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} {item.unit}</div>
                                  </div>
                                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--primary-color)10', borderRadius: '10px', marginBottom: '1.5rem' }}>
                              <span style={{ fontWeight: 600 }}>Total TTC</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                                {formatCurrency(ocrResult.extractedData.totalTTC)}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                onClick={importOCRToStock}
                                style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem',
                                  padding: '0.875rem',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: 'var(--primary-color)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                <Save size={18} />
                                Importer dans le stock
                              </button>
                              <button
                                onClick={() => { setOcrImage(null); setOcrResult(null); }}
                                style={{
                                  padding: '0.875rem 1.25rem',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-color)',
                                  background: 'transparent',
                                  cursor: 'pointer'
                                }}
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Mode Panier */}
          {mode === 'cart' && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Panier - {getOperationLabel(operationType)}</h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cart.length} article(s)</p>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      background: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Vider
                  </button>
                )}
              </div>
              
              {cart.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <ShoppingCart size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Panier vide - Scannez des produits pour commencer</p>
                </div>
              ) : (
                <div>
                  {/* Sélection client (pour sortie) */}
                  {operationType === 'exit' && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Client</label>
                      <select
                        value={selectedClient?.id || ''}
                        onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="">Vente comptoir (sans client)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Liste articles */}
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '10px',
                          background: 'var(--hover-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Package size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatCurrency(item.price)} / {item.unit}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            style={{ width: 32, height: 32, borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            style={{ width: 32, height: 32, borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div style={{ width: 100, textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ width: 32, height: 32, borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total et actions */}
                  <div style={{ padding: '1.5rem', background: 'var(--hover-bg)' }}>
                    {operationType === 'exit' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '10px' }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(cartTotal)}</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={saveStockMovement}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: getOperationColor(operationType),
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        <Check size={20} />
                        Valider {getOperationLabel(operationType)}
                      </button>
                      <button
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mode Historique */}
          {mode === 'history' && (
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0 }}>Historique des scans</h3>
              </div>
              
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                {scanHistory.map(scan => {
                  const product = products.find(p => p.id === scan.product);
                  return (
                    <div key={scan.id} style={{
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
                        background: `${getOperationColor(scan.type)}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {scan.type === 'entry' && <Plus size={18} style={{ color: getOperationColor(scan.type) }} />}
                        {scan.type === 'exit' && <Minus size={18} style={{ color: getOperationColor(scan.type) }} />}
                        {scan.type === 'inventory' && <RefreshCw size={18} style={{ color: getOperationColor(scan.type) }} />}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{product?.name || scan.product}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {scan.barcode} • {scan.user}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: getOperationColor(scan.type) }}>
                          {scan.type === 'entry' ? '+' : scan.type === 'exit' ? '-' : ''}{scan.quantity}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(scan.date).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Panel latéral - Stats rapides */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aujourd'hui</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scans</span>
                <span style={{ fontWeight: 600 }}>{scanHistory.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Entrées</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>+{scanHistory.filter(s => s.type === 'entry').reduce((sum, s) => sum + s.quantity, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sorties</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>-{scanHistory.filter(s => s.type === 'exit').reduce((sum, s) => sum + s.quantity, 0)}</span>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raccourcis</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <kbd style={{ padding: '0.25rem 0.5rem', background: 'var(--card-bg)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>Enter</kbd>
                <span>Valider scan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <kbd style={{ padding: '0.25rem 0.5rem', background: 'var(--card-bg)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>F2</kbd>
                <span>Mode entrée</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <kbd style={{ padding: '0.25rem 0.5rem', background: 'var(--card-bg)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>F3</kbd>
                <span>Mode sortie</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <kbd style={{ padding: '0.25rem 0.5rem', background: 'var(--card-bg)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>F4</kbd>
                <span>Voir panier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .hover-bg:hover { background: var(--hover-bg); }
        .hover-border-primary:hover { border-color: var(--primary-color); }
      `}</style>
    </div>
  );
}

export default ScannerPage;

// ============================================
// MARKET PRO - Portail Client (Commande en ligne)
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart, Search, Filter, Package, Plus, Minus, Trash2,
  Truck, Store, Clock, MapPin, CreditCard, Check, X, Heart,
  Star, ChevronDown, ChevronRight, Grid3X3, List, Loader2,
  Calendar, Phone, Mail, User, ShoppingBag, History, FileText
} from 'lucide-react';
import api from '../services/api';

const ClientOrderPortal = () => {

  // States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Page state
  const [currentPage, setCurrentPage] = useState('catalog'); // catalog, cart, checkout, orders

  // Checkout state
  const [deliveryMode, setDeliveryMode] = useState('DELIVERY'); // DELIVERY, PICKUP
  const [deliverySlot, setDeliverySlot] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Client info (simulé)
  const [clientInfo] = useState({
    name: 'Restaurant Le Zinc',
    email: 'contact@lezinc.fr',
    phone: '01 23 45 67 89',
    address: '123 Rue de la Gastronomie, 75001 Paris',
    creditLimit: 5000,
    balance: 1250
  });

  // Orders history
  const [orders, setOrders] = useState([]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        api.get('/products?isActive=true&isVisible=true&limit=200'),
        api.get('/categories?format=flat&visibleOnly=true'),
        api.get('/orders?limit=20')
      ]);

      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data || []);
      setOrders(ordersRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' ||
        p.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Gestion du panier
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => setCart([]);

  // Calculs panier
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (item.product.pricing?.sellingPrice || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Passer commande
  const submitOrder = async () => {
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.pricing?.sellingPrice
        })),
        deliveryMode,
        deliverySlot,
        deliveryAddress: deliveryMode === 'DELIVERY' ? deliveryAddress : undefined,
        notes: ''
      };

      await api.post('/orders', orderData);
      clearCart();
      await loadData();
      setCurrentPage('orders');
      alert('Commande passée avec succès !');
    } catch (error) {
      console.error('Erreur commande:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  // Générer les créneaux de livraison
  const deliverySlots = useMemo(() => {
    const slots = [];
    const today = new Date();

    for (let d = 1; d <= 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);

      const daySlots = [
        { startTime: '08:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '16:00' },
        { startTime: '16:00', endTime: '18:00' }
      ];

      daySlots.forEach(slot => {
        slots.push({
          date: date.toISOString().split('T')[0],
          ...slot,
          label: `${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} ${slot.startTime}-${slot.endTime}`
        });
      });
    }

    return slots;
  }, []);

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--color-bg)'
    },
    header: {
      padding: '16px 24px',
      background: 'var(--color-surface)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    logo: {
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    nav: {
      display: 'flex',
      gap: '24px'
    },
    navItem: {
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    navItemActive: {
      background: 'rgba(0, 212, 170, 0.1)',
      color: 'var(--color-primary)'
    },
    cartButton: {
      padding: '10px 20px',
      borderRadius: '25px',
      background: 'var(--color-primary)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      position: 'relative'
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#EF4444',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700'
    },
    main: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    sidebar: {
      width: '250px',
      background: 'var(--color-surface)',
      borderRadius: '12px',
      padding: '16px',
      position: 'sticky',
      top: '100px',
      height: 'fit-content'
    },
    content: {
      flex: 1
    },
    searchBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px'
    },
    searchInput: {
      flex: 1,
      padding: '12px 16px',
      paddingLeft: '44px',
      borderRadius: '25px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      fontSize: '14px'
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '20px'
    },
    productCard: {
      background: 'var(--color-surface)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s',
      cursor: 'pointer'
    },
    productImage: {
      height: '160px',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    productInfo: {
      padding: '16px'
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
    categoryItem: {
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    categoryItemActive: {
      background: 'rgba(0, 212, 170, 0.1)',
      color: 'var(--color-primary)'
    },
    cartSidebar: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '400px',
      background: 'var(--color-surface)',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column'
    },
    input: {
      padding: '12px 14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      fontSize: '14px',
      width: '100%'
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getCategoryName = (code) => {
    const cat = categories.find(c => c.code === code);
    return cat?.name || code;
  };

  // Rendu header
  const renderHeader = () => (
    <header style={styles.header}>
      <div style={styles.logo}>
        <ShoppingBag size={28} />
        MarketPro
      </div>

      <nav style={styles.nav}>
        <div
          style={{
            ...styles.navItem,
            ...(currentPage === 'catalog' ? styles.navItemActive : {})
          }}
          onClick={() => setCurrentPage('catalog')}
        >
          <Package size={18} />
          Catalogue
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(currentPage === 'orders' ? styles.navItemActive : {})
          }}
          onClick={() => setCurrentPage('orders')}
        >
          <History size={18} />
          Mes commandes
        </div>
        <div style={styles.navItem}>
          <User size={18} />
          {clientInfo.name}
        </div>
      </nav>

      <button
        style={styles.cartButton}
        onClick={() => setCurrentPage('cart')}
      >
        <ShoppingCart size={20} />
        {formatPrice(cartTotal)}
        {cartItemsCount > 0 && (
          <span style={styles.cartBadge}>{cartItemsCount}</span>
        )}
      </button>
    </header>
  );

  // Rendu catalogue
  const renderCatalog = () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Sidebar catégories */}
      <div style={styles.sidebar}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Catégories</h3>

        <div
          style={{
            ...styles.categoryItem,
            ...(selectedCategory === 'ALL' ? styles.categoryItemActive : {})
          }}
          onClick={() => setSelectedCategory('ALL')}
        >
          <Grid3X3 size={16} />
          Tous les produits
        </div>

        {categories.map(cat => (
          <div
            key={cat._id}
            style={{
              ...styles.categoryItem,
              ...(selectedCategory === cat.code ? styles.categoryItemActive : {})
            }}
            onClick={() => setSelectedCategory(cat.code)}
          >
            <Package size={16} />
            {cat.name}
          </div>
        ))}
      </div>

      {/* Contenu */}
      <div style={styles.content}>
        {/* Barre de recherche */}
        <div style={styles.searchBar}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)'
            }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Grille produits */}
        <div style={styles.productGrid}>
          {filteredProducts.map(product => (
            <div
              key={product._id}
              style={styles.productCard}
              onClick={() => addToCart(product)}
            >
              <div style={styles.productImage}>
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Package size={64} color="var(--color-text-secondary)" style={{ opacity: 0.3 }} />
                )}
              </div>

              <div style={styles.productInfo}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  {getCategoryName(product.category)}
                </p>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.3' }}>
                  {product.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {formatPrice(product.pricing?.sellingPrice || 0)}
                  </p>
                  <span style={{
                    fontSize: '11px',
                    color: product.stockStatus === 'IN_STOCK' ? '#10B981' : '#EF4444'
                  }}>
                    {product.stock?.quantity > 0 ? 'En stock' : 'Rupture'}
                  </span>
                </div>

                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '12px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  disabled={product.stock?.quantity <= 0}
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
            <Package size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  );

  // Rendu panier
  const renderCart = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={() => setCurrentPage('catalog')}
        >
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          Retour
        </button>
        <h2>Mon panier ({cartItemsCount} articles)</h2>
      </div>

      {cart.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'var(--color-surface)',
          borderRadius: '12px'
        }}>
          <ShoppingCart size={64} color="var(--color-text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Votre panier est vide</p>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '16px' }}
            onClick={() => setCurrentPage('catalog')}
          >
            Voir le catalogue
          </button>
        </div>
      ) : (
        <>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            {cart.map(item => (
              <div
                key={item.product._id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'var(--color-bg)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={24} color="var(--color-text-secondary)" />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{item.product.name}</p>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {formatPrice(item.product.pricing?.sellingPrice)} / {item.product.stock?.unit || 'pièce'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </span>
                  <button
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p style={{ width: '100px', textAlign: 'right', fontWeight: '700' }}>
                  {formatPrice(item.product.pricing?.sellingPrice * item.quantity)}
                </p>

                <button
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#EF4444'
                  }}
                  onClick={() => removeFromCart(item.product._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px',
              color: 'var(--color-text-secondary)'
            }}>
              <span>Sous-total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '14px',
              color: 'var(--color-text-secondary)'
            }}>
              <span>Livraison</span>
              <span>{deliveryMode === 'PICKUP' ? 'Gratuit' : formatPrice(15)}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>
                {formatPrice(cartTotal + (deliveryMode === 'DELIVERY' ? 15 : 0))}
              </span>
            </div>
          </div>

          <button
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              width: '100%',
              justifyContent: 'center',
              padding: '16px',
              fontSize: '16px'
            }}
            onClick={() => setCurrentPage('checkout')}
          >
            Passer la commande
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );

  // Rendu checkout
  const renderCheckout = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={() => setCurrentPage('cart')}
        >
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          Retour
        </button>
        <h2>Finaliser la commande</h2>
      </div>

      {/* Mode de livraison */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Mode de réception</h3>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${deliveryMode === 'DELIVERY' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
              background: deliveryMode === 'DELIVERY' ? 'rgba(0, 212, 170, 0.05)' : 'transparent'
            }}
            onClick={() => setDeliveryMode('DELIVERY')}
          >
            <Truck size={24} color={deliveryMode === 'DELIVERY' ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
            <p style={{ fontWeight: '600', marginTop: '8px' }}>Livraison</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Livré à votre adresse
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '8px' }}>
              {formatPrice(15)}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${deliveryMode === 'PICKUP' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
              background: deliveryMode === 'PICKUP' ? 'rgba(0, 212, 170, 0.05)' : 'transparent'
            }}
            onClick={() => setDeliveryMode('PICKUP')}
          >
            <Store size={24} color={deliveryMode === 'PICKUP' ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
            <p style={{ fontWeight: '600', marginTop: '8px' }}>Retrait en magasin</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Venez chercher votre commande
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '8px', color: '#10B981' }}>
              Gratuit
            </p>
          </div>
        </div>
      </div>

      {/* Créneau */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>
          <Calendar size={18} style={{ marginRight: '8px' }} />
          Créneau de {deliveryMode === 'DELIVERY' ? 'livraison' : 'retrait'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {deliverySlots.slice(0, 16).map((slot, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${deliverySlot?.label === slot.label ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                fontSize: '13px',
                background: deliverySlot?.label === slot.label ? 'rgba(0, 212, 170, 0.05)' : 'transparent'
              }}
              onClick={() => setDeliverySlot(slot)}
            >
              {slot.label}
            </div>
          ))}
        </div>
      </div>

      {/* Adresse livraison */}
      {deliveryMode === 'DELIVERY' && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>
            <MapPin size={18} style={{ marginRight: '8px' }} />
            Adresse de livraison
          </h3>

          <textarea
            value={deliveryAddress || clientInfo.address}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            placeholder="Entrez votre adresse..."
          />
        </div>
      )}

      {/* Récapitulatif */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Récapitulatif</h3>

        {cart.map(item => (
          <div key={item.product._id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span>{item.product.name} x{item.quantity}</span>
            <span>{formatPrice(item.product.pricing?.sellingPrice * item.quantity)}</span>
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '12px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px' }}>
          <span>Total</span>
          <span style={{ color: 'var(--color-primary)' }}>
            {formatPrice(cartTotal + (deliveryMode === 'DELIVERY' ? 15 : 0))}
          </span>
        </div>
      </div>

      <button
        style={{
          ...styles.button,
          ...styles.buttonPrimary,
          width: '100%',
          justifyContent: 'center',
          padding: '16px',
          fontSize: '16px'
        }}
        onClick={submitOrder}
        disabled={!deliverySlot}
      >
        <Check size={20} />
        Confirmer la commande
      </button>
    </div>
  );

  // Rendu historique commandes
  const renderOrders = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Mes commandes</h2>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'var(--color-surface)',
          borderRadius: '12px'
        }}>
          <History size={64} color="var(--color-text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Aucune commande</p>
        </div>
      ) : (
        orders.map(order => (
          <div
            key={order._id}
            style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontWeight: '700', fontSize: '18px' }}>{order.orderNumber}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: order.status === 'COMPLETED' ? '#10B981' :
                            order.status === 'IN_PREPARATION' ? '#F59E0B' : '#3B82F6',
                color: 'white'
              }}>
                {order.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span>{order.items?.length || 0} articles</span>
              <span>{formatPrice(order.total || 0)}</span>
              <span>{order.deliveryMode === 'DELIVERY' ? 'Livraison' : 'Retrait'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {renderHeader()}

      <main style={styles.main}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
            <p style={{ marginTop: '16px' }}>Chargement...</p>
          </div>
        ) : (
          <>
            {currentPage === 'catalog' && renderCatalog()}
            {currentPage === 'cart' && renderCart()}
            {currentPage === 'checkout' && renderCheckout()}
            {currentPage === 'orders' && renderOrders()}
          </>
        )}
      </main>
    </div>
  );
};

export default ClientOrderPortal;

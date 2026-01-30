// ============================================
// MARKET PRO - Page Analytics Produits (ABC/XYZ)
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Package, Star, AlertTriangle,
  DollarSign, RotateCw, Calendar, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus, Eye, ChevronDown, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ComposedChart, Line, Scatter
} from 'recharts';
import api from '../services/api';

const ProductAnalyticsPage = () => {
  const { t } = useTranslation();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // jours
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('matrix'); // matrix, list, charts

  // Charger les données
  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '500');
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques ABC/XYZ
  const analytics = useMemo(() => {
    if (products.length === 0) return null;

    // Simuler les ventes (en production, viendrait de l'API)
    const productsWithMetrics = products.map(p => {
      const revenue = (p.stats?.totalRevenue || Math.random() * 50000);
      const soldQty = (p.stats?.totalSold || Math.floor(Math.random() * 1000));
      const stockValue = (p.stock?.quantity || 0) * (p.pricing?.purchasePrice || 0);
      const margin = p.pricing?.sellingPrice && p.pricing?.purchasePrice
        ? ((p.pricing.sellingPrice - p.pricing.purchasePrice) / p.pricing.purchasePrice * 100)
        : 0;

      // Simuler la variabilité pour XYZ
      const variability = Math.random() * 100;

      return {
        ...p,
        revenue,
        soldQty,
        stockValue,
        margin,
        variability,
        rotation: soldQty > 0 && p.stock?.quantity > 0
          ? soldQty / ((p.stock.quantity + soldQty) / 2)
          : 0
      };
    });

    // Trier par CA pour classification ABC
    const sortedByRevenue = [...productsWithMetrics].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sortedByRevenue.reduce((sum, p) => sum + p.revenue, 0);

    // Classification ABC
    let cumulativeRevenue = 0;
    const classifiedProducts = sortedByRevenue.map(p => {
      cumulativeRevenue += p.revenue;
      const percentage = (cumulativeRevenue / totalRevenue) * 100;

      let abcClass;
      if (percentage <= 80) abcClass = 'A';
      else if (percentage <= 95) abcClass = 'B';
      else abcClass = 'C';

      // Classification XYZ (basée sur la variabilité)
      let xyzClass;
      if (p.variability <= 33) xyzClass = 'X';
      else if (p.variability <= 66) xyzClass = 'Y';
      else xyzClass = 'Z';

      return {
        ...p,
        abcClass,
        xyzClass,
        matrixClass: `${abcClass}${xyzClass}`,
        revenuePercentage: (p.revenue / totalRevenue) * 100
      };
    });

    // Compter par classe
    const matrixCounts = {};
    const abcCounts = { A: 0, B: 0, C: 0 };
    const xyzCounts = { X: 0, Y: 0, Z: 0 };

    classifiedProducts.forEach(p => {
      matrixCounts[p.matrixClass] = (matrixCounts[p.matrixClass] || 0) + 1;
      abcCounts[p.abcClass]++;
      xyzCounts[p.xyzClass]++;
    });

    // Top/Flop
    const topPerformers = classifiedProducts.slice(0, 10);
    const lowPerformers = [...classifiedProducts]
      .filter(p => p.abcClass === 'C')
      .sort((a, b) => a.rotation - b.rotation)
      .slice(0, 10);

    // Stats globales
    const totalStockValue = classifiedProducts.reduce((sum, p) => sum + p.stockValue, 0);
    const avgMargin = classifiedProducts.reduce((sum, p) => sum + p.margin, 0) / classifiedProducts.length;
    const avgRotation = classifiedProducts.reduce((sum, p) => sum + p.rotation, 0) / classifiedProducts.length;

    return {
      products: classifiedProducts,
      matrixCounts,
      abcCounts,
      xyzCounts,
      topPerformers,
      lowPerformers,
      totalRevenue,
      totalStockValue,
      avgMargin,
      avgRotation
    };
  }, [products]);

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
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--color-text)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    kpiCard: {
      padding: '20px',
      borderRadius: '12px',
      background: 'var(--color-surface)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    matrixGrid: {
      display: 'grid',
      gridTemplateColumns: 'auto repeat(3, 1fr)',
      gap: '2px',
      marginBottom: '24px'
    },
    matrixCell: {
      padding: '20px',
      textAlign: 'center',
      borderRadius: '4px'
    },
    matrixHeader: {
      background: 'var(--color-surface)',
      fontWeight: '600',
      padding: '12px'
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
      gap: '6px'
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
    select: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      fontSize: '14px'
    },
    productRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 100px 100px 100px 100px 80px',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      background: 'var(--color-bg)',
      marginBottom: '8px',
      alignItems: 'center'
    }
  };

  const getMatrixColor = (abcClass, xyzClass) => {
    const colors = {
      'AX': { bg: '#10B981', text: 'white', label: 'Stars' },
      'AY': { bg: '#3B82F6', text: 'white', label: 'À surveiller' },
      'AZ': { bg: '#F59E0B', text: 'white', label: 'Risqué' },
      'BX': { bg: '#34D399', text: 'white', label: 'Fiables' },
      'BY': { bg: '#60A5FA', text: 'white', label: 'Optimiser' },
      'BZ': { bg: '#FBBF24', text: 'black', label: 'Revoir' },
      'CX': { bg: '#9CA3AF', text: 'white', label: 'Dormants' },
      'CY': { bg: '#D1D5DB', text: 'black', label: 'Questionner' },
      'CZ': { bg: '#EF4444', text: 'white', label: 'Éliminer?' }
    };
    return colors[`${abcClass}${xyzClass}`] || { bg: '#6B7280', text: 'white', label: '-' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Rendu KPIs
  const renderKPIs = () => (
    <div style={styles.kpiGrid}>
      <div style={styles.kpiCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)' }}>
            <DollarSign size={24} color="#10B981" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>CA Total</p>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(analytics?.totalRevenue || 0)}</p>
          </div>
        </div>
      </div>

      <div style={styles.kpiCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)' }}>
            <Package size={24} color="#3B82F6" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Valeur Stock</p>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(analytics?.totalStockValue || 0)}</p>
          </div>
        </div>
      </div>

      <div style={styles.kpiCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <TrendingUp size={24} color="#F59E0B" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Marge Moyenne</p>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{(analytics?.avgMargin || 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div style={styles.kpiCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)' }}>
            <RotateCw size={24} color="#8B5CF6" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Rotation Moyenne</p>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{(analytics?.avgRotation || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu matrice ABC/XYZ
  const renderMatrix = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart3 size={20} color="var(--color-primary)" />
        Matrice ABC/XYZ
      </h3>

      <div style={styles.matrixGrid}>
        {/* Headers */}
        <div style={styles.matrixHeader}></div>
        <div style={{ ...styles.matrixHeader, textAlign: 'center' }}>
          X<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>Stable</span>
        </div>
        <div style={{ ...styles.matrixHeader, textAlign: 'center' }}>
          Y<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>Variable</span>
        </div>
        <div style={{ ...styles.matrixHeader, textAlign: 'center' }}>
          Z<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>Erratique</span>
        </div>

        {/* Row A */}
        <div style={{ ...styles.matrixHeader, display: 'flex', alignItems: 'center' }}>
          A<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>80% CA</span>
        </div>
        {['X', 'Y', 'Z'].map(xyz => {
          const config = getMatrixColor('A', xyz);
          const count = analytics?.matrixCounts?.[`A${xyz}`] || 0;
          return (
            <div key={`A${xyz}`} style={{
              ...styles.matrixCell,
              background: config.bg,
              color: config.text
            }}>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{count}</p>
              <p style={{ fontSize: '11px' }}>{config.label}</p>
            </div>
          );
        })}

        {/* Row B */}
        <div style={{ ...styles.matrixHeader, display: 'flex', alignItems: 'center' }}>
          B<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>15% CA</span>
        </div>
        {['X', 'Y', 'Z'].map(xyz => {
          const config = getMatrixColor('B', xyz);
          const count = analytics?.matrixCounts?.[`B${xyz}`] || 0;
          return (
            <div key={`B${xyz}`} style={{
              ...styles.matrixCell,
              background: config.bg,
              color: config.text
            }}>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{count}</p>
              <p style={{ fontSize: '11px' }}>{config.label}</p>
            </div>
          );
        })}

        {/* Row C */}
        <div style={{ ...styles.matrixHeader, display: 'flex', alignItems: 'center' }}>
          C<br/><span style={{ fontSize: '11px', fontWeight: '400' }}>5% CA</span>
        </div>
        {['X', 'Y', 'Z'].map(xyz => {
          const config = getMatrixColor('C', xyz);
          const count = analytics?.matrixCounts?.[`C${xyz}`] || 0;
          return (
            <div key={`C${xyz}`} style={{
              ...styles.matrixCell,
              background: config.bg,
              color: config.text
            }}>
              <p style={{ fontSize: '24px', fontWeight: '700' }}>{count}</p>
              <p style={{ fontSize: '11px' }}>{config.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)', justifyContent: 'center' }}>
        <span><strong>A:</strong> {analytics?.abcCounts?.A || 0} produits (80% CA)</span>
        <span><strong>B:</strong> {analytics?.abcCounts?.B || 0} produits (15% CA)</span>
        <span><strong>C:</strong> {analytics?.abcCounts?.C || 0} produits (5% CA)</span>
      </div>
    </div>
  );

  // Rendu Top/Flop
  const renderTopFlop = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Top performers */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="#10B981" />
          Top 10 Performers
        </h3>

        {analytics?.topPerformers?.map((product, index) => (
          <div key={product._id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: index < 3 ? '#10B981' : 'var(--color-text-secondary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '12px'
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '500', fontSize: '13px' }}>{product.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {product.sku}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600', color: '#10B981' }}>{formatCurrency(product.revenue)}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {product.revenuePercentage?.toFixed(1)}% du CA
              </p>
            </div>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              background: getMatrixColor(product.abcClass, product.xyzClass).bg,
              color: getMatrixColor(product.abcClass, product.xyzClass).text
            }}>
              {product.matrixClass}
            </span>
          </div>
        ))}
      </div>

      {/* Low performers */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={20} color="#EF4444" />
          Sous-performers (à analyser)
        </h3>

        {analytics?.lowPerformers?.map((product, index) => (
          <div key={product._id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#EF4444',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '500', fontSize: '13px' }}>{product.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Rotation: {product.rotation?.toFixed(2)} | Stock: {product.stock?.quantity || 0}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600', color: '#EF4444' }}>{formatCurrency(product.stockValue)}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                en stock
              </p>
            </div>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              background: getMatrixColor(product.abcClass, product.xyzClass).bg,
              color: getMatrixColor(product.abcClass, product.xyzClass).text
            }}>
              {product.matrixClass}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu graphique de distribution
  const renderDistributionChart = () => {
    const data = [
      { name: 'Classe A', value: analytics?.abcCounts?.A || 0, color: '#10B981' },
      { name: 'Classe B', value: analytics?.abcCounts?.B || 0, color: '#3B82F6' },
      { name: 'Classe C', value: analytics?.abcCounts?.C || 0, color: '#F59E0B' }
    ];

    return (
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px' }}>Distribution ABC</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <BarChart3 size={32} color="var(--color-primary)" />
          Analytics Produits
        </h1>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={styles.select}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">12 derniers mois</option>
          </select>

          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={loadData}
          >
            <RefreshCw size={18} />
            Actualiser
          </button>

          <button style={{ ...styles.button, ...styles.buttonPrimary }}>
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '16px' }}>Analyse en cours...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          {renderKPIs()}

          {/* Matrice ABC/XYZ */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {renderMatrix()}
            {renderDistributionChart()}
          </div>

          {/* Top/Flop */}
          {renderTopFlop()}
        </>
      )}
    </div>
  );
};

export default ProductAnalyticsPage;

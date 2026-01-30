// ============================================
// MARKET PRO - Page Gestion Emplacements Entrepôt
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Box, Thermometer, Snowflake, Sun, Warehouse,
  Plus, Search, Filter, Grid3X3, List, Eye, Edit, Trash2,
  ChevronDown, ChevronRight, Check, X, Loader2, Settings,
  Package, AlertTriangle, CheckCircle
} from 'lucide-react';
import api from '../services/api';

const LocationsPage = () => {

  // States
  const [locations, setLocations] = useState([]);
  const [zoneStats, setZoneStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [selectedZone, setSelectedZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [selectedZone, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedZone) params.append('zone', selectedZone);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      params.append('limit', '500');

      const [locationsRes, statsRes] = await Promise.all([
        api.get(`/locations?${params.toString()}`),
        api.get('/locations/zones')
      ]);

      setLocations(locationsRes.data?.data || []);
      setZoneStats(statsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer l'entrepôt
  const generateWarehouse = async (config) => {
    try {
      await api.post('/locations/generate', config);
      await loadData();
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // Filtrer les emplacements
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return loc.code?.toLowerCase().includes(search) ||
               loc.currentProducts?.some(p => p.product?.name?.toLowerCase().includes(search));
      }
      return true;
    });
  }, [locations, searchTerm]);

  // Grouper par allée pour l'affichage grille
  const locationsByAisle = useMemo(() => {
    const grouped = {};
    filteredLocations.forEach(loc => {
      const key = `${loc.zone}-${loc.aisle}`;
      if (!grouped[key]) {
        grouped[key] = {
          zone: loc.zone,
          aisle: loc.aisle,
          locations: []
        };
      }
      grouped[key].locations.push(loc);
    });
    return Object.values(grouped).sort((a, b) =>
      a.zone.localeCompare(b.zone) || a.aisle.localeCompare(b.aisle)
    );
  }, [filteredLocations]);

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
    zoneCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    zoneCard: {
      padding: '20px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: '2px solid transparent'
    },
    zoneCardSelected: {
      borderColor: 'var(--color-primary)',
      transform: 'scale(1.02)'
    },
    toolbar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchInput: {
      padding: '10px 14px',
      paddingLeft: '40px',
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      fontSize: '14px',
      width: '300px'
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '8px'
    },
    locationCell: {
      aspectRatio: '1',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '10px',
      fontWeight: '600',
      position: 'relative'
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
    }
  };

  const getZoneColor = (zone) => {
    const colors = {
      'F': { bg: '#DBEAFE', border: '#3B82F6', icon: Thermometer },
      'S': { bg: '#FEF3C7', border: '#F59E0B', icon: Sun },
      'C': { bg: '#E0E7FF', border: '#6366F1', icon: Snowflake },
      'Q': { bg: '#D1FAE5', border: '#10B981', icon: Package },
      'P': { bg: '#FCE7F3', border: '#EC4899', icon: Box }
    };
    return colors[zone] || colors['S'];
  };

  const getZoneName = (zone) => {
    const names = {
      'F': 'Frais',
      'S': 'Sec',
      'C': 'Congélateur',
      'Q': 'Quai',
      'P': 'Préparation'
    };
    return names[zone] || zone;
  };

  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': '#10B981',
      'OCCUPIED': '#3B82F6',
      'RESERVED': '#F59E0B',
      'MAINTENANCE': '#6B7280',
      'BLOCKED': '#EF4444'
    };
    return colors[status] || colors['AVAILABLE'];
  };

  // Rendu des cartes de zone
  const renderZoneCards = () => (
    <div style={styles.zoneCards}>
      <div
        style={{
          ...styles.zoneCard,
          background: 'var(--color-surface)',
          ...(selectedZone === null ? styles.zoneCardSelected : {})
        }}
        onClick={() => setSelectedZone(null)}
      >
        <Warehouse size={24} color="var(--color-primary)" />
        <h4 style={{ marginTop: '8px' }}>Tout l'entrepôt</h4>
        <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
          {zoneStats.reduce((sum, z) => sum + z.total, 0)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>emplacements</p>
      </div>

      {zoneStats.map(zone => {
        const zoneConfig = getZoneColor(zone._id);
        const ZoneIcon = zoneConfig.icon;

        return (
          <div
            key={zone._id}
            style={{
              ...styles.zoneCard,
              background: zoneConfig.bg,
              borderColor: selectedZone === zone._id ? zoneConfig.border : 'transparent'
            }}
            onClick={() => setSelectedZone(zone._id)}
          >
            <ZoneIcon size={24} color={zoneConfig.border} />
            <h4 style={{ marginTop: '8px', color: zoneConfig.border }}>
              Zone {zone._id} - {getZoneName(zone._id)}
            </h4>
            <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: zoneConfig.border }}>
              {zone.total}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '11px' }}>
              <span style={{ color: '#10B981' }}>{zone.available} libres</span>
              <span style={{ color: '#3B82F6' }}>{zone.occupied} occupés</span>
            </div>
            <div style={{
              marginTop: '8px',
              height: '4px',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.round(zone.avgOccupancy || 0)}%`,
                height: '100%',
                background: zoneConfig.border
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );

  // Rendu grille des emplacements
  const renderLocationGrid = () => (
    <div>
      {locationsByAisle.map(group => (
        <div key={`${group.zone}-${group.aisle}`} style={{ marginBottom: '24px' }}>
          <h4 style={{
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: getZoneColor(group.zone).bg,
              color: getZoneColor(group.zone).border,
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Zone {group.zone}
            </span>
            Allée {group.aisle}
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '400' }}>
              ({group.locations.length} emplacements)
            </span>
          </h4>

          <div style={styles.grid}>
            {group.locations.map(loc => {
              const isEmpty = !loc.currentProducts || loc.currentProducts.length === 0;

              return (
                <div
                  key={loc._id}
                  style={{
                    ...styles.locationCell,
                    background: isEmpty ? 'var(--color-bg)' : getZoneColor(loc.zone).bg,
                    border: `2px solid ${getStatusColor(loc.status)}`,
                    opacity: loc.status === 'BLOCKED' ? 0.5 : 1
                  }}
                  onClick={() => setSelectedLocation(loc)}
                  title={`${loc.code} - ${loc.status}`}
                >
                  <span style={{ color: getStatusColor(loc.status) }}>
                    {loc.rack}-{loc.level}
                  </span>
                  {!isEmpty && (
                    <Package size={12} style={{ marginTop: '2px', color: 'var(--color-primary)' }} />
                  )}
                  {loc.status === 'MAINTENANCE' && (
                    <Settings size={12} style={{ position: 'absolute', top: '4px', right: '4px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // Rendu liste des emplacements
  const renderLocationList = () => (
    <div style={{ background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--color-bg)' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Code</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Zone</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Statut</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Produits</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Occupation</th>
            <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLocations.map(loc => (
            <tr
              key={loc._id}
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <td style={{ padding: '12px', fontWeight: '600' }}>{loc.code}</td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: getZoneColor(loc.zone).bg,
                  color: getZoneColor(loc.zone).border,
                  fontSize: '12px'
                }}>
                  {getZoneName(loc.zone)}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: getStatusColor(loc.status),
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {loc.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                {loc.currentProducts?.length || 0} produit(s)
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '60px',
                    height: '6px',
                    background: 'var(--color-bg)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${loc.capacity?.currentOccupancy || 0}%`,
                      height: '100%',
                      background: 'var(--color-primary)'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px' }}>{loc.capacity?.currentOccupancy || 0}%</span>
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedLocation(loc)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'var(--color-bg)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Modal détail emplacement
  const renderLocationDetail = () => {
    if (!selectedLocation) return null;

    return (
      <div style={styles.modal} onClick={() => setSelectedLocation(null)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={24} color="var(--color-primary)" />
              Emplacement {selectedLocation.code}
            </h2>
            <button
              onClick={() => setSelectedLocation(null)}
              style={{ ...styles.button, padding: '8px' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Zone</label>
              <p style={{ fontWeight: '600', fontSize: '18px' }}>
                {selectedLocation.zone} - {getZoneName(selectedLocation.zone)}
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Statut</label>
              <p>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: getStatusColor(selectedLocation.status),
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {selectedLocation.status}
                </span>
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Type</label>
              <p style={{ fontWeight: '600' }}>{selectedLocation.type || 'RACK'}</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Occupation</label>
              <p style={{ fontWeight: '600' }}>{selectedLocation.capacity?.currentOccupancy || 0}%</p>
            </div>
          </div>

          {selectedLocation.zoneInfo?.temperature && (
            <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Température recommandée</label>
              <p style={{ fontWeight: '600' }}>
                {selectedLocation.zoneInfo.temperature.min}°C à {selectedLocation.zoneInfo.temperature.max}°C
              </p>
            </div>
          )}

          <h4 style={{ marginBottom: '12px' }}>Produits stockés ({selectedLocation.currentProducts?.length || 0})</h4>

          {selectedLocation.currentProducts?.length > 0 ? (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {selectedLocation.currentProducts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    background: 'var(--color-bg)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <p style={{ fontWeight: '600' }}>{p.product?.name || 'Produit'}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Quantité: {p.quantity} | Placé le: {new Date(p.placedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Emplacement vide
            </p>
          )}
        </div>
      </div>
    );
  };

  // Modal génération entrepôt
  const renderGenerateModal = () => {
    const [config, setConfig] = useState({
      zones: ['F', 'S', 'C'],
      aislesPerZone: 4,
      racksPerAisle: 10,
      levelsPerRack: 5
    });

    if (!showGenerateModal) return null;

    return (
      <div style={styles.modal} onClick={() => setShowGenerateModal(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px' }}>Générer les emplacements</h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Zones à créer
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['F', 'S', 'C', 'Q', 'P'].map(zone => (
                <button
                  key={zone}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: config.zones.includes(zone) ? getZoneColor(zone).border : 'var(--color-bg)',
                    color: config.zones.includes(zone) ? 'white' : 'var(--color-text)'
                  }}
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      zones: prev.zones.includes(zone)
                        ? prev.zones.filter(z => z !== zone)
                        : [...prev.zones, zone]
                    }));
                  }}
                >
                  {zone} - {getZoneName(zone)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Allées par zone</label>
              <input
                type="number"
                value={config.aislesPerZone}
                onChange={(e) => setConfig({ ...config, aislesPerZone: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Rayons par allée</label>
              <input
                type="number"
                value={config.racksPerAisle}
                onChange={(e) => setConfig({ ...config, racksPerAisle: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Niveaux par rayon</label>
              <input
                type="number"
                value={config.levelsPerRack}
                onChange={(e) => setConfig({ ...config, levelsPerRack: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontWeight: '600' }}>
              Total: {config.zones.length * config.aislesPerZone * config.racksPerAisle * config.levelsPerRack} emplacements
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setShowGenerateModal(false)}
            >
              Annuler
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => generateWarehouse(config)}
            >
              <Plus size={18} />
              Générer
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
          <Warehouse size={32} color="var(--color-primary)" />
          Emplacements Entrepôt
        </h1>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={() => setShowGenerateModal(true)}
        >
          <Plus size={18} />
          Générer entrepôt
        </button>
      </div>

      {/* Zone cards */}
      {renderZoneCards()}

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher un emplacement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...styles.button, ...styles.buttonSecondary, background: 'var(--color-surface)' }}
        >
          <option value="ALL">Tous les statuts</option>
          <option value="AVAILABLE">Disponibles</option>
          <option value="OCCUPIED">Occupés</option>
          <option value="RESERVED">Réservés</option>
          <option value="MAINTENANCE">En maintenance</option>
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            style={{
              ...styles.button,
              ...(viewMode === 'grid' ? styles.buttonPrimary : styles.buttonSecondary)
            }}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            style={{
              ...styles.button,
              ...(viewMode === 'list' ? styles.buttonPrimary : styles.buttonSecondary)
            }}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '16px' }}>Chargement...</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
          <Warehouse size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Aucun emplacement trouvé</p>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '16px' }}
            onClick={() => setShowGenerateModal(true)}
          >
            <Plus size={18} />
            Générer les emplacements
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        renderLocationGrid()
      ) : (
        renderLocationList()
      )}

      {/* Modals */}
      {renderLocationDetail()}
      {renderGenerateModal()}
    </div>
  );
};

export default LocationsPage;

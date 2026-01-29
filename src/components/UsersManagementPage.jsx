import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Shield, Key, Mail, Phone, Calendar, Clock,
  Search, Filter, MoreHorizontal, Edit, Trash2, Eye, EyeOff,
  Check, X, AlertCircle, ChevronDown, Lock, Unlock, RefreshCw,
  Building2, Settings, Save, Copy
} from 'lucide-react';
import { 
  ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS, PERMISSIONS,
  mockUsers, hasPermission
} from '../data/roles';

function UsersManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    admins: users.filter(u => u.role === ROLES.ADMIN).length,
    recentLogins: users.filter(u => {
      const lastLogin = new Date(u.lastLogin);
      const today = new Date();
      return (today - lastLogin) / (1000 * 60 * 60 * 24) < 7;
    }).length
  }), [users]);
  
  // Filtrage
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchTerm || 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);
  
  // Actions
  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };
  
  const deleteUser = (userId) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    }
  };
  
  const resetPassword = (userId) => {
    alert('Email de réinitialisation envoyé !');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { icon: Users, label: 'Total utilisateurs', value: stats.total, color: '#3b82f6' },
          { icon: Check, label: 'Actifs', value: stats.active, sub: `/${stats.total}`, color: '#10b981' },
          { icon: Shield, label: 'Administrateurs', value: stats.admins, color: '#8b5cf6' },
          { icon: Clock, label: 'Connexions récentes', value: stats.recentLogins, sub: '7 derniers jours', color: '#f59e0b' }
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block' }}>{s.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</span>
              {s.sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>
      
      {/* Contenu principal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Liste utilisateurs */}
        <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Utilisateurs ({filteredUsers.length})</h3>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: 150, color: 'var(--text-primary)' }}
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '0.625rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              >
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowRolesPanel(!showRolesPanel)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: showRolesPanel ? 'var(--primary-color)' : 'transparent',
                  color: showRolesPanel ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <Shield size={18} />
                Rôles
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <UserPlus size={18} />
                Ajouter
              </button>
            </div>
          </div>
          
          {/* Liste */}
          <div style={{ maxHeight: 500, overflow: 'auto' }}>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: selectedUser?.id === user.id ? 'var(--hover-bg)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${ROLE_COLORS[user.role]}80, ${ROLE_COLORS[user.role]}40)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.125rem'
                }}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '12px',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      background: `${ROLE_COLORS[user.role]}20`,
                      color: ROLE_COLORS[user.role]
                    }}>
                      {ROLE_LABELS[user.role]}
                    </span>
                    {!user.active && (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '12px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        background: 'rgba(239,68,68,0.15)',
                        color: '#ef4444'
                      }}>
                        Inactif
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Mail size={12} /> {user.email}
                    </span>
                  </div>
                </div>
                
                {/* Dernière connexion */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dernière connexion</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleUserStatus(user.id); }}
                    title={user.active ? 'Désactiver' : 'Activer'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--hover-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: user.active ? '#10b981' : '#ef4444'
                    }}
                  >
                    {user.active ? <Unlock size={14} /> : <Lock size={14} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      border: 'none',
                      background: 'var(--hover-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Panel latéral - Détails utilisateur ou Rôles */}
        {(selectedUser || showRolesPanel) && (
          <div style={{ width: 380, flexShrink: 0 }}>
            {showRolesPanel ? (
              // Panel des rôles
              <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} style={{ color: 'var(--primary-color)' }} />
                    Rôles & Permissions
                  </h3>
                  <button
                    onClick={() => setShowRolesPanel(false)}
                    style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'var(--hover-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div style={{ padding: '1rem', maxHeight: 500, overflow: 'auto' }}>
                  {Object.entries(ROLES).filter(([k]) => k !== 'CLIENT').map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--hover-bg)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          background: `${ROLE_COLORS[value]}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Shield size={18} style={{ color: ROLE_COLORS[value] }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{ROLE_LABELS[value]}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ROLE_PERMISSIONS[value]?.length || 0} permissions
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {ROLE_PERMISSIONS[value]?.slice(0, 5).map(perm => (
                          <span key={perm} style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--card-bg)',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            color: 'var(--text-muted)'
                          }}>
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {ROLE_PERMISSIONS[value]?.length > 5 && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--primary-color)15',
                            color: 'var(--primary-color)',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 500
                          }}>
                            +{ROLE_PERMISSIONS[value].length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedUser && (
              // Détails utilisateur
              <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${ROLE_COLORS[selectedUser.role]}, ${ROLE_COLORS[selectedUser.role]}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem'
                      }}>
                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>{selectedUser.firstName} {selectedUser.lastName}</h3>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: `${ROLE_COLORS[selectedUser.role]}20`,
                          color: ROLE_COLORS[selectedUser.role]
                        }}>
                          {ROLE_LABELS[selectedUser.role]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'var(--hover-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Infos */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Informations</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.9375rem' }}>{selectedUser.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.9375rem' }}>{selectedUser.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.9375rem' }}>Créé le {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Statut */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statut</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: selectedUser.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {selectedUser.active ? <Unlock size={18} style={{ color: '#10b981' }} /> : <Lock size={18} style={{ color: '#ef4444' }} />}
                      <span style={{ fontWeight: 500, color: selectedUser.active ? '#10b981' : '#ef4444' }}>
                        {selectedUser.active ? 'Compte actif' : 'Compte désactivé'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleUserStatus(selectedUser.id)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--card-bg)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedUser.active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
                
                {/* Permissions */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Permissions ({ROLE_PERMISSIONS[selectedUser.role]?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {ROLE_PERMISSIONS[selectedUser.role]?.slice(0, 8).map(perm => (
                      <span key={perm} style={{
                        padding: '0.375rem 0.625rem',
                        background: 'var(--hover-bg)',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}>
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {ROLE_PERMISSIONS[selectedUser.role]?.length > 8 && (
                      <span style={{
                        padding: '0.375rem 0.625rem',
                        background: 'var(--primary-color)15',
                        color: 'var(--primary-color)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        +{ROLE_PERMISSIONS[selectedUser.role].length - 8} autres
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => resetPassword(selectedUser.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        cursor: 'pointer',
                        justifyContent: 'center',
                        fontWeight: 500
                      }}
                    >
                      <Key size={18} />
                      Réinitialiser mot de passe
                    </button>
                    <button
                      onClick={() => setEditingUser(selectedUser)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: 'white',
                        cursor: 'pointer',
                        justifyContent: 'center',
                        fontWeight: 500
                      }}
                    >
                      <Edit size={18} />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal Ajout utilisateur */}
      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onAdd={(user) => { setUsers([...users, user]); setShowAddModal(false); }} />
      )}
    </div>
  );
}

// Modal d'ajout d'utilisateur
function AddUserModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ROLES.COMMERCIAL,
    sendInvite: true
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: `USR${String(Date.now()).slice(-4)}`,
      ...formData,
      password: 'temp123',
      avatar: null,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
      active: true
    };
    onAdd(newUser);
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ width: '100%', maxWidth: 500, background: 'var(--card-bg)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Nouvel utilisateur</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'var(--hover-bg)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'client').map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--primary-color)' }}
            />
            <span>Envoyer une invitation par email</span>
          </label>
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontWeight: 500 }}
            >
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsersManagementPage;

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, User, Settings, LogOut, ChevronDown, 
  X, Check, AlertTriangle, Info, AlertCircle, CheckCircle,
  Moon, Sun, Menu, RefreshCw, Shield
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../data/roles';

const Header = ({ 
  title, 
  subtitle, 
  searchValue, 
  onSearchChange, 
  notifications = [],
  unreadCount = 0,
  onNotificationRead,
  onMarkAllRead,
  user,
  onLogout,
  onMobileMenuToggle,
  mobileMenuOpen
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fermer dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="notif-icon success" />;
      case 'warning': return <AlertTriangle size={16} className="notif-icon warning" />;
      case 'danger': return <AlertCircle size={16} className="notif-icon danger" />;
      default: return <Info size={16} className="notif-icon info" />;
    }
  };

  const userInitials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  const userEmail = user?.email || '';
  const userRole = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Invité';
  const roleColor = user?.role ? (ROLE_COLORS[user.role] || '#64748b') : '#64748b';

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="header-titles">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-center">
        <div className="global-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Recherche globale... (Ctrl+K)"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <X size={16} />
            </button>
          )}
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* Refresh Button */}
        <button className="header-btn" title="Actualiser">
          <RefreshCw size={20} />
        </button>

        {/* Notifications */}
        <div className="header-dropdown" ref={notifRef}>
          <button 
            className={`header-btn notifications-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-panel notifications-panel">
              <div className="dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={onMarkAllRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="dropdown-content">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <Bell size={32} />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => onNotificationRead(notif.id)}
                    >
                      {getNotificationIcon(notif.type)}
                      <div className="notification-content">
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      {!notif.read && <span className="unread-dot"></span>}
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn">Voir toutes les notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="header-dropdown" ref={profileRef}>
          <button 
            className={`profile-btn ${showProfile ? 'active' : ''}`}
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar" style={{ backgroundColor: roleColor }}>
              <span>{userInitials}</span>
            </div>
            <span className="profile-name">{user?.firstName || 'Utilisateur'}</span>
            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="dropdown-panel profile-panel">
              <div className="profile-header">
                <div className="profile-avatar large" style={{ backgroundColor: roleColor }}>
                  <span>{userInitials}</span>
                </div>
                <div className="profile-info">
                  <span className="profile-fullname">{userName}</span>
                  <span className="profile-email">{userEmail}</span>
                  <span className="profile-role" style={{ color: roleColor }}>{userRole}</span>
                </div>
              </div>
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <User size={18} />
                  <span>Mon profil</span>
                </button>
                <button className="dropdown-item">
                  <Settings size={18} />
                  <span>Paramètres</span>
                </button>
                <button className="dropdown-item">
                  <Shield size={18} />
                  <span>Sécurité</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={onLogout}>
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

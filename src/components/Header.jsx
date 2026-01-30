import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Bell, User, Settings, LogOut, ChevronDown,
  X, Check, AlertTriangle, Info, AlertCircle, CheckCircle,
  Moon, Sun, Menu, RefreshCw, Shield
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../data/roles';
import { KEYS } from '../utils/accessibility';

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
  const searchInputRef = useRef(null);

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

  // Raccourci clavier Ctrl+K pour la recherche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gestion clavier pour les dropdowns
  const handleDropdownKeyDown = useCallback((e, closeDropdown) => {
    if (e.key === KEYS.ESCAPE) {
      e.preventDefault();
      closeDropdown();
    }
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
    <header className="app-header" role="banner">
      <div className="header-left">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="sidebar-nav"
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

        <div className="header-titles">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-center">
        <div className="global-search" role="search" aria-label="Recherche globale">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Recherche globale... (Ctrl+K)"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Recherche globale"
            aria-describedby="search-shortcut-hint"
          />
          {searchValue && (
            <button
              className="search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Effacer la recherche"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
          <kbd className="search-shortcut" id="search-shortcut-hint" aria-label="Raccourci Ctrl+K">⌘K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* Refresh Button */}
        <button className="header-btn" aria-label="Actualiser la page" title="Actualiser">
          <RefreshCw size={20} aria-hidden="true" />
        </button>

        {/* Notifications */}
        <div
          className="header-dropdown"
          ref={notifRef}
          onKeyDown={(e) => handleDropdownKeyDown(e, () => setShowNotifications(false))}
        >
          <button
            className={`header-btn notifications-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
            aria-expanded={showNotifications}
            aria-haspopup="true"
            aria-controls="notifications-panel"
          >
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="notification-badge" aria-hidden="true">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div
              id="notifications-panel"
              className="dropdown-panel notifications-panel"
              role="dialog"
              aria-label="Panneau des notifications"
            >
              <div className="dropdown-header">
                <span id="notifications-title">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read"
                    onClick={onMarkAllRead}
                    aria-label="Marquer toutes les notifications comme lues"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="dropdown-content" role="list" aria-labelledby="notifications-title">
                {notifications.length === 0 ? (
                  <div className="empty-notifications" role="status">
                    <Bell size={32} aria-hidden="true" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => onNotificationRead(notif.id)}
                      onKeyDown={(e) => e.key === KEYS.ENTER && onNotificationRead(notif.id)}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${notif.message}, ${notif.time}${!notif.read ? ', non lue' : ''}`}
                    >
                      {getNotificationIcon(notif.type)}
                      <div className="notification-content">
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      {!notif.read && <span className="unread-dot" aria-hidden="true"></span>}
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn" aria-label="Voir toutes les notifications">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div
          className="header-dropdown"
          ref={profileRef}
          onKeyDown={(e) => handleDropdownKeyDown(e, () => setShowProfile(false))}
        >
          <button
            className={`profile-btn ${showProfile ? 'active' : ''}`}
            onClick={() => setShowProfile(!showProfile)}
            aria-label={`Menu utilisateur pour ${userName}`}
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-controls="profile-panel"
          >
            <div className="profile-avatar" style={{ backgroundColor: roleColor }} aria-hidden="true">
              <span>{userInitials}</span>
            </div>
            <span className="profile-name">{user?.firstName || 'Utilisateur'}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {showProfile && (
            <div
              id="profile-panel"
              className="dropdown-panel profile-panel"
              role="dialog"
              aria-label="Menu du profil utilisateur"
            >
              <div className="profile-header">
                <div className="profile-avatar large" style={{ backgroundColor: roleColor }} aria-hidden="true">
                  <span>{userInitials}</span>
                </div>
                <div className="profile-info">
                  <span className="profile-fullname">{userName}</span>
                  <span className="profile-email">{userEmail}</span>
                  <span className="profile-role" style={{ color: roleColor }}>{userRole}</span>
                </div>
              </div>
              <nav className="dropdown-menu" role="menu" aria-label="Options du profil">
                <button className="dropdown-item" role="menuitem">
                  <User size={18} aria-hidden="true" />
                  <span>Mon profil</span>
                </button>
                <button className="dropdown-item" role="menuitem">
                  <Settings size={18} aria-hidden="true" />
                  <span>Paramètres</span>
                </button>
                <button className="dropdown-item" role="menuitem">
                  <Shield size={18} aria-hidden="true" />
                  <span>Sécurité</span>
                </button>
                <div className="dropdown-divider" role="separator"></div>
                <button className="dropdown-item danger" role="menuitem" onClick={onLogout}>
                  <LogOut size={18} aria-hidden="true" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, X, ChevronDown, ChevronRight, Check, AlertTriangle,
  Info, AlertCircle, CheckCircle, Loader2, Eye, Edit, Trash2,
  MoreVertical, Calendar, Filter
} from 'lucide-react';

// ============ STAT CARD ============
export const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend = 'up',
  color = 'primary',
  subtitle,
  onClick 
}) => {
  const colors = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    tertiary: 'var(--color-tertiary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  };

  return (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ '--accent-color': colors[color] }}
    >
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${colors[color]}20`, color: colors[color] }}>
          <Icon size={22} />
        </div>
        {change !== undefined && (
          <span className={`stat-change ${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};

// ============ PROGRESS BAR ============
export const ProgressBar = ({ 
  value, 
  max = 100, 
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  animated = false 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    gradient: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
  };

  // Auto color based on percentage
  const autoColor = percentage > 80 ? 'danger' : percentage > 60 ? 'warning' : 'success';
  const finalColor = color === 'auto' ? autoColor : color;

  return (
    <div className={`progress-container size-${size}`}>
      {(showLabel || label) && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-value">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="progress-track">
        <div 
          className={`progress-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${percentage}%`,
            background: colors[finalColor] || finalColor
          }}
        />
      </div>
    </div>
  );
};

// ============ STATUS BADGE ============
export const StatusBadge = ({ status, size = 'md', pulse = false }) => {
  const statusConfig = {
    active: { label: 'Actif', color: 'success' },
    inactive: { label: 'Inactif', color: 'danger' },
    pending: { label: 'En attente', color: 'warning' },
    preparation: { label: 'Préparation', color: 'secondary' },
    shipped: { label: 'Expédié', color: 'info' },
    delivered: { label: 'Livré', color: 'success' },
    cancelled: { label: 'Annulé', color: 'danger' },
    paid: { label: 'Payé', color: 'success' },
    partial: { label: 'Partiel', color: 'warning' },
    overdue: { label: 'En retard', color: 'danger' },
    draft: { label: 'Brouillon', color: 'muted' },
    validated: { label: 'Validé', color: 'success' },
    critical: { label: 'Critique', color: 'danger' },
    low: { label: 'Bas', color: 'warning' },
    normal: { label: 'Normal', color: 'success' },
  };

  const config = statusConfig[status] || { label: status, color: 'muted' };

  return (
    <span className={`status-badge ${config.color} size-${size} ${pulse ? 'pulse' : ''}`}>
      <span className="status-dot"></span>
      {config.label}
    </span>
  );
};

// ============ ALERT ============
export const Alert = ({ type = 'info', title, children, onClose, actions }) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertCircle,
  };
  const Icon = icons[type];

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">
        <Icon size={20} />
      </div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
        {actions && <div className="alert-actions">{actions}</div>}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// ============ SEARCH INPUT ============
export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Rechercher...', 
  size = 'md',
  onClear,
  autoFocus = false 
}) => {
  return (
    <div className={`search-input size-${size}`}>
      <Search size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button className="search-clear" onClick={() => onClear ? onClear() : onChange('')}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ============ FILTER PILLS ============
export const FilterPills = ({ options, value, onChange, multiple = false }) => {
  const handleClick = (optionValue) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue === value ? null : optionValue);
    }
  };

  return (
    <div className="filter-pills">
      {options.map(option => (
        <button
          key={option.value}
          className={`filter-pill ${
            multiple 
              ? value.includes(option.value) ? 'active' : ''
              : value === option.value ? 'active' : ''
          }`}
          onClick={() => handleClick(option.value)}
        >
          {option.icon && <option.icon size={14} />}
          {option.label}
          {option.count !== undefined && (
            <span className="filter-count">{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

// ============ DROPDOWN ============
export const Dropdown = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown-menu align-${align}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// ============ MODAL ============
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  closeOnBackdrop = true 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeOnBackdrop ? onClose : undefined}>
      <div className={`modal size-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ TABS ============
export const Tabs = ({ tabs, activeTab, onChange, size = 'md' }) => {
  return (
    <div className={`tabs size-${size}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <tab.icon size={16} />}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

// ============ AVATAR ============
export const Avatar = ({ name, src, size = 'md', status }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={`avatar size-${size}`}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
      {status && <span className={`avatar-status ${status}`}></span>}
    </div>
  );
};

// ============ EMPTY STATE ============
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={48} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

// ============ LOADER ============
export const Loader = ({ size = 'md', text }) => {
  return (
    <div className={`loader size-${size}`}>
      <Loader2 className="loader-spinner" />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

// ============ TABLE ============
export const Table = ({ columns, data, onRowClick, emptyMessage = 'Aucune donnée' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr 
              key={row.id || idx} 
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map(col => (
                <td 
                  key={col.key}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ ACTION BUTTONS ============
export const ActionButtons = ({ actions, row }) => {
  return (
    <div className="action-buttons">
      {actions.map((action, idx) => (
        <button
          key={idx}
          className={`action-btn ${action.variant || 'ghost'}`}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(row);
          }}
          title={action.label}
        >
          <action.icon size={16} />
        </button>
      ))}
    </div>
  );
};

// ============ DATE PICKER SIMPLE ============
export const DateInput = ({ value, onChange, label, min, max }) => {
  return (
    <div className="date-input">
      {label && <label>{label}</label>}
      <div className="date-input-wrapper">
        <Calendar size={16} />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
        />
      </div>
    </div>
  );
};

// ============ SELECT ============
export const Select = ({ value, onChange, options, placeholder, label, size = 'md' }) => {
  return (
    <div className={`select-wrapper size-${size}`}>
      {label && <label>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="select-icon" />
    </div>
  );
};

// ============ INPUT ============
export const Input = ({ 
  value, 
  onChange, 
  label, 
  type = 'text', 
  placeholder,
  error,
  required,
  icon: Icon,
  size = 'md'
}) => {
  return (
    <div className={`input-wrapper size-${size} ${error ? 'has-error' : ''}`}>
      {label && <label>{label} {required && <span className="required">*</span>}</label>}
      <div className="input-container">
        {Icon && <Icon size={16} className="input-icon" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={Icon ? 'has-icon' : ''}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

// ============ BUTTON ============
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} size-${size} ${fullWidth ? 'full-width' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 size={16} className="btn-loader" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={16} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={16} />}
        </>
      )}
    </button>
  );
};

// ============ CARD ============
export const Card = ({ 
  title, 
  subtitle,
  children, 
  actions,
  footer,
  padding = true,
  className = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${padding ? '' : 'no-padding'}`}>
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// ============ TOOLTIP ============
export const Tooltip = ({ children, content, position = 'top' }) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className={`tooltip tooltip-${position}`}>{content}</span>
    </div>
  );
};

export default {
  StatCard,
  ProgressBar,
  StatusBadge,
  Alert,
  SearchInput,
  FilterPills,
  Dropdown,
  Modal,
  Tabs,
  Avatar,
  EmptyState,
  Loader,
  Table,
  ActionButtons,
  DateInput,
  Select,
  Input,
  Button,
  Card,
  Tooltip
};

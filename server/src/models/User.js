// ============================================
// MARKET PRO API - Modèle Utilisateur
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Informations de base
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: [8, 'Mot de passe minimum 8 caractères'],
    select: false // Ne pas retourner par défaut
  },
  
  // Profil
  firstName: {
    type: String,
    required: [true, 'Prénom requis'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Nom requis'],
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide']
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Rôle et permissions
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'CAISSIER', 'MAGASINIER', 'COMPTABLE', 'CLIENT'],
    default: 'CLIENT'
  },
  permissions: [{
    type: String
  }],
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Sécurité
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  
  // Tokens
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  
  // 2FA
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  // Préférences
  preferences: {
    language: {
      type: String,
      enum: ['fr', 'en', 'ar'],
      default: 'fr'
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  
  // Relation client (si rôle CLIENT)
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  }
  
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ============================================
// VIRTUALS
// ============================================
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('initials').get(function() {
  return `${this.firstName?.charAt(0) || ''}${this.lastName?.charAt(0) || ''}`.toUpperCase();
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================
// MIDDLEWARES
// ============================================

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.lastPasswordChange = Date.now();
  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le compte est bloqué
userSchema.methods.checkLockout = function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((this.lockUntil - Date.now()) / 1000 / 60);
    return {
      locked: true,
      remainingMinutes: remainingTime
    };
  }
  return { locked: false };
};

// Incrémenter les tentatives de connexion
userSchema.methods.incrementLoginAttempts = async function() {
  // Reset si le blocage est expiré
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquer après 5 tentatives
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 minutes
  }
  
  return this.updateOne(updates);
};

// Reset après connexion réussie
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Vérifier une permission
userSchema.methods.hasPermission = function(permission) {
  // Admin a toutes les permissions
  if (this.role === 'ADMIN') return true;
  return this.permissions.includes(permission);
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver par email avec mot de passe
userSchema.statics.findByCredentials = async function(email) {
  return this.findOne({ email }).select('+password');
};

// Trouver les utilisateurs actifs par rôle
userSchema.statics.findActiveByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);

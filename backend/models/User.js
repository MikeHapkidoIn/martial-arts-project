// /backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true,
    maxlength: [50, 'Los apellidos no pueden exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor proporcione un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir en queries por defecto
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: 'El rol debe ser user, admin o moderator'
    },
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 días
    }
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
userSchema.index({ email: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual para nombre completo
userSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellidos}`;
});

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();

  // Hashear contraseña con costo de 12
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Método para generar refresh token
userSchema.methods.getRefreshToken = function() {
  const refreshToken = jwt.sign(
    { 
      id: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE
    }
  );

  // Guardar refresh token en la base de datos
  this.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date()
  });

  // Mantener solo los últimos 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  return refreshToken;
};

// Método para generar token de reset de contraseña
userSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y establecer campo
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer tiempo de expiración (10 minutos)
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Método para generar token de verificación de email
userSchema.methods.getEmailVerificationToken = function() {
  // Generar token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y establecer campo
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Establecer tiempo de expiración (24 horas)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Método para incrementar intentos de login fallidos
userSchema.methods.incLoginAttempts = function() {
  // Si tenemos un bloqueo previo y expiró, reiniciamos
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Si alcanzamos el máximo de intentos y no estamos bloqueados, bloqueamos
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 horas
    };
  }

  return this.updateOne(updates);
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Método para revocar refresh token
userSchema.methods.revokeRefreshToken = function(tokenToRevoke) {
  this.refreshTokens = this.refreshTokens.filter(
    tokenObj => tokenObj.token !== tokenToRevoke
  );
  return this.save();
};

// Método para revocar todos los refresh tokens
userSchema.methods.revokeAllRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

// Método para limpiar tokens expirados
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    tokenObj => new Date(tokenObj.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) > now
  );
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
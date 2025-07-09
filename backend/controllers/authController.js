// /backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper function para enviar token en cookie
const sendTokenResponse = async (user, statusCode, res, message = '') => {
  // Crear token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  // Guardar refresh token en BD
  await user.save();

  // Opciones de cookie
  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'strict'
  };

  // Actualizar último login
  user.lastLogin = new Date();
  await user.save();

  // Limpiar campos sensibles antes de enviar
  const userResponse = {
    _id: user._id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    preferences: user.preferences,
    lastLogin: user.lastLogin,
    nombreCompleto: user.nombreCompleto
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      refreshToken,
      user: userResponse
    });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nombre, apellidos, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      apellidos,
      email,
      password
    });

    // Generar token de verificación de email
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Enviar email de verificación
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Verificación de cuenta - Artes Marciales',
        html: `
          <h2>¡Bienvenido a nuestro sistema de Artes Marciales!</h2>
          <p>Hola ${user.nombre},</p>
          <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Verificar Email
          </a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p>${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <br>
          <p>¡Gracias!</p>
          <p>El equipo de Artes Marciales</p>
        `
      });

      console.log('Email de verificación enviado a:', user.email);
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
      // No falla el registro si no se puede enviar el email
    }

    sendTokenResponse(user, 201, res, 'Usuario registrado exitosamente. Por favor verifica tu email.');

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario e incluir password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Tu cuenta está temporalmente bloqueada debido a múltiples intentos de login fallidos'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada'
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Incrementar intentos fallidos
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Login exitoso - resetear intentos fallidos
    await user.resetLoginAttempts();

    sendTokenResponse(user, 200, res, 'Login exitoso');

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Logout usuario
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Obtener refresh token del body o headers
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (refreshToken && req.user) {
      // Revocar refresh token específico
      await req.user.revokeRefreshToken(refreshToken);
    }

    // Limpiar cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const userResponse = {
      _id: user._id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      nombreCompleto: user.nombreCompleto,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      avatar: req.body.avatar,
      preferences: req.body.preferences
    };

    // Remover campos undefined
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    const userResponse = {
      _id: user._id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
      nombreCompleto: user.nombreCompleto
    };

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: userResponse
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await User.findById(req.user._id).select('+password');

    // Verificar contraseña actual
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Revocar todos los refresh tokens por seguridad
    await user.revokeAllRefreshTokens();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Solicitar reset de contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para resetear tu contraseña'
      });
    }

    // Generar token de reset
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset de contraseña - Artes Marciales',
        html: `
          <h2>Solicitud de reset de contraseña</h2>
          <p>Hola ${user.nombre},</p>
          <p>Has solicitado resetear tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Resetear Contraseña
          </a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p>${resetUrl}</p>
          <p>Este enlace expirará en 10 minutos por seguridad.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
          <br>
          <p>¡Gracias!</p>
          <p>El equipo de Artes Marciales</p>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Email de reset enviado'
      });

    } catch (emailError) {
      console.error('Error enviando email de reset:', emailError);
      
      // Limpiar token si no se pudo enviar email
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Error enviando email. Intenta nuevamente.'
      });
    }

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Reset contraseña
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Establecer nueva contraseña
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    
    // Revocar todos los refresh tokens por seguridad
    user.refreshTokens = [];
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña reseteada exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Verificar email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Obtener token hasheado
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o expirado'
      });
    }

    // Marcar email como verificado
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('Error verificando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el refresh token existe en la BD
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no válido'
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive || user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta inactiva o bloqueada'
      });
    }

    // Generar nuevo access token
    const newAccessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: newAccessToken,
      message: 'Token renovado exitosamente'
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Logout de todos los dispositivos
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = async (req, res, next) => {
  try {
    // Revocar todos los refresh tokens
    await req.user.revokeAllRefreshTokens();

    // Limpiar cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Sesiones cerradas en todos los dispositivos'
    });

  } catch (error) {
    console.error('Error en logout all:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
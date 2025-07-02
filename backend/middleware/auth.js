// /backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - requiere autenticación
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token existe en headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Obtener token del header Authorization
      token = req.headers.authorization.split(' ')[1];
    } 
    // Verificar si existe en cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Verificar que el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario actual
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No se encontró usuario con este token'
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tu cuenta ha sido desactivada'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Tu cuenta está temporalmente bloqueada debido a múltiples intentos de login fallidos'
        });
      }

      // Agregar usuario a request
      req.user = user;
      next();

    } catch (error) {
      console.error('Error verificando token:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token no válido'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta'
      });
    }

  } catch (error) {
    console.error('Error en middleware protect:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Autorización por roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a esta ruta'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
      });
    }

    next();
  };
};

// Verificar propietario de recurso (para que usuarios solo puedan editar sus propios datos)
exports.checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      // Admin puede acceder a todo
      if (req.user.role === 'admin') {
        return next();
      }

      // Verificar si el usuario es propietario del recurso
      if (resource.createdBy && resource.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware opcional - no falla si no hay token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Silenciosamente continúa sin usuario si el token es inválido
        console.log('Token opcional inválido:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware optionalAuth:', error);
    next(); // Continúa sin fallar
  }
};

// Verificar refresh token
exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar que el refresh token existe en la base de datos
      const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
      
      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token no válido'
        });
      }

      req.user = user;
      req.refreshToken = refreshToken;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }

  } catch (error) {
    console.error('Error verificando refresh token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para limpiar tokens expirados periódicamente
exports.cleanupTokens = async (req, res, next) => {
  try {
    if (req.user) {
      await req.user.cleanExpiredTokens();
    }
    next();
  } catch (error) {
    console.error('Error limpiando tokens:', error);
    next(); // No fallar por esto
  }
};
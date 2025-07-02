// /backend/middleware/security.js
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const { body, validationResult, param, query } = require('express-validator');

// Rate limiting general
exports.generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para admin en desarrollo
    return process.env.NODE_ENV === 'development' && req.user && req.user.role === 'admin';
  }
});

// Rate limiting estricto para autenticación
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});

// Rate limiting para creación de contenido
exports.createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 creaciones por hora
  message: {
    success: false,
    message: 'Demasiadas creaciones en poco tiempo, intenta nuevamente en una hora'
  },
  skip: (req) => {
    // Admin y moderadores tienen límites más altos
    return req.user && (req.user.role === 'admin' || req.user.role === 'moderator');
  }
});

// Sanitización de datos
exports.sanitizeInput = (req, res, next) => {
  // Remover caracteres HTML maliciosos
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      } else if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => 
          typeof item === 'string' ? xss(item) : item
        );
      }
    }
  }

  // Sanitizar parámetros de query
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }

  next();
};

// Configurar MongoDB sanitize
exports.mongoSanitize = mongoSanitize({
  replaceWith: '_'
});

// Configurar HPP (HTTP Parameter Pollution)
exports.hpp = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'fortalezas', 'debilidades', 'tecnicas']
});

// Middleware de validación de errores
exports.validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones para Usuario
exports.validateRegister = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellidos')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),
  
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder 100 caracteres'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'),
  
  exports.validationHandler
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  exports.validationHandler
];

// Validaciones para Arte Marcial
exports.validateMartialArt = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),
  
  body('paisProcedencia')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El país solo puede contener letras y espacios'),
  
  body('edadOrigen')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La edad de origen debe tener entre 1 y 50 caracteres'),
  
  body('tipo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El tipo debe tener entre 2 y 100 caracteres'),
  
  body('tipoContacto')
    .isIn(['Contacto completo', 'Semi-contacto', 'No-contacto', 'Suave', 'Variable'])
    .withMessage('Tipo de contacto no válido'),
  
  body('demandasFisicas')
    .isIn(['Baja', 'Baja-Media', 'Media', 'Media-Alta', 'Alta', 'Muy alta', 'Variable'])
    .withMessage('Demandas físicas no válidas'),
  
  body('focus')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El focus debe tener entre 2 y 200 caracteres'),
  
  body('filosofia')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La filosofía no puede exceder 1000 caracteres'),
  
  body('historia')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La historia no puede exceder 2000 caracteres'),
  
  body('fortalezas')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Las fortalezas deben ser un array de máximo 20 elementos'),
  
  body('fortalezas.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada fortaleza debe tener entre 1 y 100 caracteres'),
  
  body('debilidades')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Las debilidades deben ser un array de máximo 20 elementos'),
  
  body('debilidades.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada debilidad debe tener entre 1 y 100 caracteres'),
  
  body('tecnicas')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Las técnicas deben ser un array de máximo 30 elementos'),
  
  body('tecnicas.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada técnica debe tener entre 1 y 100 caracteres'),
  
  body('videos')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Los videos deben ser un array de máximo 10 elementos'),
  
  body('videos.*')
    .optional()
    .isURL()
    .withMessage('Cada video debe ser una URL válida'),
  
  body('imagenes')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Las imágenes deben ser un array de máximo 15 elementos'),
  
  body('imagenes.*')
    .optional()
    .isURL()
    .withMessage('Cada imagen debe ser una URL válida'),
  
  exports.validationHandler
];

// Validación para búsqueda
exports.validateSearch = [
  param('term')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
    .withMessage('El término de búsqueda contiene caracteres no válidos'),
  
  exports.validationHandler
];

// Validación para comparación
exports.validateComparison = [
  body('ids')
    .isArray({ min: 2, max: 4 })
    .withMessage('Debe proporcionar entre 2 y 4 IDs para comparar'),
  
  body('ids.*')
    .isMongoId()
    .withMessage('Cada ID debe ser un MongoDB ObjectId válido'),
  
  exports.validationHandler
];

// Validación para ObjectId en parámetros
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID no válido'),
  
  exports.validationHandler
];

// Validación para paginación
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La página debe ser un número entre 1 y 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  
  query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+(\.[a-zA-Z_]+)*$/)
    .withMessage('Campo de ordenamiento no válido'),
  
  exports.validationHandler
];

// Validación para reset de contraseña
exports.validateResetPassword = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Token de reset requerido'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'),
  
  exports.validationHandler
];

// Validación para cambio de contraseña
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'),
  
  exports.validationHandler
];

// Middleware para verificar Content-Type en POST/PUT
exports.checkContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type debe ser application/json'
      });
    }
  }
  next();
};

// Middleware para verificar tamaño del body
exports.checkBodySize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);
  const maxSize = 1024 * 1024; // 1MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'El tamaño del contenido excede el límite permitido (1MB)'
    });
  }
  
  next();
};

// Middleware para headers de seguridad adicionales
exports.securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.header('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Middleware para logging de actividad sospechosa
exports.logSuspiciousActivity = (req, res, next) => {
  const suspicious = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /eval/i,
    /expression/i,
    /document\.cookie/i,
    /document\.write/i
  ];
  
  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;
  
  for (let pattern of suspicious) {
    if (pattern.test(checkString)) {
      console.warn(`🚨 Actividad sospechosa detectada:`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString()
      });
      break;
    }
  }
  
  next();
};
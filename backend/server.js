// /backend/server.js - Versión segura
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Importar configuración de base de datos
const connectDB = require('./config/database');

// Importar rutas
const martialArtsRoutes = require('./routes/martialArts');
const authRoutes = require('./routes/auth');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');
const { 
  mongoSanitize, 
  hpp, 
  securityHeaders, 
  checkContentType, 
  checkBodySize 
} = require('./middleware/security');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// ==========================================
// MIDDLEWARE DE SEGURIDAD
// ==========================================

// Trust proxy (importante para rate limiting y obtener IP real)
app.set('trust proxy', 1);

// Headers de seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false, // Permite embeds de terceros
}));

// Headers de seguridad adicionales
app.use(securityHeaders);

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Refresh-Token'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
};

app.use(cors(corsOptions));

// Logging de requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// MIDDLEWARE DE PARSING Y SANITIZACIÓN
// ==========================================

// Parsear cookies
app.use(cookieParser());

// Verificar Content-Type y tamaño del body
app.use(checkContentType);
app.use(checkBodySize);

// Body parsing con límites de seguridad
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar que el JSON sea válido
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'JSON malformado'
      });
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Sanitización de datos
app.use(mongoSanitize); // Prevenir inyección NoSQL
app.use(hpp); // Prevenir HTTP Parameter Pollution

// ==========================================
// INICIALIZACIÓN DE USUARIO ADMIN
// ==========================================

const initializeAdmin = async () => {
  try {
    const User = require('./models/User');
    
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminUser = await User.create({
        nombre: 'Administrador',
        apellidos: 'Sistema',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        emailVerified: true
      });
      
      console.log('✅ Usuario administrador creado:', adminUser.email);
    }
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
};

// Crear admin después de conectar DB
setTimeout(initializeAdmin, 2000);

// ==========================================
// RUTAS
// ==========================================

// Health check endpoint (sin rate limiting)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'API de Artes Marciales',
    version: '1.0.0',
    description: 'API segura para gestión de artes marciales',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password/:token'
      },
      martialArts: {
        getAll: 'GET /api/martial-arts',
        getById: 'GET /api/martial-arts/:id',
        search: 'GET /api/martial-arts/search/:term',
        compare: 'POST /api/martial-arts/compare',
        create: 'POST /api/martial-arts (Auth required)',
        update: 'PUT /api/martial-arts/:id (Auth required)',
        delete: 'DELETE /api/martial-arts/:id (Admin only)'
      }
    },
    security: {
      authentication: 'JWT Bearer tokens',
      rateLimiting: 'Enabled',
      inputValidation: 'Enabled',
      sanitization: 'Enabled'
    }
  });
});

// Rutas principales con prefijo
app.use('/api/auth', authRoutes);
app.use('/api/martial-arts', martialArtsRoutes);

// ==========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ==========================================

// Middleware para manejar errores de CORS
app.use((err, req, res, next) => {
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado por política CORS'
    });
  }
  next(err);
});

// Middleware personalizado de manejo de errores
app.use(errorHandler);

// Manejar rutas no encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: 'GET /api/health',
      info: 'GET /api/info',
      auth: '/api/auth/*',
      martialArts: '/api/martial-arts/*'
    }
  });
});

// ==========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ==========================================

// Manejar promesas rechazadas no capturadas
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // Cerrar servidor gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('📋 SIGTERM recibido. Cerrando servidor HTTP...');
  server.close(() => {
    console.log('🔴 Proceso HTTP terminado.');
  });
});

process.on('SIGINT', () => {
  console.log('📋 SIGINT recibido. Cerrando servidor HTTP...');
  server.close(() => {
    console.log('🔴 Proceso HTTP terminado.');
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ==========================================');
  console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
  console.log('🚀 ==========================================');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`ℹ️  Info: http://localhost:${PORT}/api/info`);
  console.log(`🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log('   📝 Auth: /api/auth/*');
  console.log('   🥋 Artes Marciales: /api/martial-arts/*');
  console.log('');
  console.log('🔒 Funciones de seguridad activadas:');
  console.log('   ✅ Helmet (headers de seguridad)');
  console.log('   ✅ CORS configurado');
  console.log('   ✅ Rate limiting');
  console.log('   ✅ Validación de entrada');
  console.log('   ✅ Sanitización de datos');
  console.log('   ✅ Autenticación JWT');
  console.log('   ✅ Autorización por roles');
  console.log('🚀 ==========================================');
  console.log('');
});

// Timeout para requests (30 segundos)
server.timeout = 30000;

module.exports = app;
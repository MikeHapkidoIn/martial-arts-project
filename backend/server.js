// /backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const martialArtsRoutes = require('./routes/martialArts');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/martial-arts', martialArtsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Artes Marciales',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      martialArts: '/api/martial-arts'
    }
  });
});

// Middleware de manejo de errores (DEBE ir después de las rutas)
app.use(errorHandler);

// Manejar rutas no encontradas (DEBE ir al final)
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    requestedUrl: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API disponible en: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});


module.exports = app;
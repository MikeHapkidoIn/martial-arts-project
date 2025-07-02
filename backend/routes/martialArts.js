// /backend/routes/martialArts.js - Versión segura
const express = require('express');
const router = express.Router();

// Controladores
const {
  getAllMartialArts,
  getMartialArtById,
  createMartialArt,
  updateMartialArt,
  deleteMartialArt,
  searchMartialArts,
  compareMartialArts,
  initializeData
} = require('../controllers/martialArtController');

// Middleware de autenticación y autorización
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Middleware de seguridad y validación
const {
  generalLimiter,
  createLimiter,
  validateMartialArt,
  validateSearch,
  validateComparison,
  validateObjectId,
  validatePagination,
  sanitizeInput,
  logSuspiciousActivity
} = require('../middleware/security');

// Aplicar middleware global a todas las rutas
router.use(generalLimiter); // Rate limiting general
router.use(sanitizeInput); // Sanitización de entrada
router.use(logSuspiciousActivity); // Log de actividad sospechosa

// =====================================================
// RUTAS PÚBLICAS (Solo lectura)
// =====================================================

// @desc    Obtener todas las artes marciales (con filtros y paginación)
// @route   GET /api/martial-arts
// @access  Public (lectura) / Private (algunos campos adicionales para usuarios autenticados)
router.get('/', 
  optionalAuth, // Autenticación opcional para datos adicionales
  validatePagination,
  getAllMartialArts
);

// @desc    Buscar artes marciales
// @route   GET /api/martial-arts/search/:term
// @access  Public
router.get('/search/:term', 
  validateSearch,
  searchMartialArts
);

// @desc    Comparar artes marciales
// @route   POST /api/martial-arts/compare
// @access  Public
router.post('/compare', 
  validateComparison,
  compareMartialArts
);

// @desc    Obtener arte marcial por ID
// @route   GET /api/martial-arts/:id
// @access  Public
router.get('/:id', 
  validateObjectId,
  optionalAuth, // Datos adicionales para usuarios autenticados
  getMartialArtById
);

// =====================================================
// RUTAS PROTEGIDAS - SOLO USUARIOS AUTENTICADOS
// =====================================================

// @desc    Crear nueva arte marcial
// @route   POST /api/martial-arts
// @access  Private (Admin/Moderator)
router.post('/', 
  protect, // Requiere autenticación
  authorize('admin', 'moderator'), // Solo admin y moderadores
  createLimiter, // Rate limiting para creación
  validateMartialArt, // Validación completa
  createMartialArt
);

// @desc    Actualizar arte marcial
// @route   PUT /api/martial-arts/:id
// @access  Private (Admin/Moderator)
router.put('/:id', 
  protect,
  authorize('admin', 'moderator'),
  validateObjectId,
  validateMartialArt,
  updateMartialArt
);

// @desc    Eliminar arte marcial
// @route   DELETE /api/martial-arts/:id
// @access  Private (Solo Admin)
router.delete('/:id', 
  protect,
  authorize('admin'), // Solo administradores pueden eliminar
  validateObjectId,
  deleteMartialArt
);

// =====================================================
// RUTAS ADMINISTRATIVAS
// =====================================================

// @desc    Inicializar datos (seed database)
// @route   POST /api/martial-arts/admin/initialize
// @access  Private (Solo Admin)
router.post('/admin/initialize', 
  protect,
  authorize('admin'),
  initializeData
);

// @desc    Estadísticas del sistema
// @route   GET /api/martial-arts/admin/stats
// @access  Private (Admin/Moderator)
router.get('/admin/stats', 
  protect,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const MartialArt = require('../models/MartialArt');
      
      const stats = await Promise.all([
        MartialArt.countDocuments(),
        MartialArt.aggregate([
          { $group: { _id: '$paisProcedencia', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        MartialArt.aggregate([
          { $group: { _id: '$tipo', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        MartialArt.aggregate([
          { $group: { _id: '$tipoContacto', count: { $sum: 1 } } }
        ]),
        MartialArt.find({ 
          $or: [
            { videos: { $exists: true, $ne: [] } },
            { imagenes: { $exists: true, $ne: [] } }
          ]
        }).countDocuments()
      ]);

      const [total, byCountry, byType, byContact, withMedia] = stats;

      res.json({
        success: true,
        data: {
          total,
          byCountry,
          byType,
          byContact,
          withMedia,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }
);

// @desc    Backup de datos
// @route   GET /api/martial-arts/admin/backup
// @access  Private (Solo Admin)
router.get('/admin/backup', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const MartialArt = require('../models/MartialArt');
      
      const allData = await MartialArt.find().lean();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=martial-arts-backup-${Date.now()}.json`);
      
      res.json({
        exportDate: new Date().toISOString(),
        count: allData.length,
        data: allData
      });

    } catch (error) {
      console.error('Error creando backup:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando backup'
      });
    }
  }
);

// @desc    Limpiar datos (eliminar todos los registros)
// @route   DELETE /api/martial-arts/admin/cleanup
// @access  Private (Solo Admin)
router.delete('/admin/cleanup', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { confirmPassword } = req.body;
      
      if (!confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña de confirmación requerida'
        });
      }

      // Verificar contraseña del admin
      const User = require('../models/User');
      const admin = await User.findById(req.user._id).select('+password');
      
      const isMatch = await admin.matchPassword(confirmPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta'
        });
      }

      const MartialArt = require('../models/MartialArt');
      const result = await MartialArt.deleteMany({});
      
      console.log(`🗑️ Admin ${req.user.email} eliminó ${result.deletedCount} artes marciales`);

      res.json({
        success: true,
        message: `${result.deletedCount} registros eliminados exitosamente`
      });

    } catch (error) {
      console.error('Error en cleanup:', error);
      res.status(500).json({
        success: false,
        message: 'Error en operación de limpieza'
      });
    }
  }
);

// =====================================================
// RUTAS DE GESTIÓN AVANZADA
// =====================================================

// @desc    Importar datos en lote
// @route   POST /api/martial-arts/admin/import
// @access  Private (Admin/Moderator)
router.post('/admin/import', 
  protect,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const { data, overwrite = false } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos. Se esperaba un array de artes marciales.'
        });
      }

      const MartialArt = require('../models/MartialArt');
      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const artData of data) {
        try {
          if (overwrite && artData.nombre) {
            const existing = await MartialArt.findOne({ nombre: artData.nombre });
            if (existing) {
              await MartialArt.findByIdAndUpdate(existing._id, artData);
              updated++;
              continue;
            }
          }

          await MartialArt.create(artData);
          created++;

        } catch (error) {
          console.error('Error importando:', artData.nombre, error.message);
          errors++;
        }
      }

      res.json({
        success: true,
        message: 'Importación completada',
        stats: {
          created,
          updated,
          errors,
          total: data.length
        }
      });

    } catch (error) {
      console.error('Error en importación:', error);
      res.status(500).json({
        success: false,
        message: 'Error en operación de importación'
      });
    }
  }
);

// @desc    Validar integridad de datos
// @route   GET /api/martial-arts/admin/validate
// @access  Private (Admin/Moderator)
router.get('/admin/validate', 
  protect,
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const MartialArt = require('../models/MartialArt');
      
      const allArts = await MartialArt.find();
      const issues = [];

      for (const art of allArts) {
        const artIssues = [];

        // Validar campos requeridos
        if (!art.nombre || art.nombre.trim() === '') {
          artIssues.push('Nombre faltante o vacío');
        }

        if (!art.paisProcedencia || art.paisProcedencia.trim() === '') {
          artIssues.push('País de procedencia faltante');
        }

        // Validar URLs de videos
        if (art.videos && art.videos.length > 0) {
          art.videos.forEach((video, index) => {
            try {
              new URL(video);
            } catch {
              artIssues.push(`Video ${index + 1}: URL inválida`);
            }
          });
        }

        // Validar URLs de imágenes
        if (art.imagenes && art.imagenes.length > 0) {
          art.imagenes.forEach((imagen, index) => {
            try {
              new URL(imagen);
            } catch {
              artIssues.push(`Imagen ${index + 1}: URL inválida`);
            }
          });
        }

        if (artIssues.length > 0) {
          issues.push({
            id: art._id,
            nombre: art.nombre,
            issues: artIssues
          });
        }
      }

      res.json({
        success: true,
        message: `Validación completada. ${issues.length} registros con problemas encontrados.`,
        totalRecords: allArts.length,
        recordsWithIssues: issues.length,
        issues
      });

    } catch (error) {
      console.error('Error validando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error en validación de datos'
      });
    }
  }
);

module.exports = router;
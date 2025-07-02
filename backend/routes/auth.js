// /backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Controladores
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logoutAll
} = require('../controllers/authController');

// Middleware de autenticación
const { protect, verifyRefreshToken } = require('../middleware/auth');

// Middleware de seguridad
const {
  authLimiter,
  generalLimiter,
  validateRegister,
  validateLogin,
  validateResetPassword,
  validateChangePassword,
  sanitizeInput,
  logSuspiciousActivity
} = require('../middleware/security');

// Aplicar middleware global
router.use(sanitizeInput);
router.use(logSuspiciousActivity);

// =====================================================
// RUTAS PÚBLICAS
// =====================================================

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', 
  authLimiter, // Rate limiting estricto para registro
  validateRegister, // Validación de campos
  register
);

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  authLimiter, // Rate limiting estricto para login
  validateLogin, // Validación de campos
  login
);

// @desc    Solicitar reset de contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', 
  authLimiter, // Rate limiting para prevenir spam
  async (req, res, next) => {
    // Validación simple para email
    const { body } = require('express-validator');
    await body('email').isEmail().normalizeEmail().run(req);
    next();
  },
  forgotPassword
);

// @desc    Reset contraseña con token
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', 
  generalLimiter,
  validateResetPassword,
  resetPassword
);

// @desc    Verificar email con token
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', 
  generalLimiter,
  verifyEmail
);

// @desc    Refresh token (obtener nuevo access token)
// @route   POST /api/auth/refresh-token
// @access  Public
router.post('/refresh-token', 
  generalLimiter,
  verifyRefreshToken,
  refreshToken
);

// =====================================================
// RUTAS PROTEGIDAS
// =====================================================

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/me
// @access  Private
router.get('/me', 
  protect,
  getMe
);

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', 
  protect,
  generalLimiter,
  // Validación para actualización de perfil
  async (req, res, next) => {
    const { body } = require('express-validator');
    
    // Solo validar campos que se están enviando
    if (req.body.nombre) {
      await body('nombre')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios')
        .run(req);
    }
    
    if (req.body.apellidos) {
      await body('apellidos')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Los apellidos solo pueden contener letras y espacios')
        .run(req);
    }
    
    if (req.body.avatar) {
      await body('avatar')
        .optional()
        .isURL()
        .withMessage('El avatar debe ser una URL válida')
        .run(req);
    }
    
    next();
  },
  updateProfile
);

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', 
  protect,
  authLimiter, // Rate limiting para cambios de contraseña
  validateChangePassword,
  changePassword
);

// @desc    Logout (cerrar sesión actual)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', 
  protect,
  logout
);

// @desc    Logout de todos los dispositivos
// @route   POST /api/auth/logout-all
// @access  Private
router.post('/logout-all', 
  protect,
  logoutAll
);

// =====================================================
// RUTAS ADMINISTRATIVAS
// =====================================================

const { authorize } = require('../middleware/auth');

// @desc    Obtener todos los usuarios (Admin)
// @route   GET /api/auth/admin/users
// @access  Private (Admin)
router.get('/admin/users', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      
      const { page = 1, limit = 20, search = '', role = '' } = req.query;
      
      // Construir filtros
      const filter = {};
      
      if (search) {
        filter.$or = [
          { nombre: { $regex: search, $options: 'i' } },
          { apellidos: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role) {
        filter.role = role;
      }
      
      // Paginación
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password -refreshTokens -passwordResetToken -emailVerificationToken')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filter)
      ]);
      
      res.json({
        success: true,
        data: users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios'
      });
    }
  }
);

// @desc    Actualizar rol de usuario (Admin)
// @route   PUT /api/auth/admin/users/:id/role
// @access  Private (Admin)
router.put('/admin/users/:id/role', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol no válido'
        });
      }
      
      const User = require('../models/User');
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // No permitir que un admin se quite sus propios permisos
      if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'No puedes cambiar tu propio rol de administrador'
        });
      }
      
      user.role = role;
      await user.save();
      
      console.log(`👤 Admin ${req.user.email} cambió rol de ${user.email} a ${role}`);
      
      res.json({
        success: true,
        message: `Rol actualizado a ${role}`,
        data: {
          _id: user._id,
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Error actualizando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando rol'
      });
    }
  }
);

// @desc    Desactivar/Activar usuario (Admin)
// @route   PUT /api/auth/admin/users/:id/status
// @access  Private (Admin)
router.put('/admin/users/:id/status', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Estado debe ser true o false'
        });
      }
      
      const User = require('../models/User');
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // No permitir que un admin se desactive a sí mismo
      if (user._id.toString() === req.user._id.toString() && !isActive) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
      }
      
      user.isActive = isActive;
      
      // Si se desactiva, revocar todos los tokens
      if (!isActive) {
        user.refreshTokens = [];
      }
      
      await user.save();
      
      console.log(`👤 Admin ${req.user.email} ${isActive ? 'activó' : 'desactivó'} a ${user.email}`);
      
      res.json({
        success: true,
        message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: {
          _id: user._id,
          email: user.email,
          isActive: user.isActive
        }
      });
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando estado del usuario'
      });
    }
  }
);

// @desc    Obtener estadísticas de usuarios (Admin)
// @route   GET /api/auth/admin/stats
// @access  Private (Admin)
router.get('/admin/stats', 
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      
      const stats = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ emailVerified: true }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('nombre apellidos email role createdAt')
      ]);
      
      const [total, active, verified, byRole, recent] = stats;
      
      res.json({
        success: true,
        data: {
          total,
          active,
          verified,
          inactive: total - active,
          unverified: total - verified,
          byRole: byRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          recentUsers: recent,
          lastUpdated: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }
);

module.exports = router;
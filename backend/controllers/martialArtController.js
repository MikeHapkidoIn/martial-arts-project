// /backend/controllers/martialArtController.js - Versión segura
const MartialArt = require('../models/MartialArt');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

// Helper function para sanitizar datos de salida
const sanitizeOutput = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeOutput(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    // Remover campos sensibles si existen
    delete sanitized.__v;
    delete sanitized.createdBy; // Solo para usuarios no autenticados
    
    return sanitized;
  }
  
  return data;
};

// Helper function para aplicar filtros de búsqueda
const buildSearchQuery = (searchTerm, filters = {}) => {
  const query = {};
  
  // Búsqueda por término
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim();
    query.$or = [
      { nombre: { $regex: term, $options: 'i' } },
      { paisProcedencia: { $regex: term, $options: 'i' } },
      { tipo: { $regex: term, $options: 'i' } },
      { focus: { $regex: term, $options: 'i' } },
      { fortalezas: { $regex: term, $options: 'i' } },
      { tecnicas: { $regex: term, $options: 'i' } }
    ];
  }
  
  // Aplicar filtros adicionales
  if (filters.tipo) {
    query.tipo = { $regex: filters.tipo, $options: 'i' };
  }
  
  if (filters.paisProcedencia) {
    query.paisProcedencia = { $regex: filters.paisProcedencia, $options: 'i' };
  }
  
  if (filters.tipoContacto) {
    query.tipoContacto = filters.tipoContacto;
  }
  
  if (filters.demandasFisicas) {
    query.demandasFisicas = filters.demandasFisicas;
  }
  
  return query;
};

// @desc    Obtener todas las artes marciales
// @route   GET /api/martial-arts
// @access  Public (con datos adicionales para usuarios autenticados)
exports.getAllMartialArts = async (req, res, next) => {
  try {
    // Extraer parámetros de query
    const {
      page = 1,
      limit = 20,
      sort = 'nombre',
      search = '',
      tipo = '',
      paisProcedencia = '',
      tipoContacto = '',
      demandasFisicas = ''
    } = req.query;

    // Validar parámetros de paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Máximo 100 por página
    const skip = (pageNum - 1) * limitNum;

    // Construir query de búsqueda
    const searchQuery = buildSearchQuery(search, {
      tipo,
      paisProcedencia,
      tipoContacto,
      demandasFisicas
    });

    // Validar campo de ordenamiento
    const allowedSortFields = [
      'nombre', 'paisProcedencia', 'edadOrigen', 'tipo', 
      'tipoContacto', 'demandasFisicas', 'createdAt', 'updatedAt'
    ];
    
    let sortField = 'nombre';
    let sortOrder = 1;
    
    if (sort) {
      if (sort.startsWith('-')) {
        sortField = sort.substring(1);
        sortOrder = -1;
      } else {
        sortField = sort;
      }
      
      if (!allowedSortFields.includes(sortField)) {
        sortField = 'nombre';
        sortOrder = 1;
      }
    }

    const sortObj = { [sortField]: sortOrder };

    // Ejecutar consultas en paralelo
    const [martialArts, total] = await Promise.all([
      MartialArt.find(searchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Usar lean() para mejor performance
      MartialArt.countDocuments(searchQuery)
    ]);

    // Sanitizar datos según el tipo de usuario
    let responseData = martialArts;
    
    if (!req.user) {
      // Para usuarios no autenticados, limitar algunos datos
      responseData = martialArts.map(art => ({
        ...art,
        // Limitar videos e imágenes para usuarios no autenticados
        videos: art.videos ? art.videos.slice(0, 2) : [],
        imagenes: art.imagenes ? art.imagenes.slice(0, 3) : []
      }));
    }

    // Metadatos de paginación
    const pagination = {
      current: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      limit: limitNum,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    };

    // Información adicional
    const meta = {
      search: search || null,
      filters: {
        tipo: tipo || null,
        paisProcedencia: paisProcedencia || null,
        tipoContacto: tipoContacto || null,
        demandasFisicas: demandasFisicas || null
      },
      sort: sort || 'nombre',
      authenticated: !!req.user
    };

    res.json({
      success: true,
      count: responseData.length,
      data: responseData,
      pagination,
      meta
    });

  } catch (error) {
    console.error('Error obteniendo artes marciales:', error);
    next(error);
  }
};

// @desc    Obtener una arte marcial por ID
// @route   GET /api/martial-arts/:id
// @access  Public (con datos adicionales para usuarios autenticados)
exports.getMartialArtById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const martialArt = await MartialArt.findById(id).lean();
    
    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    // Para usuarios no autenticados, ocultar algunos campos o limitarlos
    let responseData = { ...martialArt };
    
    if (!req.user) {
      // Limitar multimedia para usuarios no autenticados
      responseData.videos = martialArt.videos ? martialArt.videos.slice(0, 3) : [];
      responseData.imagenes = martialArt.imagenes ? martialArt.imagenes.slice(0, 5) : [];
    }

    // Buscar artes marciales relacionadas (mismo país o tipo)
    const related = await MartialArt.find({
      $and: [
        { _id: { $ne: id } },
        {
          $or: [
            { paisProcedencia: martialArt.paisProcedencia },
            { tipo: martialArt.tipo }
          ]
        }
      ]
    })
    .limit(4)
    .select('nombre paisProcedencia tipo focus')
    .lean();

    res.json({
      success: true,
      data: responseData,
      related,
      meta: {
        authenticated: !!req.user,
        limitations: !req.user ? 'Algunos contenidos limitados. Inicia sesión para acceso completo.' : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo arte marcial:', error);
    next(error);
  }
};

// @desc    Crear nueva arte marcial
// @route   POST /api/martial-arts
// @access  Private (Admin/Moderator)
exports.createMartialArt = async (req, res, next) => {
  try {
    // Agregar información del creador
    const artData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Verificar si ya existe una arte marcial con el mismo nombre
    const existingArt = await MartialArt.findOne({ 
      nombre: { $regex: new RegExp(`^${req.body.nombre}$`, 'i') }
    });

    if (existingArt) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una arte marcial con ese nombre'
      });
    }

    const martialArt = await MartialArt.create(artData);
    
    // Log de auditoría
    console.log(`➕ ${req.user.role} ${req.user.email} creó arte marcial: ${martialArt.nombre}`);
    
    res.status(201).json({
      success: true,
      message: 'Arte marcial creada exitosamente',
      data: martialArt
    });

  } catch (error) {
    console.error('Error creando arte marcial:', error);
    
    // Manejar errores de validación específicos
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    next(error);
  }
};

// @desc    Actualizar arte marcial
// @route   PUT /api/martial-arts/:id
// @access  Private (Admin/Moderator)
exports.updateMartialArt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que la arte marcial existe
    let martialArt = await MartialArt.findById(id);

    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    // Verificar si el nombre ya existe (excluyendo el actual)
    if (req.body.nombre) {
      const existingArt = await MartialArt.findOne({ 
        nombre: { $regex: new RegExp(`^${req.body.nombre}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingArt) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otra arte marcial con ese nombre'
        });
      }
    }

    // Agregar información de modificación
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id,
      lastModifiedAt: new Date()
    };

    martialArt = await MartialArt.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    // Log de auditoría
    console.log(`✏️ ${req.user.role} ${req.user.email} actualizó arte marcial: ${martialArt.nombre}`);

    res.json({
      success: true,
      message: 'Arte marcial actualizada exitosamente',
      data: martialArt
    });

  } catch (error) {
    console.error('Error actualizando arte marcial:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
    
    next(error);
  }
};

// @desc    Eliminar arte marcial
// @route   DELETE /api/martial-arts/:id
// @access  Private (Solo Admin)
exports.deleteMartialArt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const martialArt = await MartialArt.findById(id);

    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    // Soft delete: marcar como eliminado en lugar de eliminar físicamente
    // (puedes implementar un campo 'deleted' si prefieres soft delete)
    await MartialArt.findByIdAndDelete(id);

    // Log de auditoría
    console.log(`🗑️ Admin ${req.user.email} eliminó arte marcial: ${martialArt.nombre}`);

    res.json({
      success: true,
      message: 'Arte marcial eliminada exitosamente',
      data: {
        id: martialArt._id,
        nombre: martialArt.nombre
      }
    });

  } catch (error) {
    console.error('Error eliminando arte marcial:', error);
    next(error);
  }
};

// @desc    Buscar artes marciales
// @route   GET /api/martial-arts/search/:term
// @access  Public
exports.searchMartialArts = async (req, res, next) => {
  try {
    const { term } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    // Validar límites
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 50); // Máximo 50 para búsquedas
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * limitNum;
    
    const searchQuery = buildSearchQuery(term);
    
    // Buscar con paginación
    const [martialArts, total] = await Promise.all([
      MartialArt.find(searchQuery)
        .sort({ nombre: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MartialArt.countDocuments(searchQuery)
    ]);

    // Limitar datos para usuarios no autenticados
    let responseData = martialArts;
    if (!req.user) {
      responseData = martialArts.map(art => ({
        ...art,
        videos: art.videos ? art.videos.slice(0, 1) : [],
        imagenes: art.imagenes ? art.imagenes.slice(0, 2) : []
      }));
    }

    res.json({
      success: true,
      count: responseData.length,
      total,
      data: responseData,
      searchTerm: term,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Error buscando artes marciales:', error);
    next(error);
  }
};

// @desc    Comparar artes marciales
// @route   POST /api/martial-arts/compare
// @access  Public
exports.compareMartialArts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    // Validar que todos los IDs sean únicos
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden comparar artes marciales duplicadas'
      });
    }

    const martialArts = await MartialArt.find({ _id: { $in: ids } }).lean();
    
    if (martialArts.length !== ids.length) {
      return res.status(404).json({
        success: false,
        message: 'Una o más artes marciales no fueron encontradas'
      });
    }

    // Generar análisis comparativo
    const comparison = {
      artes: martialArts,
      similitudes: [],
      diferencias: [],
      estadisticas: {}
    };

    // Análizar similitudes
    const campos = ['paisProcedencia', 'tipo', 'tipoContacto', 'demandasFisicas'];
    campos.forEach(campo => {
      const valores = martialArts.map(art => art[campo]);
      const valoresUnicos = [...new Set(valores)];
      
      if (valoresUnicos.length === 1) {
        comparison.similitudes.push({
          campo,
          valor: valoresUnicos[0]
        });
      } else {
        comparison.diferencias.push({
          campo,
          valores: martialArts.map(art => ({
            nombre: art.nombre,
            valor: art[campo]
          }))
        });
      }
    });

    // Estadísticas básicas
    comparison.estadisticas = {
      totalComparadas: martialArts.length,
      paisesRepresentados: [...new Set(martialArts.map(art => art.paisProcedencia))].length,
      tiposUnicos: [...new Set(martialArts.map(art => art.tipo))].length,
      similitudesEncontradas: comparison.similitudes.length,
      diferenciasEncontradas: comparison.diferencias.length
    };

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error comparando artes marciales:', error);
    next(error);
  }
};

// @desc    Inicializar datos
// @route   POST /api/martial-arts/admin/initialize
// @access  Private (Solo Admin)
exports.initializeData = async (req, res, next) => {
  try {
    console.log('🔄 Iniciando carga de datos...');
    
    const count = await MartialArt.countDocuments();
    console.log(`📊 Documentos existentes: ${count}`);
    
    if (count === 0) {
      console.log('📥 Insertando datos iniciales...');
      
      // Agregar información del creador a cada arte marcial
      const dataWithCreator = initialData.map(art => ({
        ...art,
        createdBy: req.user._id
      }));
      
      const result = await MartialArt.insertMany(dataWithCreator);
      console.log(`✅ ${result.length} artes marciales insertadas`);
      
      // Log de auditoría
      console.log(`🌱 Admin ${req.user.email} inicializó la base de datos con ${result.length} artes marciales`);
      
      res.json({
        success: true,
        message: `${result.length} artes marciales cargadas exitosamente`,
        data: {
          count: result.length,
          initializedBy: req.user.email,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.log('ℹ️ Los datos ya existen');
      res.json({
        success: true,
        message: `Los datos ya existen en la base de datos. Total: ${count} artes marciales`,
        data: {
          count,
          existingData: true
        }
      });
    }
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    next(error);
  }
};
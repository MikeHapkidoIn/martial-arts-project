// /backend/controllers/martialArtController.js
const MartialArt = require('../models/MartialArt');
const initialData = require('../data/initialData');
const mongoose = require('mongoose');

// Obtener todas las artes marciales
exports.getAllMartialArts = async (req, res, next) => {
  try {
    const martialArts = await MartialArt.find().sort({ nombre: 1 });
    res.json({
      success: true,
      count: martialArts.length,
      data: martialArts
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una arte marcial por ID
exports.getMartialArtById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID no válido'
      });
    }
    
    const martialArt = await MartialArt.findById(id);
    
    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    res.json({
      success: true,
      data: martialArt
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva arte marcial
exports.createMartialArt = async (req, res, next) => {
  try {
    const martialArt = await MartialArt.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Arte marcial creada exitosamente',
      data: martialArt
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar arte marcial
exports.updateMartialArt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID no válido'
      });
    }
    
    const martialArt = await MartialArt.findByIdAndUpdate(
      id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Arte marcial actualizada exitosamente',
      data: martialArt
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar arte marcial
exports.deleteMartialArt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID no válido'
      });
    }
    
    const martialArt = await MartialArt.findByIdAndDelete(id);

    if (!martialArt) {
      return res.status(404).json({
        success: false,
        message: 'Arte marcial no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Arte marcial eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Buscar artes marciales
exports.searchMartialArts = async (req, res, next) => {
  try {
    const { term } = req.params;
    
    if (!term || term.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }
    
    const martialArts = await MartialArt.find({
      $or: [
        { nombre: { $regex: term, $options: 'i' } },
        { paisProcedencia: { $regex: term, $options: 'i' } },
        { tipo: { $regex: term, $options: 'i' } },
        { focus: { $regex: term, $options: 'i' } }
      ]
    }).sort({ nombre: 1 });

    res.json({
      success: true,
      count: martialArts.length,
      data: martialArts
    });
  } catch (error) {
    next(error);
  }
};

// Comparar artes marciales
exports.compareMartialArts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren al menos 2 IDs para comparar'
      });
    }

    // Validar que todos los IDs sean válidos
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs no válidos encontrados',
        invalidIds
      });
    }

    const martialArts = await MartialArt.find({ _id: { $in: ids } });
    
    res.json({
      success: true,
      count: martialArts.length,
      data: martialArts
    });
  } catch (error) {
    next(error);
  }
};

// Inicializar datos
exports.initializeData = async (req, res, next) => {
  try {
    console.log('🔄 Iniciando carga de datos...');
    
    const count = await MartialArt.countDocuments();
    console.log(`📊 Documentos existentes: ${count}`);
    
    if (count === 0) {
      console.log('📥 Insertando datos iniciales...');
      const result = await MartialArt.insertMany(initialData);
      console.log(`✅ ${result.length} artes marciales insertadas`);
      
      res.json({
        success: true,
        message: `${result.length} artes marciales cargadas exitosamente`,
        data: result
      });
    } else {
      console.log('ℹ️ Los datos ya existen');
      res.json({
        success: true,
        message: `Los datos ya existen en la base de datos. Total: ${count} artes marciales`,
        count
      });
    }
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    next(error);
  }
};
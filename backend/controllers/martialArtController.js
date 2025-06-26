// /backend/controllers/martialArtController.js

const MartialArt = require('../models/MartialArt');
const initialData = require('../data/initialData');

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
    const martialArt = await MartialArt.findById(req.params.id);
    
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
    const martialArt = await MartialArt.findByIdAndUpdate(
      req.params.id,
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
    const martialArt = await MartialArt.findByIdAndDelete(req.params.id);

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
    const count = await MartialArt.countDocuments();
    
    if (count === 0) {
      await MartialArt.insertMany(initialData);
      res.json({
        success: true,
        message: `${initialData.length} artes marciales cargadas exitosamente`
      });
    } else {
      res.json({
        success: true,
        message: 'Los datos ya existen en la base de datos'
      });
    }
  } catch (error) {
    next(error);
  }
};
// /backend/models/MartialArt.js
const mongoose = require('mongoose');

const martialArtSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es requerido'], 
    unique: true,
    trim: true
  },
  paisProcedencia: { 
    type: String, 
    required: [true, 'El país de procedencia es requerido'],
    trim: true
  },
  edadOrigen: { 
    type: String, 
    required: [true, 'La edad de origen es requerida'],
    trim: true
  },
  tipo: { 
    type: String, 
    required: [true, 'El tipo es requerido'],
    trim: true
  },
  distanciasTrabajadas: {
    type: [String],
    default: []
  },
  armas: {
    type: [String],
    default: []
  },
  tipoContacto: { 
    type: String, 
    required: [true, 'El tipo de contacto es requerido'],
    enum: {
      values: ['Contacto completo', 'Semi-contacto', 'No-contacto', 'Suave', 'Variable'],
      message: '{VALUE} no es un tipo de contacto válido'
    }
  },
  focus: { 
    type: String, 
    required: [true, 'El focus es requerido'],
    trim: true
  },
  fortalezas: {
    type: [String],
    default: []
  },
  debilidades: {
    type: [String],
    default: []
  },
  demandasFisicas: { 
    type: String, 
    required: [true, 'Las demandas físicas son requeridas'],
    enum: {
      values: ['Baja', 'Baja-Media', 'Media', 'Media-Alta', 'Alta', 'Muy alta', 'Variable'],
      message: '{VALUE} no es una demanda física válida'
    }
  },
  tecnicas: {
    type: [String],
    default: []
  },
  filosofia: { 
    type: String, 
    required: [true, 'La filosofía es requerida'],
    trim: true
  },
  historia: { 
    type: String, 
    default: '',
    trim: true
  },
  imagenes: {
    type: [String],
    default: []
  },
  videos: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsqueda
martialArtSchema.index({ nombre: 'text', paisProcedencia: 'text', tipo: 'text', focus: 'text' });

module.exports = mongoose.model('MartialArt', martialArtSchema);
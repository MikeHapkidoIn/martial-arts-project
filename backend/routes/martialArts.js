// /backend/routes/martialArts.js
const express = require('express');
const router = express.Router();
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

// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES que las rutas con parámetros
// Si /:id va antes que /initialize, Express interpreta "initialize" como un ID

// 1. Rutas POST específicas primero
router.post('/initialize', initializeData);
router.post('/compare', compareMartialArts);

// 2. Rutas GET específicas antes de /:id
router.get('/search/:term', searchMartialArts);

// 3. Rutas básicas sin parámetros
router.get('/', getAllMartialArts);
router.post('/', createMartialArt);

// 4. Rutas con parámetros ID AL FINAL
router.get('/:id', getMartialArtById);
router.put('/:id', updateMartialArt);
router.delete('/:id', deleteMartialArt);

module.exports = router;
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

// Rutas
router.get('/', getAllMartialArts);
router.get('/search/:term', searchMartialArts);
router.get('/:id', getMartialArtById);
router.post('/', createMartialArt);
router.put('/:id', updateMartialArt);
router.delete('/:id', deleteMartialArt);
router.post('/compare', compareMartialArts);
router.post('/initialize', initializeData);

module.exports = router;
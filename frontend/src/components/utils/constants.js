export const CONTACT_TYPES = [
  'Contacto completo',
  'Semi-contacto', 
  'No-contacto',
  'Suave',
  'Variable'
];

export const PHYSICAL_DEMANDS = [
  'Baja',
  'Baja-Media',
  'Media', 
  'Media-Alta',
  'Alta',
  'Muy alta'
];

export const DISTANCES = [
  'Corta',
  'Media',
  'Larga'
];

export const MARTIAL_ART_TYPES = [
  'Arte marcial tradicional',
  'Arte marcial moderno',
  'Sistema de combate',
  'Deporte de combate',
  'Arte marcial mixto',
  'Arte marcial interno',
  'Lucha tradicional',
  'Arte marcial cultural',
  'Arte marcial deportivo',
  'Arte marcial soviético',
  'Arte de desenvainar la espada',
  'Filosofía de combate'
];

export const API_ENDPOINTS = {
  MARTIAL_ARTS: '/martial-arts',
  SEARCH: '/martial-arts/search',
  COMPARE: '/martial-arts/compare',
  INITIALIZE: '/martial-arts/initialize'
};

export const VIEW_MODES = {
  LIST: 'list',
  ADMIN: 'admin', 
  FORM: 'form',
  DETAIL: 'detail',
  COMPARE: 'compare'
};

export const MAX_COMPARE_ITEMS = 4;
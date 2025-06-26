import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios de artes marciales
export const martialArtsAPI = {
  // Obtener todas las artes marciales
  getAll: () => api.get('/martial-arts'),
  
  // Obtener por ID
  getById: (id) => api.get(`/martial-arts/${id}`),
  
  // Crear nueva
  create: (data) => api.post('/martial-arts', data),
  
  // Actualizar
  update: (id, data) => api.put(`/martial-arts/${id}`, data),
  
  // Eliminar
  delete: (id) => api.delete(`/martial-arts/${id}`),
  
  // Buscar
  search: (term) => api.get(`/martial-arts/search/${term}`),
  
  // Comparar
  compare: (ids) => api.post('/martial-arts/compare', { ids }),
  
  // Inicializar datos
  initialize: () => api.post('/martial-arts/initialize'),
};

export default api;
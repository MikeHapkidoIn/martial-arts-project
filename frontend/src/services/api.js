// /frontend/src/services/api.js
import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Devolver solo los datos
  },
  async (error) => {
    const originalRequest = error.config;

    console.log('Error en interceptor:', {
      status: error.response?.status,
      url: originalRequest?.url,
      hasRetried: originalRequest._retry
    });

    // Si el error es 401 y no hemos intentado refresh todavía
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest?.url !== '/auth/login') {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Intentando refresh token...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          if (response.data.success) {
            console.log('Token refrescado exitosamente');
            localStorage.setItem('token', response.data.token);
            axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.token}`;
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refrescando token:', refreshError);
        // Si falla el refresh, limpiar tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // No redirigir automáticamente, dejar que el componente maneje esto
      }
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
const authAPI = {
  login: async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await axiosInstance.post('/auth/register', userData);
  },

  logout: async (data = {}) => {
    return await axiosInstance.post('/auth/logout', data);
  },

  getMe: async () => {
    return await axiosInstance.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await axiosInstance.put('/auth/me', profileData);
  },

  changePassword: async (passwordData) => {
    return await axiosInstance.put('/auth/change-password', passwordData);
  },

  forgotPassword: async (email) => {
    return await axiosInstance.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return await axiosInstance.post(`/auth/reset-password/${token}`, { password });
  },

  verifyEmail: async (token) => {
    return await axiosInstance.get(`/auth/verify-email/${token}`);
  },

  refreshToken: async (refreshToken) => {
    return await axiosInstance.post('/auth/refresh-token', { refreshToken });
  }
};

// Servicios de artes marciales
const martialArtsAPI = {
  // Obtener todas las artes marciales
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/martial-arts?${queryString}` : '/martial-arts';
    return await axiosInstance.get(url);
  },

  // Obtener por ID
  getById: async (id) => {
    return await axiosInstance.get(`/martial-arts/${id}`);
  },

  // Buscar
  search: async (term, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/martial-arts/search/${term}?${queryString}` : `/martial-arts/search/${term}`;
    return await axiosInstance.get(url);
  },

  // Comparar
  compare: async (ids) => {
    return await axiosInstance.post('/martial-arts/compare', { ids });
  },

  // Crear nueva (requiere autenticación)
  create: async (artData) => {
    return await axiosInstance.post('/martial-arts', artData);
  },

  // Actualizar (requiere autenticación)
  update: async (id, artData) => {
    return await axiosInstance.put(`/martial-arts/${id}`, artData);
  },

  // Eliminar (requiere autenticación)
  delete: async (id) => {
    return await axiosInstance.delete(`/martial-arts/${id}`);
  },

  // Inicializar datos (admin)
  initialize: async () => {
    return await axiosInstance.post('/martial-arts/admin/initialize');
  },

  // Obtener estadísticas (admin/moderator)
  getStats: async () => {
    return await axiosInstance.get('/martial-arts/admin/stats');
  },

  // Backup de datos (admin)
  backup: async () => {
    return await axiosInstance.get('/martial-arts/admin/backup');
  },

  // Limpiar datos (admin)
  cleanup: async (confirmPassword) => {
    return await axiosInstance.delete('/martial-arts/admin/cleanup', {
      data: { confirmPassword }
    });
  },

  // Importar datos (admin/moderator)
  import: async (data, overwrite = false) => {
    return await axiosInstance.post('/martial-arts/admin/import', { data, overwrite });
  },

  // Validar integridad (admin/moderator)
  validate: async () => {
    return await axiosInstance.get('/martial-arts/admin/validate');
  }
};

// Servicios de usuario (admin)
const userAPI = {
  // Obtener todos los usuarios (admin)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/auth/admin/users?${queryString}` : '/auth/admin/users';
    return await axiosInstance.get(url);
  },

  // Actualizar rol (admin)
  updateRole: async (userId, role) => {
    return await axiosInstance.put(`/auth/admin/users/${userId}/role`, { role });
  },

  // Activar/desactivar usuario (admin)
  updateStatus: async (userId, isActive) => {
    return await axiosInstance.put(`/auth/admin/users/${userId}/status`, { isActive });
  },

  // Obtener estadísticas (admin)
  getStats: async () => {
    return await axiosInstance.get('/auth/admin/stats');
  }
};

// Utilidad para manejar errores de API
const handleAPIError = (error) => {
  if (error.response) {
    // El servidor respondió con un status de error
    return {
      message: error.response.data?.message || 'Error del servidor',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // La request fue hecha pero no hubo respuesta
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      status: null,
      data: null
    };
  } else {
    // Algo más pasó
    return {
      message: error.message || 'Error desconocido',
      status: null,
      data: null
    };
  }
};

// Utilidad para verificar si el usuario está online
const checkConnection = async () => {
  try {
    await axiosInstance.get('/health');
    return true;
  } catch (error) {
    return false;
  }
};

// Exportar todo
export {
  authAPI,
  martialArtsAPI,
  userAPI,
  handleAPIError,
  checkConnection
};

export default axiosInstance;
const API_BASE_URL = 'http://localhost:5000/api';

export const martialArtsAPI = {
  // Obtener todas las artes marciales
  getAll: async () => {
    try {
      console.log('🔍 Haciendo petición a:', `${API_BASE_URL}/martial-arts`);
      
      const response = await fetch(`${API_BASE_URL}/martial-arts`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      console.log('📦 Datos recibidos:', responseData);
      console.log('📦 Cantidad de artes marciales:', responseData.data?.length);
      
      // Devolver solo el array de artes marciales
      return { data: responseData.data };
    } catch (error) {
      console.error('❌ Error completo:', error);
      throw error;
    }
  },

  // Obtener una arte marcial por ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/martial-arts/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('❌ Error al obtener arte marcial:', error);
      throw error;
    }
  },

  // Crear nueva arte marcial
  create: async (artData) => {
    try {
      console.log('➕ Creando nueva arte marcial:', artData);
      
      const response = await fetch(`${API_BASE_URL}/martial-arts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artData),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Arte marcial creada:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Error al crear:', error);
      throw error;
    }
  },

  // Actualizar arte marcial
  update: async (id, artData) => {
    try {
      console.log('✏️ Actualizando arte marcial:', id, artData);
      
      const response = await fetch(`${API_BASE_URL}/martial-arts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artData),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Arte marcial actualizada:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      throw error;
    }
  },

  // Eliminar arte marcial
  delete: async (id) => {
    try {
      console.log('🗑️ Eliminando arte marcial:', id);
      
      const response = await fetch(`${API_BASE_URL}/martial-arts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Arte marcial eliminada:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      throw error;
    }
  },

  // Buscar artes marciales
  search: async (term) => {
    try {
      const response = await fetch(`${API_BASE_URL}/martial-arts/search/${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return { data: responseData.data || responseData };
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      throw error;
    }
  },

  // Filtrar artes marciales
  filter: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/martial-arts/filter?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return { data: responseData.data || responseData };
    } catch (error) {
      console.error('❌ Error en filtrado:', error);
      throw error;
    }
  },

  // Comparar artes marciales
  compare: async (id1, id2) => {
    try {
      const response = await fetch(`${API_BASE_URL}/martial-arts/compare/${id1}/${id2}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('❌ Error en comparación:', error);
      throw error;
    }
  },

  // Inicializar datos (si es necesario)
  initialize: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/martial-arts/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      throw error;
    }
  }
};

export default martialArtsAPI;
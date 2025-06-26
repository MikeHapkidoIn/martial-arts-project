const API_BASE_URL = 'http://localhost:5000/api';

export const martialArtsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/artes-marciales`);
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default martialArtsAPI;
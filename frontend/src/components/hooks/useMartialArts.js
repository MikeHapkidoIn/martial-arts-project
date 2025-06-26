import { useState, useEffect } from 'react';
import { martialArtsAPI } from '../services/api';

export const useMartialArts = () => {
  const [martialArts, setMartialArts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMartialArts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await martialArtsAPI.getAll();
      setMartialArts(response.data || []);
    } catch (err) {
      setError('Error al cargar las artes marciales');
      console.error('Error fetching martial arts:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchMartialArts = async (term) => {
    if (!term || term.trim() === '') {
      return fetchMartialArts();
    }

    try {
      setLoading(true);
      setError(null);
      const response = await martialArtsAPI.search(term);
      setMartialArts(response.data || []);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error('Error searching martial arts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMartialArt = async (data) => {
    try {
      const response = await martialArtsAPI.create(data);
      await fetchMartialArts(); // Refresh list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateMartialArt = async (id, data) => {
    try {
      const response = await martialArtsAPI.update(id, data);
      await fetchMartialArts(); // Refresh list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteMartialArt = async (id) => {
    try {
      await martialArtsAPI.delete(id);
      await fetchMartialArts(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMartialArts();
  }, []);

  return {
    martialArts,
    loading,
    error,
    fetchMartialArts,
    searchMartialArts,
    createMartialArt,
    updateMartialArt,
    deleteMartialArt
  };
};
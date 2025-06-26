// /frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Componentes
import Layout from './components/layout/Layout';
import MartialArtsList from './components/martial-arts/MartialArtsList';
import MartialArtDetail from './components/martial-arts/MartialArtDetail';
import MartialArtCompare from './components/martial-arts/MartialArtCompare';
import AdminPanel from './components/admin/AdminPanel';
import MartialArtForm from './components/admin/MartialArtForm';

// Servicios y hooks
import { martialArtsAPI } from './services/api';
import { VIEW_MODES } from './utils/constants';

// Estilos
import './styles/index.css';

function App() {
  // Estados globales
  const [martialArts, setMartialArts] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      // Intentar obtener datos existentes
      const response = await martialArtsAPI.getAll();
      
      if (response.data && response.data.length > 0) {
        setMartialArts(response.data);
      } else {
        // Si no hay datos, inicializar
        await martialArtsAPI.initialize();
        const newResponse = await martialArtsAPI.getAll();
        setMartialArts(newResponse.data || []);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar las artes marciales');
      console.error('Error initializing app:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar datos
  const fetchMartialArts = async () => {
    try {
      setLoading(true);
      const response = await martialArtsAPI.getAll();
      setMartialArts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las artes marciales');
      console.error('Error fetching martial arts:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchMartialArts = async (term) => {
    if (!term || term.trim() === '') {
      await fetchMartialArts();
      return;
    }

    try {
      setLoading(true);
      const response = await martialArtsAPI.search(term);
      setMartialArts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error('Error searching martial arts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (art) => {
    setCompareList(prev => {
      const exists = prev.find(item => item._id === art._id);
      if (exists) {
        return prev.filter(item => item._id !== art._id);
      } else if (prev.length < 4) {
        return [...prev, art];
      } else {
        return prev; // No agregar si ya hay 4
      }
    });
  };

  const clearCompareList = () => {
    setCompareList([]);
  };

  // Props comunes para los componentes
  const commonProps = {
    martialArts,
    loading,
    error,
    compareList,
    onCompareToggle: handleCompareToggle,
    onSearch: searchMartialArts,
    onRefresh: fetchMartialArts,
    clearCompareList
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            {/* Ruta principal - Lista de artes marciales */}
            <Route 
              path="/" 
              element={
                <MartialArtsList 
                  {...commonProps}
                />
              } 
            />
            
            {/* Detalle de arte marcial */}
            <Route 
              path="/martial-art/:id" 
              element={
                <MartialArtDetail 
                  {...commonProps}
                />
              } 
            />
            
            {/* Comparador */}
            <Route 
              path="/compare" 
              element={
                <MartialArtCompare 
                  {...commonProps}
                />
              } 
            />
            
            {/* Panel de administrador */}
            <Route 
              path="/admin" 
              element={
                <AdminPanel 
                  {...commonProps}
                />
              } 
            />
            
            {/* Formulario de administrador */}
            <Route 
              path="/admin/form/:id?" 
              element={
                <MartialArtForm 
                  {...commonProps}
                />
              } 
            />
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ff4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
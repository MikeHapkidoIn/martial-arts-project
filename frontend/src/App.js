// /frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { martialArtsAPI } from './services/api';
import './index.css';

function App() {
  const [martialArts, setMartialArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMartialArts();
  }, []);

  const fetchMartialArts = async () => {
    try {
      setLoading(true);
      const response = await martialArtsAPI.getAll();
      setMartialArts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las artes marciales');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando artes marciales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={fetchMartialArts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🥋 Sistema de Artes Marciales
          </h1>
          <p className="text-gray-600 mt-2">
            Explora y compara diferentes disciplinas marciales del mundo
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {martialArts.length}
            </div>
            <div className="text-gray-600">Artes Marciales</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {new Set(martialArts.map(art => art.paisProcedencia)).size}
            </div>
            <div className="text-gray-600">Países de Origen</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(martialArts.map(art => art.tipo)).size}
            </div>
            <div className="text-gray-600">Tipos Diferentes</div>
          </div>
        </div>

        {/* Martial Arts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {martialArts.map(art => (
            <div key={art._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {art.nombre}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Origen:</strong> {art.paisProcedencia}</p>
                <p><strong>Época:</strong> {art.edadOrigen}</p>
                <p><strong>Tipo:</strong> {art.tipo}</p>
                <p><strong>Focus:</strong> {art.focus}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {art.tipoContacto}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  art.demandasFisicas === 'Baja' || art.demandasFisicas === 'Baja-Media' 
                    ? 'bg-green-100 text-green-800'
                    : art.demandasFisicas === 'Media' || art.demandasFisicas === 'Media-Alta'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {art.demandasFisicas}
                </span>
              </div>

              {art.fortalezas && art.fortalezas.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fortalezas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {art.fortalezas.slice(0, 3).map((fortaleza, index) => (
                      <span 
                        key={index}
                        className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {fortaleza}
                      </span>
                    ))}
                    {art.fortalezas.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{art.fortalezas.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 italic">
                  "{art.filosofia}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {martialArts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No se encontraron artes marciales
            </div>
            <button 
              onClick={fetchMartialArts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cargar Datos
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Sistema de Artes Marciales - {martialArts.length} disciplinas disponibles</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
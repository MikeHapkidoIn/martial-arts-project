import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compare, Settings } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import LoadingSpinner from '../common/LoadingSpinner';
import MartialArtCard from './MartialArtCard';
import Header from '../common/Header';

const MartialArtsList = ({ 
  martialArts, 
  loading, 
  error, 
  compareList, 
  onCompareToggle, 
  onSearch,
  clearCompareList 
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const filteredArts = martialArts.filter(art =>
    art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.paisProcedencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Artes Marciales"
        subtitle="Explora y compara diferentes disciplinas marciales"
      >
        <button
          onClick={() => navigate('/admin')}
          className="btn-primary"
        >
          <Settings size={16} />
          Panel Admin
        </button>
        {compareList.length > 1 && (
          <button
            onClick={() => navigate('/compare')}
            className="btn-secondary"
          >
            <Compare size={16} />
            Comparar ({compareList.length})
          </button>
        )}
      </Header>

      {/* Barra de búsqueda */}
      <div className="flex justify-center">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Buscar por nombre, país o tipo..."
        />
      </div>

      {/* Lista de seleccionados para comparar */}
      {compareList.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">
              Seleccionadas para comparar ({compareList.length}/4)
            </h3>
            <button
              onClick={clearCompareList}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Limpiar selección
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {compareList.map(art => (
              <span 
                key={art._id} 
                className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {art.nombre}
                <button
                  onClick={() => onCompareToggle(art)}
                  className="hover:bg-blue-300 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid de artes marciales */}
      {loading ? (
        <LoadingSpinner text="Cargando artes marciales..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArts.length > 0 ? (
            filteredArts.map(art => (
              <MartialArtCard
                key={art._id}
                martialArt={art}
                isSelected={compareList.some(item => item._id === art._id)}
                onCompareToggle={() => onCompareToggle(art)}
                maxReached={compareList.length >= 4 && !compareList.some(item => item._id === art._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm ? 'No se encontraron resultados' : 'No hay artes marciales disponibles'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="btn-primary"
                >
                  Mostrar todas
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MartialArtsList;
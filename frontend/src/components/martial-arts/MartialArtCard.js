import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Clock, Target } from 'lucide-react';

const MartialArtCard = ({ 
  martialArt, 
  isSelected, 
  onCompareToggle, 
  maxReached 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/martial-art/${martialArt._id}`);
  };

  const getPhysicalDemandColor = (demand) => {
    const colors = {
      'Baja': 'bg-green-100 text-green-800',
      'Baja-Media': 'bg-green-100 text-green-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Media-Alta': 'bg-orange-100 text-orange-800',
      'Alta': 'bg-red-100 text-red-800',
      'Muy alta': 'bg-red-200 text-red-900'
    };
    return colors[demand] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-200">
      {/* Header con checkbox */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {martialArt.nombre}
        </h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onCompareToggle}
            disabled={maxReached}
            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
            title={maxReached ? "Máximo 4 para comparar" : "Agregar a comparación"}
          />
        </div>
      </div>

      {/* Información básica */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          {martialArt.paisProcedencia}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          {martialArt.edadOrigen}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Target className="h-4 w-4 mr-2 text-gray-400" />
          {martialArt.focus}
        </div>
      </div>

      {/* Etiquetas */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
          {martialArt.tipo}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPhysicalDemandColor(martialArt.demandasFisicas)}`}>
          {martialArt.demandasFisicas}
        </span>
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
          {martialArt.tipoContacto}
        </span>
      </div>

      {/* Fortalezas principales */}
      {martialArt.fortalezas && martialArt.fortalezas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Fortalezas:</h4>
          <div className="flex flex-wrap gap-1">
            {martialArt.fortalezas.slice(0, 3).map((fortaleza, index) => (
              <span 
                key={index}
                className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
              >
                {fortaleza}
              </span>
            ))}
            {martialArt.fortalezas.length > 3 && (
              <span className="text-xs text-gray-500">
                +{martialArt.fortalezas.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Botón de ver detalles */}
      <button
        onClick={handleViewDetails}
        className="w-full btn-primary justify-center group"
      >
        <Eye size={16} />
        Ver Detalles
      </button>
    </div>
  );
};

export default MartialArtCard;
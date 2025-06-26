import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Target, MapPin, Clock, Zap, AlertTriangle } from 'lucide-react';
import Header from '../common/Header';

const MartialArtCompare = ({ compareList, clearCompareList }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (compareList.length < 2) {
      navigate('/');
    }
  }, [compareList.length, navigate]);

  if (compareList.length < 2) {
    return null;
  }

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
    <div className="space-y-6">
      <Header
        title="Comparación de Artes Marciales"
        subtitle={`Comparando ${compareList.length} disciplinas`}
        showBackButton
        backPath="/"
      >
        <button
          onClick={clearCompareList}
          className="btn-secondary"
        >
          <X size={16} />
          Limpiar Todo
        </button>
      </Header>

      {/* Cards de artes marciales seleccionadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {compareList.map(art => (
          <div key={art._id} className="card relative">
            <h3 className="font-bold text-lg text-gray-900 mb-2 pr-8">
              {art.nombre}
            </h3>
            <p className="text-sm text-gray-600">{art.paisProcedencia}</p>
            <p className="text-sm text-gray-600">{art.tipo}</p>
          </div>
        ))}
      </div>

      {/* Tabla de comparación */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Característica
                </th>
                {compareList.map(art => (
                  <th key={art._id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                    {art.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Información básica */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-blue-50" colSpan={compareList.length + 1}>
                  Información General
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  País de Origen
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    {art.paisProcedencia}
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  Época de Origen
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    {art.edadOrigen}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Tipo
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                      {art.tipo}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-gray-400" />
                  Focus Principal
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    {art.focus}
                  </td>
                ))}
              </tr>

              {/* Características técnicas */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-blue-50" colSpan={compareList.length + 1}>
                  Características Técnicas
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Tipo de Contacto
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {art.tipoContacto}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">
                  Demandas Físicas
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPhysicalDemandColor(art.demandasFisicas)}`}>
                      {art.demandasFisicas}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Distancias de Combate
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {(art.distanciasTrabajadas || []).map((distancia, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                          {distancia}
                        </span>
                      ))}
                      {(!art.distanciasTrabajadas || art.distanciasTrabajadas.length === 0) && (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">
                  Armas
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {(art.armas && art.armas.length > 0) ? (
                        art.armas.map((arma, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs">
                            {arma}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Sin armas</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Fortalezas y Debilidades */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-blue-50" colSpan={compareList.length + 1}>
                  Análisis Comparativo
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                  Fortalezas
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {(art.fortalezas || []).slice(0, 4).map((fortaleza, index) => (
                        <div key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span className="text-xs text-gray-700">{fortaleza}</span>
                        </div>
                      ))}
                      {(art.fortalezas || []).length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{art.fortalezas.length - 4} más
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  Consideraciones
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {(art.debilidades || []).slice(0, 3).map((debilidad, index) => (
                        <div key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          <span className="text-xs text-gray-700">{debilidad}</span>
                        </div>
                      ))}
                      {(art.debilidades || []).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{art.debilidades.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Técnicas Principales
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {(art.tecnicas || []).slice(0, 3).map((tecnica, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs">
                          {tecnica}
                        </span>
                      ))}
                      {(art.tecnicas || []).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{art.tecnicas.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">
                  Filosofía
                </td>
                {compareList.map(art => (
                  <td key={art._id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <p className="text-xs text-gray-600 italic line-clamp-3" title={art.filosofia}>
                        "{art.filosofia}"
                      </p>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis resumido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Análisis por Demandas Físicas</h3>
          <div className="space-y-2">
            {['Baja', 'Baja-Media', 'Media', 'Media-Alta', 'Alta', 'Muy alta'].map(nivel => {
              const artsInLevel = compareList.filter(art => art.demandasFisicas === nivel);
              return artsInLevel.length > 0 && (
                <div key={nivel} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPhysicalDemandColor(nivel)}`}>
                    {nivel}
                  </span>
                  <span className="text-sm text-gray-600">
                    {artsInLevel.map(art => art.nombre).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Análisis por Tipo de Contacto</h3>
          <div className="space-y-2">
            {['Contacto completo', 'Semi-contacto', 'No-contacto', 'Suave', 'Variable'].map(tipo => {
              const artsInType = compareList.filter(art => art.tipoContacto === tipo);
              return artsInType.length > 0 && (
                <div key={tipo} className="flex items-center justify-between">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {tipo}
                  </span>
                  <span className="text-sm text-gray-600">
                    {artsInType.map(art => art.nombre).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MartialArtCompare;

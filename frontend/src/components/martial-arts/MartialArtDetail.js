import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Target, Zap, AlertTriangle, Dumbbell } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { martialArtsAPI } from '../services/api';

const MartialArtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [martialArt, setMartialArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMartialArt();
  }, [id]);

  const fetchMartialArt = async () => {
    try {
      setLoading(true);
      const response = await martialArtsAPI.getById(id);
      setMartialArt(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información del arte marcial');
      console.error('Error fetching martial art:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando información..." />;
  }

  if (error || !martialArt) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error || 'Arte marcial no encontrada'}</div>
        <button 
          onClick={() => navigate('/')} 
          className="btn-primary"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    );
  }

  const getPhysicalDemandColor = (demand) => {
    const colors = {
      'Baja': 'bg-green-100 text-green-800 border-green-200',
      'Baja-Media': 'bg-green-100 text-green-800 border-green-200',
      'Media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Media-Alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'Alta': 'bg-red-100 text-red-800 border-red-200',
      'Muy alta': 'bg-red-200 text-red-900 border-red-300'
    };
    return colors[demand] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {/* Título principal */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {martialArt.nombre}
        </h1>
        <p className="text-lg text-gray-600">
          {martialArt.tipo} • {martialArt.paisProcedencia}
        </p>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Origen</h3>
          <p className="text-gray-600">{martialArt.paisProcedencia}</p>
        </div>
        
        <div className="card text-center">
          <Clock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Época</h3>
          <p className="text-gray-600">{martialArt.edadOrigen}</p>
        </div>
        
        <div className="card text-center">
          <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Focus</h3>
          <p className="text-gray-600">{martialArt.focus}</p>
        </div>
      </div>

      {/* Características principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información técnica */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Características Técnicas</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Tipo de Contacto</h3>
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {martialArt.tipoContacto}
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Demandas Físicas</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPhysicalDemandColor(martialArt.demandasFisicas)}`}>
                <Dumbbell className="inline h-4 w-4 mr-1" />
                {martialArt.demandasFisicas}
              </span>
            </div>

            {martialArt.distanciasTrabajadas && martialArt.distanciasTrabajadas.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Distancias de Combate</h3>
                <div className="flex flex-wrap gap-2">
                  {martialArt.distanciasTrabajadas.map((distancia, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {distancia}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {martialArt.armas && martialArt.armas.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Armas</h3>
                <div className="flex flex-wrap gap-2">
                  {martialArt.armas.map((arma, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {arma}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fortalezas y Debilidades */}
        <div className="space-y-6">
          {martialArt.fortalezas && martialArt.fortalezas.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 text-green-600 mr-2" />
                Fortalezas
              </h2>
              <ul className="space-y-2">
                {martialArt.fortalezas.map((fortaleza, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{fortaleza}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {martialArt.debilidades && martialArt.debilidades.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                Consideraciones
              </h2>
              <ul className="space-y-2">
                {martialArt.debilidades.map((debilidad, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{debilidad}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Técnicas */}
      {martialArt.tecnicas && martialArt.tecnicas.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Técnicas Principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {martialArt.tecnicas.map((tecnica, index) => (
              <div 
                key={index}
                className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm text-center font-medium"
              >
                {tecnica}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filosofía */}
      {martialArt.filosofia && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filosofía</h2>
          <p className="text-gray-700 italic text-lg leading-relaxed">
            "{martialArt.filosofia}"
          </p>
        </div>
      )}

      {/* Historia */}
      {martialArt.historia && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historia</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {martialArt.historia}
            </p>
          </div>
        </div>
      )}

      {/* Multimedia */}
      {((martialArt.imagenes && martialArt.imagenes.length > 0) || 
        (martialArt.videos && martialArt.videos.length > 0)) && (
        <div className="space-y-6">
          {/* Imágenes */}
          {martialArt.imagenes && martialArt.imagenes.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Galería</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {martialArt.imagenes.map((imagen, index) => (
                  <img
                    key={index}
                    src={imagen}
                    alt={`${martialArt.nombre} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {martialArt.videos && martialArt.videos.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {martialArt.videos.map((video, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={video}
                      title={`${martialArt.nombre} video ${index + 1}`}
                      className="w-full h-64 rounded-lg shadow-sm"
                      allowFullScreen
                    ></iframe>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MartialArtDetail;
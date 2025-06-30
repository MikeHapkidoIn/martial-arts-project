import React, { useState, useEffect } from 'react';
import { martialArtsAPI } from './services/api';
import './styles/index.css';

function App() {
  // Estados principales
  const [martialArts, setMartialArts] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('lista'); // 'lista', 'admin', 'comparacion', 'detalle', 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArts, setSelectedArts] = useState([]);
  const [editingArt, setEditingArt] = useState(null);
  const [viewingArt, setViewingArt] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    tipo: '',
    paisProcedencia: '',
    tipoContacto: '',
    demandasFisicas: ''
  });

  // Cargar datos al inicializar
  useEffect(() => {
    fetchMartialArts();
  }, []);

  // Filtrar artes marciales cuando cambian los filtros o búsqueda
  useEffect(() => {
    let filtered = martialArts.filter(art =>
      art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.paisProcedencia.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.tipo) filtered = filtered.filter(art => art.tipo.includes(filters.tipo));
    if (filters.paisProcedencia) filtered = filtered.filter(art => art.paisProcedencia.includes(filters.paisProcedencia));
    if (filters.tipoContacto) filtered = filtered.filter(art => art.tipoContacto === filters.tipoContacto);
    if (filters.demandasFisicas) filtered = filtered.filter(art => art.demandasFisicas === filters.demandasFisicas);

    setFilteredArts(filtered);
  }, [martialArts, searchTerm, filters]);

  // Funciones API
  const fetchMartialArts = async () => {
    try {
      setLoading(true);
      const response = await martialArtsAPI.getAll();
      setMartialArts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las artes marciales: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar arte marcial (crear o editar)
  const saveArt = async (artData) => {
    setSaving(true);
    try {
      if (editingArt) {
        // Actualizar existente
        await martialArtsAPI.update(editingArt._id, artData);
        setMessage('✅ Arte marcial actualizada correctamente');
      } else {
        // Crear nueva
        await martialArtsAPI.create(artData);
        setMessage('✅ Arte marcial creada correctamente');
      }
      
      await fetchMartialArts(); // Recargar lista
      setCurrentView('admin');
      setEditingArt(null);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('❌ Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar arte marcial
  const deleteArt = async (artId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta arte marcial?')) {
      try {
        await martialArtsAPI.delete(artId);
        setMessage('✅ Arte marcial eliminada correctamente');
        await fetchMartialArts();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError('❌ Error al eliminar: ' + err.message);
      }
    }
  };

  // Manejar selección para comparación
  const toggleSelectArt = (art) => {
    if (selectedArts.find(a => a._id === art._id)) {
      setSelectedArts(selectedArts.filter(a => a._id !== art._id));
    } else if (selectedArts.length < 2) {
      setSelectedArts([...selectedArts, art]);
    } else {
      setMessage('Solo puedes seleccionar 2 artes marciales para comparar');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Formulario para crear/editar arte marcial
  const ArtForm = () => {
    const [formData, setFormData] = useState(editingArt || {
      nombre: '',
      paisProcedencia: '',
      edadOrigen: '',
      tipo: '',
      focus: '',
      tipoContacto: 'Semi-contacto',
      demandasFisicas: 'Media',
      filosofia: '',
      historia: '',
      fortalezas: [],
      debilidades: [],
      tecnicasPrincipales: [],
      videos: [],
      imagenes: []
    });

    const [newItem, setNewItem] = useState({
      fortaleza: '',
      debilidad: '',
      tecnica: '',
      video: '',
      imagen: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      saveArt(formData);
    };

    const addToArray = (field, value, resetField) => {
      if (value.trim()) {
        setFormData({
          ...formData,
          [field]: [...(formData[field] || []), value.trim()]
        });
        setNewItem({ ...newItem, [resetField]: '' });
      }
    };

    const removeFromArray = (field, index) => {
      setFormData({
        ...formData,
        [field]: formData[field].filter((_, i) => i !== index)
      });
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingArt ? '✏️ Editar Arte Marcial' : '➕ Nueva Arte Marcial'}
          </h2>
          <button
            onClick={() => {
              setCurrentView('admin');
              setEditingArt(null);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Procedencia *
              </label>
              <input
                type="text"
                required
                value={formData.paisProcedencia}
                onChange={(e) => setFormData({...formData, paisProcedencia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad de Origen
              </label>
              <input
                type="text"
                value={formData.edadOrigen}
                onChange={(e) => setFormData({...formData, edadOrigen: e.target.value})}
                placeholder="ej: Siglo XVII, 1940s"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                placeholder="ej: Arte marcial tradicional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contacto
              </label>
              <select
                value={formData.tipoContacto}
                onChange={(e) => setFormData({...formData, tipoContacto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sin contacto">Sin contacto</option>
                <option value="Semi-contacto">Semi-contacto</option>
                <option value="Completo">Contacto completo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandas Físicas
              </label>
              <select
                value={formData.demandasFisicas}
                onChange={(e) => setFormData({...formData, demandasFisicas: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Baja">Baja</option>
                <option value="Baja-Media">Baja-Media</option>
                <option value="Media">Media</option>
                <option value="Media-Alta">Media-Alta</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Principal
            </label>
            <input
              type="text"
              value={formData.focus}
              onChange={(e) => setFormData({...formData, focus: e.target.value})}
              placeholder="ej: Autodefensa, Competición, Salud"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Historia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historia
            </label>
            <textarea
              value={formData.historia}
              onChange={(e) => setFormData({...formData, historia: e.target.value})}
              rows="4"
              placeholder="Descripción histórica del arte marcial..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filosofía */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filosofía
            </label>
            <textarea
              value={formData.filosofia}
              onChange={(e) => setFormData({...formData, filosofia: e.target.value})}
              rows="3"
              placeholder="Filosofía y principios del arte marcial..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fortalezas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fortalezas
            </label>
            <div className="space-y-2">
              {formData.fortalezas && formData.fortalezas.map((fortaleza, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-green-800">{fortaleza}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('fortalezas', index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.fortaleza}
                  onChange={(e) => setNewItem({...newItem, fortaleza: e.target.value})}
                  placeholder="Nueva fortaleza..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => addToArray('fortalezas', newItem.fortaleza, 'fortaleza')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Debilidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debilidades
            </label>
            <div className="space-y-2">
              {formData.debilidades && formData.debilidades.map((debilidad, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-red-800">{debilidad}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('debilidades', index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.debilidad}
                  onChange={(e) => setNewItem({...newItem, debilidad: e.target.value})}
                  placeholder="Nueva debilidad..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => addToArray('debilidades', newItem.debilidad, 'debilidad')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Técnicas principales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Técnicas Principales
            </label>
            <div className="space-y-2">
              {formData.tecnicasPrincipales && formData.tecnicasPrincipales.map((tecnica, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-blue-800">{tecnica}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray('tecnicasPrincipales', index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.tecnica}
                  onChange={(e) => setNewItem({...newItem, tecnica: e.target.value})}
                  placeholder="Nueva técnica..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => addToArray('tecnicasPrincipales', newItem.tecnica, 'tecnica')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📹 Videos (URLs)
            </label>
            <div className="space-y-2">
              {formData.videos && formData.videos.map((video, index) => (
                <div key={index} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                  <a 
                    href={video} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-800 hover:underline truncate flex-1"
                  >
                    🎥 {video}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFromArray('videos', index)}
                    className="text-red-500 hover:text-red-700 px-2 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newItem.video}
                  onChange={(e) => setNewItem({...newItem, video: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => addToArray('videos', newItem.video, 'video')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Agregar Video
                </button>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🖼️ Imágenes (URLs)
            </label>
            <div className="space-y-2">
              {formData.imagenes && formData.imagenes.map((imagen, index) => (
                <div key={index} className="flex items-center justify-between bg-orange-50 p-2 rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <img 
                      src={imagen} 
                      alt={`Vista previa ${index + 1}`}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <span className="hidden text-gray-500 text-sm">❌ Error al cargar</span>
                    <a 
                      href={imagen} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-orange-800 hover:underline truncate"
                    >
                      🖼️ {imagen}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromArray('imagenes', index)}
                    className="text-red-500 hover:text-red-700 px-2 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newItem.imagen}
                  onChange={(e) => setNewItem({...newItem, imagen: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => addToArray('imagenes', newItem.imagen, 'imagen')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Agregar Imagen
                </button>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {saving ? '💾 Guardando...' : (editingArt ? '✅ Actualizar' : '➕ Crear')}
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('admin');
                setEditingArt(null);
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Componente de búsqueda y filtros
  const SearchAndFilters = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.tipo}
          onChange={(e) => setFilters({...filters, tipo: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="tradicional">Arte marcial tradicional</option>
          <option value="moderno">Arte marcial moderno</option>
          <option value="combate">Sistema de combate</option>
          <option value="deporte">Deporte de combate</option>
        </select>

        <input
          type="text"
          placeholder="País de origen..."
          value={filters.paisProcedencia}
          onChange={(e) => setFilters({...filters, paisProcedencia: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filters.tipoContacto}
          onChange={(e) => setFilters({...filters, tipoContacto: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tipo de contacto</option>
          <option value="Completo">Contacto completo</option>
          <option value="Semi-contacto">Semi-contacto</option>
          <option value="Sin contacto">Sin contacto</option>
        </select>

        <select
          value={filters.demandasFisicas}
          onChange={(e) => setFilters({...filters, demandasFisicas: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Demandas físicas</option>
          <option value="Baja">Baja</option>
          <option value="Baja-Media">Baja-Media</option>
          <option value="Media">Media</option>
          <option value="Media-Alta">Media-Alta</option>
          <option value="Alta">Alta</option>
        </select>
      </div>
    </div>
  );

  // Componente de navegación
  const Navigation = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCurrentView('lista')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'lista'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 Ver Lista
        </button>

        <button
          onClick={() => setCurrentView('admin')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'admin'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⚙️ Panel Admin
        </button>

        <button
          onClick={() => {
            if (selectedArts.length === 2) {
              setCurrentView('comparacion');
            } else {
              setMessage('Selecciona exactamente 2 artes marciales para comparar');
              setTimeout(() => setMessage(''), 3000);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedArts.length === 2
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          🥊 Comparar ({selectedArts.length}/2)
        </button>

        {selectedArts.length > 0 && (
          <button
            onClick={() => setSelectedArts([])}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            🗑️ Limpiar selección
          </button>
        )}
      </div>
    </div>
  );

  // Componente de tarjeta de arte marcial
  const MartialArtCard = ({ art }) => (
    <div className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
      selectedArts.find(a => a._id === art._id) ? 'ring-2 ring-purple-500 bg-purple-50' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{art.nombre}</h3>
        <input
          type="checkbox"
          checked={!!selectedArts.find(a => a._id === art._id)}
          onChange={() => toggleSelectArt(art)}
          className="ml-2 h-5 w-5 text-purple-600"
        />
      </div>

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
              <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
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

      {/* Mostrar imágenes si las hay */}
      {art.imagenes && art.imagenes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes:</h4>
          <div className="flex gap-2 overflow-x-auto">
            {art.imagenes.slice(0, 3).map((imagen, index) => (
              <img
                key={index}
                src={imagen}
                alt={`${art.nombre} ${index + 1}`}
                className="w-16 h-16 object-cover rounded border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
            {art.imagenes.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                +{art.imagenes.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mostrar videos si los hay */}
      {art.videos && art.videos.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Videos:</h4>
          <div className="flex gap-1">
            {art.videos.slice(0, 2).map((video, index) => (
              <a
                key={index}
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-100"
              >
                🎥 Video {index + 1}
              </a>
            ))}
            {art.videos.length > 2 && (
              <span className="text-xs text-gray-500">
                +{art.videos.length - 2} más
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 italic line-clamp-2">
          "{art.filosofia}"
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            setViewingArt(art);
            setCurrentView('detalle');
          }}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
        >
          👁️ Ver detalle
        </button>
        <button
          onClick={() => {
            setEditingArt(art);
            setCurrentView('form');
          }}
          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => deleteArt(art._id)}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );

  // Componente de vista detallada
  const DetailView = () => {
    if (!viewingArt) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{viewingArt.nombre}</h2>
          <button
            onClick={() => {
              setCurrentView('lista');
              setViewingArt(null);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información principal */}
          <div>
            <h3 className="text-xl font-semibold mb-4">📋 Información General</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <p><strong>Origen:</strong> {viewingArt.paisProcedencia}</p>
              <p><strong>Época:</strong> {viewingArt.edadOrigen}</p>
              <p><strong>Tipo:</strong> {viewingArt.tipo}</p>
              <p><strong>Focus:</strong> {viewingArt.focus}</p>
              <p><strong>Contacto:</strong> {viewingArt.tipoContacto}</p>
              <p><strong>Demandas físicas:</strong> {viewingArt.demandasFisicas}</p>
            </div>

            {/* Historia */}
            {viewingArt.historia && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">📚 Historia</h3>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">
                  {viewingArt.historia}
                </p>
              </div>
            )}

            {/* Filosofía */}
            {viewingArt.filosofia && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">🧘 Filosofía</h3>
                <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg italic">
                  "{viewingArt.filosofia}"
                </p>
              </div>
            )}
          </div>

          {/* Características técnicas */}
          <div>
            {/* Fortalezas */}
            {viewingArt.fortalezas && viewingArt.fortalezas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">💪 Fortalezas</h3>
                <div className="grid grid-cols-1 gap-2">
                  {viewingArt.fortalezas.map((fortaleza, index) => (
                    <div key={index} className="bg-green-50 border-l-4 border-green-400 p-3">
                      <span className="text-green-800">{fortaleza}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debilidades */}
            {viewingArt.debilidades && viewingArt.debilidades.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">⚠️ Debilidades</h3>
                <div className="grid grid-cols-1 gap-2">
                  {viewingArt.debilidades.map((debilidad, index) => (
                    <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3">
                      <span className="text-red-800">{debilidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Técnicas principales */}
            {viewingArt.tecnicasPrincipales && viewingArt.tecnicasPrincipales.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">🥋 Técnicas Principales</h3>
                <div className="grid grid-cols-1 gap-2">
                  {viewingArt.tecnicasPrincipales.map((tecnica, index) => (
                    <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3">
                      <span className="text-blue-800">{tecnica}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multimedia */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Videos */}
            {viewingArt.videos && viewingArt.videos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">📹 Videos</h3>
                <div className="space-y-3">
                  {viewingArt.videos.map((video, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg">
                      <a
                        href={video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-900 hover:underline break-all"
                      >
                        🎥 Video {index + 1}: {video}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes */}
            {viewingArt.imagenes && viewingArt.imagenes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">🖼️ Imágenes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewingArt.imagenes.map((imagen, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagen}
                        alt={`${viewingArt.nombre} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(imagen, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500"><span>❌ Error al cargar</span></div>';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Componente de comparación
  const ComparisonView = () => {
    if (selectedArts.length !== 2) return null;
    
    const [art1, art2] = selectedArts;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🥊 Comparación de Artes Marciales</h2>
          <button
            onClick={() => setCurrentView('lista')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arte Marcial 1 */}
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold text-center mb-4 text-blue-600">{art1.nombre}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Origen:</strong> {art1.paisProcedencia}</p>
              <p><strong>Época:</strong> {art1.edadOrigen}</p>
              <p><strong>Tipo:</strong> {art1.tipo}</p>
              <p><strong>Contacto:</strong> {art1.tipoContacto}</p>
              <p><strong>Demandas físicas:</strong> {art1.demandasFisicas}</p>
              <p><strong>Focus:</strong> {art1.focus}</p>
            </div>
          </div>

          {/* Arte Marcial 2 */}
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold text-center mb-4 text-purple-600">{art2.nombre}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Origen:</strong> {art2.paisProcedencia}</p>
              <p><strong>Época:</strong> {art2.edadOrigen}</p>
              <p><strong>Tipo:</strong> {art2.tipo}</p>
              <p><strong>Contacto:</strong> {art2.tipoContacto}</p>
              <p><strong>Demandas físicas:</strong> {art2.demandasFisicas}</p>
              <p><strong>Focus:</strong> {art2.focus}</p>
            </div>
          </div>
        </div>

        {/* Análisis comparativo */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">📊 Análisis Comparativo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Similitudes */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Similitudes</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {art1.paisProcedencia === art2.paisProcedencia && (
                  <li>• Ambas originarias de {art1.paisProcedencia}</li>
                )}
                {art1.tipoContacto === art2.tipoContacto && (
                  <li>• Mismo tipo de contacto: {art1.tipoContacto}</li>
                )}
                {art1.demandasFisicas === art2.demandasFisicas && (
                  <li>• Mismas demandas físicas: {art1.demandasFisicas}</li>
                )}
                {art1.focus === art2.focus && (
                  <li>• Mismo focus: {art1.focus}</li>
                )}
              </ul>
            </div>

            {/* Diferencias */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔄 Diferencias</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {art1.paisProcedencia !== art2.paisProcedencia && (
                  <li>• Origen: {art1.nombre} ({art1.paisProcedencia}) vs {art2.nombre} ({art2.paisProcedencia})</li>
                )}
                {art1.tipoContacto !== art2.tipoContacto && (
                  <li>• Contacto: {art1.tipoContacto} vs {art2.tipoContacto}</li>
                )}
                {art1.demandasFisicas !== art2.demandasFisicas && (
                  <li>• Demandas: {art1.demandasFisicas} vs {art2.demandasFisicas}</li>
                )}
                {art1.focus !== art2.focus && (
                  <li>• Focus: {art1.focus} vs {art2.focus}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Panel de administrador completo
  const AdminPanel = () => (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold mb-6">⚙️ Panel de Administrador</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{martialArts.length}</div>
            <div className="text-blue-800">Total Artes Marciales</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {new Set(martialArts.map(art => art.paisProcedencia)).size}
            </div>
            <div className="text-green-800">Países Representados</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {new Set(martialArts.map(art => art.tipo)).size}
            </div>
            <div className="text-purple-800">Tipos Diferentes</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {martialArts.filter(art => art.videos && art.videos.length > 0).length}
            </div>
            <div className="text-orange-800">Con Videos</div>
          </div>
        </div>

        {/* Botón para crear nueva */}
        <div className="text-center">
          <button
            onClick={() => {
              setEditingArt(null);
              setCurrentView('form');
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-lg"
          >
            ➕ Crear Nueva Arte Marcial
          </button>
        </div>
      </div>

      {/* Lista de artes marciales para administrar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold mb-4">📋 Gestionar Artes Marciales</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Origen</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Multimedia</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {martialArts.map((art) => (
                <tr key={art._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{art.nombre}</td>
                  <td className="px-4 py-3">{art.paisProcedencia}</td>
                  <td className="px-4 py-3 text-sm">{art.tipo}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {art.videos && art.videos.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          📹 {art.videos.length}
                        </span>
                      )}
                      {art.imagenes && art.imagenes.length > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                          🖼️ {art.imagenes.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setViewingArt(art);
                          setCurrentView('detalle');
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => {
                          setEditingArt(art);
                          setCurrentView('form');
                        }}
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteArt(art._id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Renderizado condicional según la vista actual
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando artes marciales...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={fetchMartialArts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'form':
        return <ArtForm />;
      case 'detalle':
        return <DetailView />;
      case 'comparacion':
        return <ComparisonView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return (
          <>
            <SearchAndFilters />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArts.map(art => (
                <MartialArtCard key={art._id} art={art} />
              ))}
            </div>
            {filteredArts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  No se encontraron artes marciales que coincidan con los filtros
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🥋 Sistema de Artes Marciales
          </h1>
          <p className="text-gray-600 mt-2">
            Explora, compara y gestiona diferentes disciplinas marciales del mundo
          </p>
        </div>
      </header>

      {/* Mensajes */}
      {message && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {message}
            <button
              onClick={() => setMessage('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        {renderContent()}
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
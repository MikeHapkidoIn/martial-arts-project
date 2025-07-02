// /frontend/src/App.js - Versión completa con CRUD y todas las funcionalidades
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { martialArtsAPI } from './services/api';
import './styles/index.css';

// Componente de Login
const LoginForm = ({ onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-6">🔐 Iniciar Sesión</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@martialarts.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Admin123!"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-center">
          <strong>Credenciales de prueba:</strong><br />
          Email: admin@martialarts.com<br />
          Contraseña: Admin123!
        </div>
      </div>
    </div>
  );
};

// Componente de Registro
const RegisterForm = ({ onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-6">📝 Crear Cuenta</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                name="apellidos"
                type="text"
                required
                value={formData.apellidos}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="mt-1 relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para Crear/Editar Arte Marcial
const MartialArtModal = ({ isOpen, onClose, artToEdit, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    paisProcedencia: '',
    edadOrigen: '',
    tipo: '',
    focus: '',
    tipoContacto: '',
    demandasFisicas: '',
    filosofia: '',
    fortalezas: [],
    videos: []
  });
  const [newFortaleza, setNewFortaleza] = useState('');
  const [newVideo, setNewVideo] = useState('');

  useEffect(() => {
    if (artToEdit) {
      setFormData({
        nombre: artToEdit.nombre || '',
        paisProcedencia: artToEdit.paisProcedencia || '',
        edadOrigen: artToEdit.edadOrigen || '',
        tipo: artToEdit.tipo || '',
        focus: artToEdit.focus || '',
        tipoContacto: artToEdit.tipoContacto || '',
        demandasFisicas: artToEdit.demandasFisicas || '',
        filosofia: artToEdit.filosofia || '',
        fortalezas: artToEdit.fortalezas || [],
        videos: artToEdit.videos || []
      });
    } else {
      setFormData({
        nombre: '',
        paisProcedencia: '',
        edadOrigen: '',
        tipo: '',
        focus: '',
        tipoContacto: '',
        demandasFisicas: '',
        filosofia: '',
        fortalezas: [],
        videos: []
      });
    }
  }, [artToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addFortaleza = () => {
    if (newFortaleza.trim() && !formData.fortalezas.includes(newFortaleza.trim())) {
      setFormData({
        ...formData,
        fortalezas: [...formData.fortalezas, newFortaleza.trim()]
      });
      setNewFortaleza('');
    }
  };

  const removeFortaleza = (index) => {
    setFormData({
      ...formData,
      fortalezas: formData.fortalezas.filter((_, i) => i !== index)
    });
  };

  const addVideo = () => {
    if (newVideo.trim() && !formData.videos.includes(newVideo.trim())) {
      setFormData({
        ...formData,
        videos: [...formData.videos, newVideo.trim()]
      });
      setNewVideo('');
    }
  };

  const removeVideo = (index) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {artToEdit ? '✏️ Editar Arte Marcial' : '➕ Nueva Arte Marcial'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">País de Procedencia *</label>
                <input
                  name="paisProcedencia"
                  type="text"
                  required
                  value={formData.paisProcedencia}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad de Origen</label>
                <input
                  name="edadOrigen"
                  type="text"
                  value={formData.edadOrigen}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej: Siglo XV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Arte marcial tradicional">Arte marcial tradicional</option>
                  <option value="Deporte de combate">Deporte de combate</option>
                  <option value="Sistema de defensa personal">Sistema de defensa personal</option>
                  <option value="Arte marcial mixto">Arte marcial mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Focus</label>
                <select
                  name="focus"
                  value={formData.focus}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar focus</option>
                  <option value="Golpes">Golpes</option>
                  <option value="Agarres">Agarres</option>
                  <option value="Combinado">Combinado</option>
                  <option value="Armas">Armas</option>
                  <option value="Defensa personal">Defensa personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Contacto</label>
                <select
                  name="tipoContacto"
                  value={formData.tipoContacto}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar contacto</option>
                  <option value="Contacto completo">Contacto completo</option>
                  <option value="Semi-contacto">Semi-contacto</option>
                  <option value="Sin contacto">Sin contacto</option>
                  <option value="Contacto ligero">Contacto ligero</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Demandas Físicas</label>
                <select
                  name="demandasFisicas"
                  value={formData.demandasFisicas}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar demandas</option>
                  <option value="Baja">Baja</option>
                  <option value="Baja-Media">Baja-Media</option>
                  <option value="Media">Media</option>
                  <option value="Media-Alta">Media-Alta</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filosofía</label>
              <textarea
                name="filosofia"
                value={formData.filosofia}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe la filosofía de este arte marcial..."
              />
            </div>

            {/* Fortalezas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fortalezas</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFortaleza}
                  onChange={(e) => setNewFortaleza(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agregar fortaleza..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFortaleza())}
                />
                <button
                  type="button"
                  onClick={addFortaleza}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ➕
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.fortalezas.map((fortaleza, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {fortaleza}
                    <button
                      type="button"
                      onClick={() => removeFortaleza(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Videos (URLs)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://youtube.com/..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
                />
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ➕
                </button>
              </div>
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 p-2 rounded flex items-center justify-between"
                  >
                    <span className="text-sm text-blue-800 truncate">{video}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {artToEdit ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación autenticada
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [martialArts, setMartialArts] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('lista');
  const [selectedArts, setSelectedArts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [artToEdit, setArtToEdit] = useState(null);

  // Verificar permisos
  const canEdit = (art) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'moderator') return true;
    return art.creadoPor === user._id;
  };

  const canDelete = (art) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return art.creadoPor === user._id;
  };

  const isModeratorOrAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'moderator');
  };

  // Efectos
  useEffect(() => {
    fetchMartialArts();
  }, []);

  useEffect(() => {
    const filtered = martialArts.filter(art =>
      art.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.paisProcedencia.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArts(filtered);
  }, [martialArts, searchTerm]);

  // Funciones CRUD
  const fetchMartialArts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando artes marciales...');
      
      const response = await martialArtsAPI.getAll();
      console.log('✅ Artes marciales cargadas:', response.data?.length);
      
      setMartialArts(response.data || []);
    } catch (err) {
      console.error('❌ Error cargando artes marciales:', err);
      setError('Error al cargar las artes marciales: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const createArt = async (artData) => {
    try {
      console.log('➕ Creando arte marcial:', artData);
      const response = await martialArtsAPI.create(artData);
      
      if (response.success) {
        setMessage('✅ Arte marcial creada exitosamente');
        await fetchMartialArts();
        setShowModal(false);
        setArtToEdit(null);
      }
    } catch (err) {
      console.error('❌ Error creando arte marcial:', err);
      setError('Error al crear: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => { setMessage(''); setError(null); }, 3000);
  };

  const updateArt = async (artId, artData) => {
    try {
      console.log('✏️ Actualizando arte marcial:', artId, artData);
      const response = await martialArtsAPI.update(artId, artData);
      
      if (response.success) {
        setMessage('✅ Arte marcial actualizada exitosamente');
        await fetchMartialArts();
        setShowModal(false);
        setArtToEdit(null);
      }
    } catch (err) {
      console.error('❌ Error actualizando arte marcial:', err);
      setError('Error al actualizar: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => { setMessage(''); setError(null); }, 3000);
  };

  const deleteArt = async (artId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta arte marcial?')) {
      try {
        console.log('🗑️ Eliminando arte marcial:', artId);
        await martialArtsAPI.delete(artId);
        setMessage('✅ Arte marcial eliminada exitosamente');
        await fetchMartialArts();
      } catch (err) {
        console.error('❌ Error eliminando arte marcial:', err);
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
      setTimeout(() => { setMessage(''); setError(null); }, 3000);
    }
  };

  const initializeData = async () => {
    try {
      console.log('🌱 Inicializando datos...');
      const response = await martialArtsAPI.initialize();
      
      if (response.success) {
        setMessage('✅ ' + response.message);
        await fetchMartialArts();
      } else {
        setMessage('ℹ️ Los datos ya están inicializados');
      }
    } catch (err) {
      console.error('❌ Error inicializando:', err);
      setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Funciones de selección y comparación
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

  // Handlers del modal
  const handleCreateNew = () => {
    setArtToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (art) => {
    setArtToEdit(art);
    setShowModal(true);
  };

  const handleSaveArt = (artData) => {
    if (artToEdit) {
      updateArt(artToEdit._id, artData);
    } else {
      createArt(artData);
    }
  };

  // Estado para detalles expandidos
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardDetails = (artId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(artId)) {
      newExpanded.delete(artId);
    } else {
      newExpanded.add(artId);
    }
    setExpandedCards(newExpanded);
  };

  // Componente de tarjeta de arte marcial
  const MartialArtCard = ({ art }) => {
    const isExpanded = expandedCards.has(art._id);
    
    return (
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

        {/* Detalles expandibles */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* ID y Metadatos */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Información Técnica</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>ID:</strong> {art._id}</p>
                <p><strong>Creado por:</strong> {art.creadoPor || 'Sistema'}</p>
                <p><strong>Fecha creación:</strong> {
                  art.fechaCreacion ? new Date(art.fechaCreacion).toLocaleDateString() : 'No disponible'
                }</p>
                <p><strong>Última modificación:</strong> {
                  art.fechaModificacion ? new Date(art.fechaModificacion).toLocaleDateString() : 'No disponible'
                }</p>
              </div>
            </div>

            {/* Filosofía completa */}
            {art.filosofia && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🧘 Filosofía</h4>
                <p className="text-sm text-blue-900 italic">"{art.filosofia}"</p>
              </div>
            )}

            {/* Todas las fortalezas */}
            {art.fortalezas && art.fortalezas.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-2">💪 Todas las Fortalezas ({art.fortalezas.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {art.fortalezas.map((fortaleza, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {fortaleza}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {art.videos && art.videos.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-800 mb-2">🎥 Videos ({art.videos.length})</h4>
                <div className="space-y-2">
                  {art.videos.map((video, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 p-2 rounded">
                      <a 
                        href={video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 text-xs break-all"
                      >
                        🔗 {video}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional si existe */}
            {(art.debilidades && art.debilidades.length > 0) && (
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">⚠️ Debilidades</h4>
                <div className="flex flex-wrap gap-1">
                  {art.debilidades.map((debilidad, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                      {debilidad}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Técnicas principales si existen */}
            {(art.tecnicasPrincipales && art.tecnicasPrincipales.length > 0) && (
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">🥋 Técnicas Principales</h4>
                <div className="flex flex-wrap gap-1">
                  {art.tecnicasPrincipales.map((tecnica, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {tecnica}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fortalezas resumidas (solo cuando no está expandido) */}
        {!isExpanded && art.fortalezas && art.fortalezas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fortalezas:</h4>
            <div className="flex flex-wrap gap-1">
              {art.fortalezas.slice(0, 3).map((fortaleza, index) => (
                <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                  {fortaleza}
                </span>
              ))}
              {art.fortalezas.length > 3 && (
                <span className="text-xs text-gray-500">+{art.fortalezas.length - 3} más</span>
              )}
            </div>
          </div>
        )}

        {/* Filosofía resumida (solo cuando no está expandido) */}
        {!isExpanded && art.filosofia && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 italic">
              "{art.filosofia.substring(0, 100)}..."
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => toggleCardDetails(art._id)}
            className={`px-3 py-1 rounded transition-colors text-sm ${
              isExpanded 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isExpanded ? '📄 Ocultar Detalles' : '📋 Ver Detalles'}
          </button>

          {canEdit(art) && (
            <button
              onClick={() => handleEdit(art)}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
            >
              ✏️ Editar
            </button>
          )}
          
          {canDelete(art) && (
            <button
              onClick={() => deleteArt(art._id)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
            >
              🗑️ Eliminar
            </button>
          )}
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
            ← Volver a Lista
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold text-center mb-4 text-blue-600">{art1.nombre}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Origen:</strong> {art1.paisProcedencia}</p>
              <p><strong>Época:</strong> {art1.edadOrigen}</p>
              <p><strong>Tipo:</strong> {art1.tipo}</p>
              <p><strong>Contacto:</strong> {art1.tipoContacto}</p>
              <p><strong>Demandas físicas:</strong> {art1.demandasFisicas}</p>
              <p><strong>Focus:</strong> {art1.focus}</p>
              {art1.fortalezas && art1.fortalezas.length > 0 && (
                <div>
                  <strong>Fortalezas:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {art1.fortalezas.map((f, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-xl font-bold text-center mb-4 text-purple-600">{art2.nombre}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Origen:</strong> {art2.paisProcedencia}</p>
              <p><strong>Época:</strong> {art2.edadOrigen}</p>
              <p><strong>Tipo:</strong> {art2.tipo}</p>
              <p><strong>Contacto:</strong> {art2.tipoContacto}</p>
              <p><strong>Demandas físicas:</strong> {art2.demandasFisicas}</p>
              <p><strong>Focus:</strong> {art2.focus}</p>
              {art2.fortalezas && art2.fortalezas.length > 0 && (
                <div>
                  <strong>Fortalezas:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {art2.fortalezas.map((f, i) => (
                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {art1.tipo === art2.tipo && (
                <li>• Mismo tipo: {art1.tipo}</li>
              )}
              {art1.focus === art2.focus && (
                <li>• Mismo focus: {art1.focus}</li>
              )}
            </ul>
            {art1.paisProcedencia !== art2.paisProcedencia && 
             art1.tipoContacto !== art2.tipoContacto && 
             art1.demandasFisicas !== art2.demandasFisicas && 
             art1.tipo !== art2.tipo && 
             art1.focus !== art2.focus && (
              <p className="text-sm text-green-700">• Estilos muy diferentes, ideal para comparar enfoques distintos</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🔄 Diferencias</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {art1.paisProcedencia !== art2.paisProcedencia && (
                <li>• Origen: {art1.paisProcedencia} vs {art2.paisProcedencia}</li>
              )}
              {art1.tipoContacto !== art2.tipoContacto && (
                <li>• Contacto: {art1.tipoContacto} vs {art2.tipoContacto}</li>
              )}
              {art1.demandasFisicas !== art2.demandasFisicas && (
                <li>• Demandas: {art1.demandasFisicas} vs {art2.demandasFisicas}</li>
              )}
              {art1.tipo !== art2.tipo && (
                <li>• Tipo: {art1.tipo} vs {art2.tipo}</li>
              )}
              {art1.focus !== art2.focus && (
                <li>• Focus: {art1.focus} vs {art2.focus}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Panel de administración
  const AdminPanel = () => {
    const [adminView, setAdminView] = useState('stats'); // 'stats' o 'details'

    const AdminStats = () => (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">⚙️ Panel de Administrador</h2>
          <button
            onClick={() => setAdminView('details')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            📋 Ver Detalles Completos
          </button>
        </div>
        
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

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={initializeData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            🌱 Inicializar Datos
          </button>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            ➕ Crear Nueva Arte Marcial
          </button>
        </div>
      </div>
    );

    const AdminDetails = () => (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">📋 Detalles Completos - Todas las Artes Marciales</h2>
            <button
              onClick={() => setAdminView('stats')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              ← Volver a Estadísticas
            </button>
          </div>
          <p className="text-gray-600 mt-2">Vista completa de todos los datos registrados</p>
        </div>

        <div className="p-6">
          {martialArts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay artes marciales registradas
            </div>
          ) : (
            <div className="space-y-6">
              {martialArts.map((art, index) => (
                <div key={art._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {art.nombre}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(art)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteArt(art._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Información básica */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 border-b pb-1">📍 Información General</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">País:</span> {art.paisProcedencia || 'No especificado'}</p>
                        <p><span className="font-medium">Época:</span> {art.edadOrigen || 'No especificado'}</p>
                        <p><span className="font-medium">Tipo:</span> {art.tipo || 'No especificado'}</p>
                        <p><span className="font-medium">Focus:</span> {art.focus || 'No especificado'}</p>
                      </div>
                    </div>

                    {/* Características técnicas */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 border-b pb-1">🥊 Características</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Contacto:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            art.tipoContacto ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {art.tipoContacto || 'No especificado'}
                          </span>
                        </p>
                        <p><span className="font-medium">Demandas:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            art.demandasFisicas === 'Baja' || art.demandasFisicas === 'Baja-Media' 
                              ? 'bg-green-100 text-green-800'
                              : art.demandasFisicas === 'Media' || art.demandasFisicas === 'Media-Alta'
                              ? 'bg-yellow-100 text-yellow-800'
                              : art.demandasFisicas
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {art.demandasFisicas || 'No especificado'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Metadatos */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 border-b pb-1">ℹ️ Metadatos</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">ID:</span> {art._id}</p>
                        <p><span className="font-medium">Creado:</span> {
                          art.fechaCreacion ? new Date(art.fechaCreacion).toLocaleDateString() : 'No disponible'
                        }</p>
                        <p><span className="font-medium">Modificado:</span> {
                          art.fechaModificacion ? new Date(art.fechaModificacion).toLocaleDateString() : 'No disponible'
                        }</p>
                      </div>
                    </div>
                  </div>

                  {/* Filosofía */}
                  {art.filosofia && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">🧘 Filosofía</h4>
                      <p className="text-sm text-gray-700 italic">"{art.filosofia}"</p>
                    </div>
                  )}

                  {/* Fortalezas */}
                  {art.fortalezas && art.fortalezas.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">💪 Fortalezas ({art.fortalezas.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {art.fortalezas.map((fortaleza, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {fortaleza}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {art.videos && art.videos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">🎥 Videos ({art.videos.length})</h4>
                      <div className="space-y-2">
                        {art.videos.map((video, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <a 
                              href={video} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all"
                            >
                              🔗 {video}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        {adminView === 'stats' ? <AdminStats /> : <AdminDetails />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando artes marciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              🥋 Sistema de Artes Marciales
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, <strong>{user?.nombre}</strong>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {user?.role || 'user'}
                </span>
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
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
        <div className="max-w-7xl mx-auto px-4 pt-4">
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

      {/* Navegación */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentView('lista')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'lista'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Lista
              </button>

              {isModeratorOrAdmin() && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚙️ Admin
                </button>
              )}

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
                  🗑️ Limpiar
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ➕ Nueva
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {currentView === 'comparacion' ? (
          <ComparisonView />
        ) : currentView === 'admin' ? (
          isModeratorOrAdmin() ? (
            <AdminPanel />
          ) : (
            <div className="text-center py-12">
              <div className="text-yellow-600 text-xl">⚠️ No tienes permisos para acceder al panel de administrador</div>
            </div>
          )
        ) : (
          <>
            {/* Búsqueda */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Lista de artes marciales */}
            {filteredArts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {martialArts.length === 0 
                    ? 'No hay artes marciales cargadas' 
                    : 'No se encontraron artes marciales que coincidan con la búsqueda'
                  }
                </div>
                {martialArts.length === 0 && isModeratorOrAdmin() && (
                  <div className="space-y-2">
                    <button 
                      onClick={initializeData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                    >
                      🌱 Inicializar Datos
                    </button>
                    <button 
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      ➕ Crear Nueva
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArts.map(art => (
                  <MartialArtCard key={art._id} art={art} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>Sistema de Artes Marciales - {martialArts.length} disciplinas disponibles</p>
          <p className="text-sm">Usuario: {user?.nombre} {user?.apellidos} | Rol: {user?.role}</p>
        </div>
      </footer>

      {/* Modal */}
      <MartialArtModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setArtToEdit(null);
        }}
        artToEdit={artToEdit}
        onSave={handleSaveArt}
      />
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <AuthProvider>
      <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
    </AuthProvider>
  );
}

// Componente de contenido que maneja la autenticación
function AppContent({ showLogin, setShowLogin }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔄 AppContent render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showLogin ? (
      <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return <AuthenticatedApp />;
}

export default App;
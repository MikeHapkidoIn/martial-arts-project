// /frontend/src/App.js - Versión completa con CRUD funcional y diseño mejorado
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">🔐 Iniciar Sesión</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@martialarts.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-center border">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">📝 Crear Cuenta</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <input
                name="apellidos"
                type="text"
                required
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-500 font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para Crear/Editar Arte Marcial
const MartialArtModal = ({ isOpen, onClose, artToEdit, onSave, isLoading }) => {
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
    if (isOpen) {
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
      setNewFortaleza('');
      setNewVideo('');
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {artToEdit ? '✏️ Editar Arte Marcial' : '➕ Nueva Arte Marcial'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Karate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País de Procedencia *</label>
                <input
                  name="paisProcedencia"
                  type="text"
                  required
                  value={formData.paisProcedencia}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Japón"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad de Origen</label>
                <input
                  name="edadOrigen"
                  type="text"
                  value={formData.edadOrigen}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Siglo XV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Arte marcial tradicional">Arte marcial tradicional</option>
                  <option value="Deporte de combate">Deporte de combate</option>
                  <option value="Sistema de defensa personal">Sistema de defensa personal</option>
                  <option value="Arte marcial mixto">Arte marcial mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus</label>
                <select
                  name="focus"
                  value={formData.focus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contacto</label>
                <select
                  name="tipoContacto"
                  value={formData.tipoContacto}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar contacto</option>
                  <option value="Contacto completo">Contacto completo</option>
                  <option value="Semi-contacto">Semi-contacto</option>
                  <option value="Sin contacto">Sin contacto</option>
                  <option value="Contacto ligero">Contacto ligero</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demandas Físicas</label>
                <select
                  name="demandasFisicas"
                  value={formData.demandasFisicas}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Filosofía</label>
              <textarea
                name="filosofia"
                value={formData.filosofia}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe la filosofía de este arte marcial..."
              />
            </div>

            {/* Fortalezas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fortalezas</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFortaleza}
                  onChange={(e) => setNewFortaleza(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Agregar fortaleza..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFortaleza())}
                />
                <button
                  type="button"
                  onClick={addFortaleza}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ➕ Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.fortalezas.map((fortaleza, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm flex items-center gap-2"
                  >
                    {fortaleza}
                    <button
                      type="button"
                      onClick={() => removeFortaleza(index)}
                      className="text-green-600 hover:text-green-800 font-bold"
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
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
                />
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Agregar
                </button>
              </div>
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm text-blue-800 truncate flex-1">{video}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-blue-600 hover:text-blue-800 ml-3 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Guardando...' : (artToEdit ? 'Actualizar Arte Marcial' : 'Crear Arte Marcial')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
  const [modalLoading, setModalLoading] = useState(false);

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
      art.paisProcedencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (art.tipo && art.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (art.focus && art.focus.toLowerCase().includes(searchTerm.toLowerCase()))
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
      setModalLoading(true);
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
    } finally {
      setModalLoading(false);
    }
    setTimeout(() => { setMessage(''); setError(null); }, 3000);
  };

  const updateArt = async (artId, artData) => {
    try {
      setModalLoading(true);
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
    } finally {
      setModalLoading(false);
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
    console.log('🔧 Editando arte marcial:', art);
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

  // Componente de tarjeta de arte marcial mejorado con layout de cards
  const MartialArtCard = ({ art }) => {
    const isExpanded = expandedCards.has(art._id);
    const isSelected = selectedArts.find(a => a._id === art._id);
    
    return (
      <div className={`arte-card ${isSelected ? 'ring-2' : ''} fade-in`}>
        {/* Header de la card */}
        <div className="border-b border-gray-600 pb-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="arte-title flex-1">{art.nombre}</h3>
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => toggleSelectArt(art)}
              className="ml-3 h-5 w-5 text-purple-600 rounded focus:ring-purple-500 bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm mb-3">
            <span className="arte-tag">
              📍 {art.paisProcedencia}
            </span>
            {art.edadOrigen && (
              <span className="arte-tag style-mixto">
                ⏰ {art.edadOrigen}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-300">Tipo:</span>
              <p className="text-gray-400">{art.tipo || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-300">Focus:</span>
              <p className="text-gray-400">{art.focus || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* Características principales */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {art.tipoContacto && (
              <span className="arte-tag style-striking">
                🤜 {art.tipoContacto}
              </span>
            )}
            {art.demandasFisicas && (
              <span className={`difficulty-badge ${
                art.demandasFisicas === 'Baja' || art.demandasFisicas === 'Baja-Media' 
                  ? 'difficulty-principiante'
                  : art.demandasFisicas === 'Media' || art.demandasFisicas === 'Media-Alta'
                  ? 'difficulty-intermedio'
                  : 'difficulty-avanzado'
              }`}>
                💪 {art.demandasFisicas}
              </span>
            )}
          </div>

          {/* Fortalezas resumidas */}
          {!isExpanded && art.fortalezas && art.fortalezas.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">💪 Fortalezas principales:</h4>
              <div className="flex flex-wrap gap-1">
                {art.fortalezas.slice(0, 3).map((fortaleza, index) => (
                  <span key={index} className="arte-tag style-grappling text-xs">
                    {fortaleza}
                  </span>
                ))}
                {art.fortalezas.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">+{art.fortalezas.length - 3} más</span>
                )}
              </div>
            </div>
          )}

          {/* Filosofía resumida */}
          {!isExpanded && art.filosofia && (
            <div className="mb-4 p-3 glass rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-1">🧘 Filosofía:</h4>
              <p className="text-xs text-gray-400 italic">
                "{art.filosofia.length > 100 ? art.filosofia.substring(0, 100) + '...' : art.filosofia}"
              </p>
            </div>
          )}

          {/* Detalles expandidos */}
          {isExpanded && (
            <div className="space-y-4 border-t border-gray-600 pt-4">
              {/* Filosofía completa */}
              {art.filosofia && (
                <div className="glass p-4 rounded-lg border border-blue-500">
                  <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                    🧘 Filosofía Completa
                  </h4>
                  <p className="text-sm text-blue-200 italic leading-relaxed">"{art.filosofia}"</p>
                </div>
              )}

              {/* Todas las fortalezas */}
              {art.fortalezas && art.fortalezas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-300 mb-3 flex items-center">
                    💪 Todas las Fortalezas ({art.fortalezas.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {art.fortalezas.map((fortaleza, index) => (
                      <span key={index} className="arte-tag style-grappling text-sm">
                        {fortaleza}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {art.videos && art.videos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-300 mb-3 flex items-center">
                    🎥 Videos ({art.videos.length})
                  </h4>
                  <div className="space-y-2">
                    {art.videos.map((video, index) => (
                      <div key={index} className="glass p-3 rounded-lg border border-red-500">
                        <a 
                          href={video} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-300 hover:text-red-100 text-sm break-all hover:underline transition-colors"
                        >
                          🔗 {video}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className="border-t border-gray-600 pt-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <button
              onClick={() => toggleCardDetails(art._id)}
              className={`btn-primary text-sm ${isExpanded ? 'btn-warning' : ''}`}
            >
              {isExpanded ? '📄 Ocultar Detalles' : '📋 Ver Detalles'}
            </button>

            <div className="flex gap-2">
              {canEdit(art) && (
                <button
                  onClick={() => handleEdit(art)}
                  className="btn-warning text-sm"
                >
                  ✏️ Editar
                </button>
              )}
              
              {canDelete(art) && (
                <button
                  onClick={() => deleteArt(art._id)}
                  className="btn-danger text-sm"
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de comparación mejorado
  const ComparisonView = () => {
    if (selectedArts.length !== 2) return null;
    
    const [art1, art2] = selectedArts;
    
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">🥊 Comparación de Artes Marciales</h2>
          <button
            onClick={() => setCurrentView('lista')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            ← Volver a Lista
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Arte Marcial 1 */}
          <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
            <h3 className="text-2xl font-bold text-center mb-6 text-blue-600">{art1.nombre}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Origen:</span>
                  <p className="text-gray-900">{art1.paisProcedencia}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Época:</span>
                  <p className="text-gray-900">{art1.edadOrigen || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <p className="text-gray-900">{art1.tipo || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Contacto:</span>
                  <p className="text-gray-900">{art1.tipoContacto || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Demandas físicas:</span>
                  <p className="text-gray-900">{art1.demandasFisicas || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Focus:</span>
                  <p className="text-gray-900">{art1.focus || 'No especificado'}</p>
                </div>
              </div>
              
              {art1.fortalezas && art1.fortalezas.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <span className="font-medium text-gray-700 block mb-2">Fortalezas:</span>
                  <div className="flex flex-wrap gap-2">
                    {art1.fortalezas.map((f, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Arte Marcial 2 */}
          <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
            <h3 className="text-2xl font-bold text-center mb-6 text-purple-600">{art2.nombre}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Origen:</span>
                  <p className="text-gray-900">{art2.paisProcedencia}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Época:</span>
                  <p className="text-gray-900">{art2.edadOrigen || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <p className="text-gray-900">{art2.tipo || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Contacto:</span>
                  <p className="text-gray-900">{art2.tipoContacto || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Demandas físicas:</span>
                  <p className="text-gray-900">{art2.demandasFisicas || 'No especificado'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-gray-700">Focus:</span>
                  <p className="text-gray-900">{art2.focus || 'No especificado'}</p>
                </div>
              </div>
              
              {art2.fortalezas && art2.fortalezas.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <span className="font-medium text-gray-700 block mb-2">Fortalezas:</span>
                  <div className="flex flex-wrap gap-2">
                    {art2.fortalezas.map((f, i) => (
                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Análisis de comparación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center">
              ✅ Similitudes
            </h4>
            <ul className="text-sm text-green-700 space-y-2">
              {art1.paisProcedencia === art2.paisProcedencia && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Ambas originarias de {art1.paisProcedencia}
                </li>
              )}
              {art1.tipoContacto === art2.tipoContacto && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Mismo tipo de contacto: {art1.tipoContacto}
                </li>
              )}
              {art1.demandasFisicas === art2.demandasFisicas && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Mismas demandas físicas: {art1.demandasFisicas}
                </li>
              )}
              {art1.tipo === art2.tipo && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Mismo tipo: {art1.tipo}
                </li>
              )}
              {art1.focus === art2.focus && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Mismo focus: {art1.focus}
                </li>
              )}
              {art1.paisProcedencia !== art2.paisProcedencia && 
               art1.tipoContacto !== art2.tipoContacto && 
               art1.demandasFisicas !== art2.demandasFisicas && 
               art1.tipo !== art2.tipo && 
               art1.focus !== art2.focus && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Estilos muy diferentes, ideal para comparar enfoques distintos
                </li>
              )}
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center">
              🔄 Diferencias Principales
            </h4>
            <ul className="text-sm text-blue-700 space-y-2">
              {art1.paisProcedencia !== art2.paisProcedencia && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Origen: {art1.paisProcedencia} vs {art2.paisProcedencia}
                </li>
              )}
              {art1.tipoContacto !== art2.tipoContacto && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Contacto: {art1.tipoContacto || 'No especificado'} vs {art2.tipoContacto || 'No especificado'}
                </li>
              )}
              {art1.demandasFisicas !== art2.demandasFisicas && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Demandas: {art1.demandasFisicas || 'No especificado'} vs {art2.demandasFisicas || 'No especificado'}
                </li>
              )}
              {art1.tipo !== art2.tipo && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Tipo: {art1.tipo || 'No especificado'} vs {art2.tipo || 'No especificado'}
                </li>
              )}
              {art1.focus !== art2.focus && (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Focus: {art1.focus || 'No especificado'} vs {art2.focus || 'No especificado'}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Panel de administración mejorado
  const AdminPanel = () => {
    const [adminView, setAdminView] = useState('stats');

    const AdminStats = () => (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">⚙️ Panel de Administrador</h2>
          <button
            onClick={() => setAdminView('details')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📋 Ver Detalles Completos
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">{martialArts.length}</div>
            <div className="text-blue-800 font-medium">Total Artes Marciales</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {new Set(martialArts.map(art => art.paisProcedencia)).size}
            </div>
            <div className="text-green-800 font-medium">Países Representados</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {new Set(martialArts.map(art => art.tipo)).size}
            </div>
            <div className="text-purple-800 font-medium">Tipos Diferentes</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {martialArts.filter(art => art.videos && art.videos.length > 0).length}
            </div>
            <div className="text-orange-800 font-medium">Con Videos</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={initializeData}
            className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors shadow-lg"
          >
            🌱 Inicializar Datos
          </button>
          <button
            onClick={handleCreateNew}
            className="px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-colors shadow-lg"
          >
            ➕ Crear Nueva Arte Marcial
          </button>
        </div>
      </div>
    );

    const AdminDetails = () => (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">📋 Detalles Completos</h2>
            <button
              onClick={() => setAdminView('stats')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              ← Volver a Estadísticas
            </button>
          </div>
          <p className="text-gray-600 mt-2">Vista completa de todos los datos registrados</p>
        </div>

        <div className="p-8">
          {martialArts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🥋</div>
              <div className="text-xl">No hay artes marciales registradas</div>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Crear la primera
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {martialArts.map((art, index) => (
                <div key={art._id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {art.nombre}
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(art)}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteArt(art._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">📍 Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">País:</span> {art.paisProcedencia || 'No especificado'}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Época:</span> {art.edadOrigen || 'No especificado'}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Tipo:</span> {art.tipo || 'No especificado'}
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Focus:</span> {art.focus || 'No especificado'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">🥊 Características</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Contacto:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            art.tipoContacto ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {art.tipoContacto || 'No especificado'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">Demandas:</span>
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filosofía */}
                  {art.filosofia && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">🧘 Filosofía</h4>
                      <p className="text-sm text-blue-900 italic leading-relaxed">"{art.filosofia}"</p>
                    </div>
                  )}

                  {/* Fortalezas */}
                  {art.fortalezas && art.fortalezas.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-green-800 mb-3">💪 Fortalezas ({art.fortalezas.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {art.fortalezas.map((fortaleza, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm text-center border border-green-200">
                            {fortaleza}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {art.videos && art.videos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-red-800 mb-3">🎥 Videos ({art.videos.length})</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {art.videos.map((video, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <a 
                              href={video} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-800 text-sm break-all hover:underline transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando artes marciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header mejorado */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              🥋 Sistema de Artes Marciales
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Hola, <strong>{user?.nombre}</strong>
                </div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user?.role || 'user'}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mensajes mejorados */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative shadow-sm">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {message}
            </div>
            <button
              onClick={() => setMessage('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-sm">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
            <button
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navegación mejorada */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentView('lista')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentView === 'lista'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Lista de Artes
              </button>

              {isModeratorOrAdmin() && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentView === 'admin'
                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚙️ Administración
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
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedArts.length === 2
                    ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                🥊 Comparar ({selectedArts.length}/2)
              </button>

              {selectedArts.length > 0 && (
                <button
                  onClick={() => setSelectedArts([])}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  🗑️ Limpiar Selección
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors shadow-lg"
              >
                ➕ Nueva Arte Marcial
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
            <div className="text-center py-20">
              <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
              <div className="text-xl text-gray-600">No tienes permisos para acceder al panel de administrador</div>
            </div>
          )
        ) : (
          <>
            {/* Búsqueda mejorada */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, país, tipo o focus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="mt-3 text-sm text-gray-600">
                  Mostrando {filteredArts.length} de {martialArts.length} artes marciales
                </div>
              )}
            </div>

            {/* Lista de artes marciales con grid responsive - LAYOUT DE CARDS CORREGIDO */}
            {filteredArts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🥋</div>
                <div className="text-xl text-gray-500 mb-4">
                  {martialArts.length === 0 
                    ? 'No hay artes marciales cargadas' 
                    : 'No se encontraron artes marciales que coincidan con la búsqueda'
                  }
                </div>
                {martialArts.length === 0 && isModeratorOrAdmin() && (
                  <div className="space-y-3">
                    <button 
                      onClick={initializeData}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 mr-3 font-medium transition-colors"
                    >
                      🌱 Inicializar Datos de Ejemplo
                    </button>
                    <button 
                      onClick={handleCreateNew}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
                    >
                      ➕ Crear Nueva Arte Marcial
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="artes-grid">
                {filteredArts.map(art => (
                  <MartialArtCard key={art._id} art={art} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer mejorado */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📊 Estadísticas</h3>
              <p>{martialArts.length} disciplinas disponibles</p>
              <p>{new Set(martialArts.map(art => art.paisProcedencia)).size} países representados</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">👤 Usuario Actual</h3>
              <p>{user?.nombre} {user?.apellidos}</p>
              <p>Rol: {user?.role}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Selección</h3>
              <p>{selectedArts.length}/2 artes seleccionadas</p>
              <p>{filteredArts.length} mostradas actualmente</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal mejorado */}
      <MartialArtModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setArtToEdit(null);
        }}
        artToEdit={artToEdit}
        onSave={handleSaveArt}
        isLoading={modalLoading}
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Verificando autenticación...</p>
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../common/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import { martialArtsAPI } from '../../services/api';
import { CONTACT_TYPES, PHYSICAL_DEMANDS, MARTIAL_ART_TYPES } from '../../utils/constants';

const MartialArtForm = ({ onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    paisProcedencia: '',
    edadOrigen: '',
    tipo: '',
    distanciasTrabajadas: [],
    armas: [],
    tipoContacto: '',
    focus: '',
    fortalezas: [],
    debilidades: [],
    demandasFisicas: '',
    tecnicas: [],
    filosofia: '',
    historia: '',
    imagenes: [],
    videos: []
  });

  useEffect(() => {
    if (isEditing) {
      fetchMartialArt();
    }
  }, [id, isEditing]);

  const fetchMartialArt = async () => {
    try {
      setLoading(true);
      const response = await martialArtsAPI.getById(id);
      const art = response.data;
      setFormData({
        nombre: art.nombre || '',
        paisProcedencia: art.paisProcedencia || '',
        edadOrigen: art.edadOrigen || '',
        tipo: art.tipo || '',
        distanciasTrabajadas: art.distanciasTrabajadas || [],
        armas: art.armas || [],
        tipoContacto: art.tipoContacto || '',
        focus: art.focus || '',
        fortalezas: art.fortalezas || [],
        debilidades: art.debilidades || [],
        demandasFisicas: art.demandasFisicas || '',
        tecnicas: art.tecnicas || [],
        filosofia: art.filosofia || '',
        historia: art.historia || '',
        imagenes: art.imagenes || [],
        videos: art.videos || []
      });
    } catch (error) {
      toast.error('Error al cargar la arte marcial');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.paisProcedencia.trim()) {
      toast.error('El país de procedencia es requerido');
      return;
    }
    if (!formData.filosofia.trim()) {
      toast.error('La filosofía es requerida');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await martialArtsAPI.update(id, formData);
        toast.success('Arte marcial actualizada correctamente');
      } else {
        await martialArtsAPI.create(formData);
        toast.success('Arte marcial creada correctamente');
      }
      
      onRefresh();
      navigate('/admin');
    } catch (error) {
      console.error('Error saving martial art:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la arte marcial';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando formulario..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Header
        title={isEditing ? 'Editar Arte Marcial' : 'Nueva Arte Marcial'}
        subtitle={isEditing ? `Editando: ${formData.nombre}` : 'Agregar una nueva disciplina al sistema'}
        showBackButton
        backPath="/admin"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Información Básica */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="input-field"
                placeholder="Ej: Karate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Procedencia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.paisProcedencia}
                onChange={(e) => handleInputChange('paisProcedencia', e.target.value)}
                className="input-field"
                placeholder="Ej: Japón"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad de Origen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.edadOrigen}
                onChange={(e) => handleInputChange('edadOrigen', e.target.value)}
                className="input-field"
                placeholder="Ej: Siglo XVII"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar tipo...</option>
                {MARTIAL_ART_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contacto <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.tipoContacto}
                onChange={(e) => handleInputChange('tipoContacto', e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar...</option>
                {CONTACT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.focus}
                onChange={(e) => handleInputChange('focus', e.target.value)}
                className="input-field"
                placeholder="Ej: Defensa personal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandas Físicas <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.demandasFisicas}
                onChange={(e) => handleInputChange('demandasFisicas', e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar...</option>
                {PHYSICAL_DEMANDS.map(demand => (
                  <option key={demand} value={demand}>{demand}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Características Técnicas</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distancias Trabajadas
              </label>
              <input
                type="text"
                value={formData.distanciasTrabajadas.join(', ')}
                onChange={(e) => handleArrayInput('distanciasTrabajadas', e.target.value)}
                className="input-field"
                placeholder="Ej: Corta, Media, Larga (separadas por comas)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separar múltiples valores con comas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Armas Utilizadas
              </label>
              <input
                type="text"
                value={formData.armas.join(', ')}
                onChange={(e) => handleArrayInput('armas', e.target.value)}
                className="input-field"
                placeholder="Ej: Bastón, Espada, Cuchillo (separadas por comas)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fortalezas
              </label>
              <input
                type="text"
                value={formData.fortalezas.join(', ')}
                onChange={(e) => handleArrayInput('fortalezas', e.target.value)}
                className="input-field"
                placeholder="Ej: Flexibilidad, Velocidad, Precisión"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Debilidades/Consideraciones
              </label>
              <input
                type="text"
                value={formData.debilidades.join(', ')}
                onChange={(e) => handleArrayInput('debilidades', e.target.value)}
                className="input-field"
                placeholder="Ej: Requiere mucha práctica, Limitado en suelo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnicas Principales
              </label>
              <input
                type="text"
                value={formData.tecnicas.join(', ')}
                onChange={(e) => handleArrayInput('tecnicas', e.target.value)}
                className="input-field"
                placeholder="Ej: Patadas, Proyecciones, Llaves"
              />
            </div>
          </div>
        </div>

        {/* Filosofía e Historia */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filosofía e Historia</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filosofía <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.filosofia}
                onChange={(e) => handleInputChange('filosofia', e.target.value)}
                rows="3"
                className="input-field resize-none"
                placeholder="Describe la filosofía principal del arte marcial..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historia
              </label>
              <textarea
                value={formData.historia}
                onChange={(e) => handleInputChange('historia', e.target.value)}
                rows="5"
                className="input-field resize-none"
                placeholder="Describe la historia y desarrollo del arte marcial..."
              />
            </div>
          </div>
        </div>

        {/* Multimedia */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Multimedia</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs de Imágenes
              </label>
              <input
                type="text"
                value={formData.imagenes.join(', ')}
                onChange={(e) => handleArrayInput('imagenes', e.target.value)}
                className="input-field"
                placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                URLs completas de imágenes, separadas por comas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs de Videos
              </label>
              <input
                type="text"
                value={formData.videos.join(', ')}
                onChange={(e) => handleArrayInput('videos', e.target.value)}
                className="input-field"
                placeholder="https://youtube.com/embed/video1, https://youtube.com/embed/video2"
              />
              <p className="text-xs text-gray-500 mt-1">
                URLs de videos embebidos (YouTube, Vimeo, etc.), separadas por comas
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn-secondary"
            disabled={saving}
          >
            <ArrowLeft size={16} />
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            {saving 
              ? (isEditing ? 'Actualizando...' : 'Creando...') 
              : (isEditing ? 'Actualizar' : 'Crear')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default MartialArtForm;
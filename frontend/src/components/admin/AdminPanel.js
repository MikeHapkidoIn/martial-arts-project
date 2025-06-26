import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../common/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import { martialArtsAPI } from '../../services/api';

const AdminPanel = ({ martialArts, loading, error, onRefresh }) => {
  const navigate = useNavigate();

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await martialArtsAPI.delete(id);
        toast.success(`${nombre} eliminada correctamente`);
        onRefresh();
      } catch (error) {
        toast.error('Error al eliminar la arte marcial');
        console.error('Error deleting martial art:', error);
      }
    }
  };

  const handleEdit = (art) => {
    navigate(`/admin/form/${art._id}`);
  };

  const handleView = (art) => {
    navigate(`/martial-art/${art._id}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button onClick={onRefresh} className="btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Panel de Administrador"
        subtitle="Gestiona las artes marciales del sistema"
        showBackButton
        backPath="/"
      >
        <button
          onClick={() => navigate('/admin/form')}
          className="btn-primary"
        >
          <Plus size={16} />
          Nueva Arte Marcial
        </button>
      </Header>

      {loading ? (
        <LoadingSpinner text="Cargando datos..." />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandas Físicas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {martialArts.length > 0 ? (
                  martialArts.map((art) => (
                    <tr key={art._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {art.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{art.paisProcedencia}</div>
                        <div className="text-sm text-gray-500">{art.edadOrigen}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                          {art.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          art.demandasFisicas === 'Baja' || art.demandasFisicas === 'Baja-Media' 
                            ? 'bg-green-100 text-green-800'
                            : art.demandasFisicas === 'Media' || art.demandasFisicas === 'Media-Alta'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {art.demandasFisicas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {art.updatedAt ? new Date(art.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(art)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(art)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(art._id, art.nombre)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No hay artes marciales registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      {!loading && martialArts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {martialArts.length}
            </div>
            <div className="text-sm text-gray-600">Total Artes Marciales</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {new Set(martialArts.map(art => art.paisProcedencia)).size}
            </div>
            <div className="text-sm text-gray-600">Países de Origen</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {new Set(martialArts.map(art => art.tipo)).size}
            </div>
            <div className="text-sm text-gray-600">Tipos Diferentes</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const getPhysicalDemandColor = (demand) => {
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

export const getContactTypeColor = (contactType) => {
  const colors = {
    'Contacto completo': 'bg-red-100 text-red-800',
    'Semi-contacto': 'bg-orange-100 text-orange-800',
    'No-contacto': 'bg-blue-100 text-blue-800',
    'Suave': 'bg-green-100 text-green-800',
    'Variable': 'bg-purple-100 text-purple-800'
  };
  return colors[contactType] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const filterMartialArts = (martialArts, filters) => {
  return martialArts.filter(art => {
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        art.nombre.toLowerCase().includes(searchLower) ||
        art.paisProcedencia.toLowerCase().includes(searchLower) ||
        art.tipo.toLowerCase().includes(searchLower) ||
        art.focus.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filter by contact type
    if (filters.contactType && art.tipoContacto !== filters.contactType) {
      return false;
    }

    // Filter by physical demands
    if (filters.physicalDemands && art.demandasFisicas !== filters.physicalDemands) {
      return false;
    }

    // Filter by origin country
    if (filters.country && art.paisProcedencia !== filters.country) {
      return false;
    }

    return true;
  });
};
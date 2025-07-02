// /frontend/src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Hook para verificar permisos
const usePermissions = () => {
  const { user } = useAuth();

  const canEdit = (resource) => {
    if (!user) return false;
    
    // Admin y moderador pueden editar todo
    if (user.role === 'admin' || user.role === 'moderator') {
      return true;
    }
    
    // Usuario normal puede editar solo sus propios recursos
    if (resource && resource.createdBy) {
      return resource.createdBy === user._id;
    }
    
    return false;
  };

  const canDelete = (resource) => {
    if (!user) return false;
    
    // Solo admin puede eliminar
    if (user.role === 'admin') {
      return true;
    }
    
    return false;
  };

  const canCreate = () => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'moderator';
  };

  const canViewAdmin = () => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'moderator';
  };

  return {
    canEdit,
    canDelete,
    canCreate,
    canViewAdmin,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isUser: user?.role === 'user'
  };
};

// Componente para rutas que requieren autenticación
const AuthenticatedOnly = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

// Componente para rutas que requieren rol de moderador o admin
const ModeratorRoute = ({ children, fallback = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        ⛔ Necesitas iniciar sesión para acceder a esta función
      </div>
    );
  }

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        ⚠️ No tienes permisos para acceder a esta función
      </div>
    );
  }

  return children;
};

// Componente para rutas que requieren rol de admin
const AdminRoute = ({ children, fallback = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        ⛔ Necesitas iniciar sesión para acceder a esta función
      </div>
    );
  }

  if (user.role !== 'admin') {
    return fallback || (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        🚫 Solo administradores pueden acceder a esta función
      </div>
    );
  }

  return children;
};

// Componente para mostrar notificación de verificación de email
const EmailVerificationNotice = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || user.emailVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-yellow-400">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Email sin verificar</h3>
          <p className="text-sm">
            Tu email {user.email} no ha sido verificado. 
            Revisa tu bandeja de entrada para confirmar tu cuenta.
          </p>
        </div>
      </div>
    </div>
  );
};

// Exportar todos los componentes y hooks
export {
  usePermissions,
  AuthenticatedOnly,
  ModeratorRoute,
  AdminRoute,
  EmailVerificationNotice,
  AccountStatusBanner,
  RoleInfo
};

// Componente para mostrar banner de estado de cuenta
const AccountStatusBanner = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Mostrar si la cuenta está inactiva
  if (!user.isActive) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-400">🚫</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Cuenta desactivada</h3>
            <p className="text-sm">
              Tu cuenta ha sido desactivada. Contacta al administrador para más información.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Componente para mostrar información de roles
const RoleInfo = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const roleInfo = {
    admin: {
      color: 'bg-red-100 text-red-800',
      icon: '👑',
      description: 'Administrador - Acceso completo'
    },
    moderator: {
      color: 'bg-blue-100 text-blue-800',
      icon: '🛡️',
      description: 'Moderador - Puede crear y editar contenido'
    },
    user: {
      color: 'bg-green-100 text-green-800',
      icon: '👤',
      description: 'Usuario - Acceso de lectura'
    }
  };

  const info = roleInfo[user.role] || roleInfo.user;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
      <span className="mr-1">{info.icon}</span>
      {info.description}
    </div>
  );
};
// /frontend/src/contexts/AuthContext.js - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // EFECTO PRINCIPAL: Inicializar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 [AuthContext] Inicializando autenticación...');
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('❌ [AuthContext] No hay token almacenado');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        console.log('🔍 [AuthContext] Token encontrado, verificando validez...');
        
        // Verificar si el token es válido obteniendo la información del usuario
        const response = await authAPI.getMe();
        
        // VALIDACIÓN DEFENSIVA: Verificar que response existe y tiene la estructura correcta
        if (response && typeof response === 'object' && response.success && response.data) {
          console.log('✅ [AuthContext] Token válido, usuario autenticado:', response.data.email);
          setUser(response.data);
          setIsAuthenticated(true);
          setError(null);
        } else {
          console.warn('⚠️ [AuthContext] Respuesta inesperada del servidor:', response);
          throw new Error('Respuesta del servidor no válida');
        }
        
      } catch (error) {
        console.error('❌ [AuthContext] Error verificando autenticación:', error);
        
        // Si hay error 401, el token es inválido
        if (error && error.response && error.response.status === 401) {
          console.log('🧹 [AuthContext] Token inválido, limpiando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        
        // Resetear estado de autenticación
        setIsAuthenticated(false);
        setUser(null);
        setError(null);
        
      } finally {
        console.log('✅ [AuthContext] Inicialización de autenticación completada');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // ⚠️ CRÍTICO: Array vacío para ejecutar solo UNA VEZ

  // FUNCIÓN DE LOGIN
  const login = async (credentials) => {
    console.log('🔐 [AuthContext] Iniciando proceso de login para:', credentials.email);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // VALIDACIÓN DEFENSIVA: Verificar que credentials existe
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('Credenciales inválidas');
      }

      const response = await authAPI.login(credentials);
      console.log('📡 [AuthContext] Respuesta del servidor:', response);
      
      // VALIDACIÓN DEFENSIVA: Verificar estructura de respuesta
      if (response && 
          typeof response === 'object' && 
          response.success && 
          response.token && 
          response.user) {
        console.log('✅ [AuthContext] Login exitoso');
        
        // Guardar tokens en localStorage
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Actualizar estado
        setUser(response.user);
        setIsAuthenticated(true);
        setError(null);
        
        console.log('✅ [AuthContext] Estado actualizado - Usuario logueado');
        return response;
        
      } else {
        console.error('❌ [AuthContext] Respuesta de login inválida:', response);
        const errorMsg = (response && response.message) ? response.message : 'Respuesta de login inválida';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ [AuthContext] Error en login:', error);
      
      let errorMessage = 'Error de conexión. Verifica tus credenciales.';
      
      if (error && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      
      // Limpiar tokens en caso de error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      throw new Error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCIÓN DE REGISTRO
  const register = async (userData) => {
    console.log('📝 [AuthContext] Iniciando proceso de registro para:', userData.email);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // VALIDACIÓN DEFENSIVA: Verificar que userData existe
      if (!userData || !userData.email || !userData.password) {
        throw new Error('Datos de registro inválidos');
      }

      const response = await authAPI.register(userData);
      console.log('📡 [AuthContext] Respuesta del registro:', response);
      
      // VALIDACIÓN DEFENSIVA: Verificar estructura de respuesta
      if (response && 
          typeof response === 'object' && 
          response.success && 
          response.token && 
          response.user) {
        console.log('✅ [AuthContext] Registro exitoso');
        
        // Guardar tokens en localStorage
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Actualizar estado (auto-login después del registro)
        setUser(response.user);
        setIsAuthenticated(true);
        setError(null);
        
        console.log('✅ [AuthContext] Estado actualizado - Usuario registrado y logueado');
        return response;
        
      } else {
        console.error('❌ [AuthContext] Respuesta de registro inválida:', response);
        const errorMsg = (response && response.message) ? response.message : 'Error en el registro';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ [AuthContext] Error en registro:', error);
      
      let errorMessage = 'Error en el registro. Intenta nuevamente.';
      
      if (error && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      
      // Limpiar tokens en caso de error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      throw new Error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCIÓN DE LOGOUT
  const logout = async () => {
    console.log('🚪 [AuthContext] Iniciando proceso de logout');
    
    try {
      // Intentar notificar al servidor (opcional, no crítico)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await authAPI.logout({ refreshToken });
          console.log('✅ [AuthContext] Logout notificado al servidor');
        } catch (error) {
          console.warn('⚠️ [AuthContext] Error notificando logout al servidor:', error.message);
          // No es crítico, continuamos con el logout local
        }
      }
    } catch (error) {
      console.warn('⚠️ [AuthContext] Error en logout del servidor:', error.message);
    }
    
    // Limpiar estado local (siempre se ejecuta)
    console.log('🧹 [AuthContext] Limpiando estado local');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ [AuthContext] Logout completado');
  };

  // FUNCIÓN PARA ACTUALIZAR PERFIL
  const updateProfile = async (profileData) => {
    console.log('✏️ [AuthContext] Actualizando perfil del usuario');
    
    try {
      setError(null);
      
      // VALIDACIÓN DEFENSIVA
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Datos de perfil inválidos');
      }

      const response = await authAPI.updateProfile(profileData);
      
      // VALIDACIÓN DEFENSIVA: Verificar estructura de respuesta
      if (response && typeof response === 'object' && response.success && response.data) {
        console.log('✅ [AuthContext] Perfil actualizado exitosamente');
        setUser(response.data);
        return response;
      } else {
        const errorMsg = (response && response.message) ? response.message : 'Error actualizando perfil';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ [AuthContext] Error actualizando perfil:', error);
      
      let errorMessage = 'Error actualizando perfil';
      
      if (error && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // FUNCIÓN PARA REFRESCAR DATOS DEL USUARIO
  const refreshUser = async () => {
    console.log('🔄 [AuthContext] Refrescando datos del usuario');
    
    try {
      const response = await authAPI.getMe();
      
      // VALIDACIÓN DEFENSIVA: Verificar estructura de respuesta
      if (response && typeof response === 'object' && response.success && response.data) {
        console.log('✅ [AuthContext] Datos del usuario refrescados');
        setUser(response.data);
        return response.data;
      } else {
        throw new Error('Error obteniendo datos del usuario');
      }
      
    } catch (error) {
      console.error('❌ [AuthContext] Error refrescando usuario:', error);
      
      // Si hay error 401, el token puede haber expirado
      if (error && error.response && error.response.status === 401) {
        console.log('🚪 [AuthContext] Token expirado, forzando logout');
        await logout();
      }
      
      throw error;
    }
  };

  // FUNCIÓN PARA VERIFICAR SI EL USUARIO TIENE PERMISOS
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admins tienen todos los permisos
    if (user.role === 'admin') return true;
    
    // Moderadores tienen permisos limitados
    if (user.role === 'moderator') {
      const moderatorPermissions = ['create', 'edit', 'view'];
      return moderatorPermissions.includes(permission);
    }
    
    // Usuarios regulares solo pueden ver
    if (user.role === 'user') {
      return permission === 'view';
    }
    
    return false;
  };

  // VALORES DEL CONTEXTO
  const contextValue = {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Funciones principales
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    
    // Utilidades
    hasPermission,
    
    // Función para limpiar errores manualmente
    clearError: () => setError(null)
  };

  // Log del estado actual para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [AuthContext] Estado actual:', {
      isLoading,
      isAuthenticated,
      userEmail: user?.email || 'no user',
      userRole: user?.role || 'no role',
      hasError: !!error
    });
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth, AuthProvider };
// /frontend/src/contexts/AuthContext.js - VERSIÓN CORREGIDA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // CLAVE: useEffect que se ejecuta SOLO UNA VEZ al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inicializando autenticación - solo una vez');
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('❌ No hay token - usuario no autenticado');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Token encontrado, verificando...');
        const response = await authAPI.getMe();
        
        console.log('✅ Usuario autenticado:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        
        // Limpiar tokens inválidos
        if (error.response?.status === 401) {
          console.log('🧹 Token inválido - limpiando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        console.log('✅ Autenticación inicializada - isLoading = false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // ⚠️ IMPORTANTE: Array vacío - solo se ejecuta UNA VEZ

  const login = async (credentials) => {
    console.log('🔐 Iniciando login...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      console.log('✅ Login exitoso:', response);
      
      if (response.success) {
        // Guardar tokens
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return response;
      } else {
        throw new Error(response.message || 'Error en login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    console.log('📝 Iniciando registro...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Auto-login después del registro
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error(response.message || 'Error en registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar todo el estado
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ Sesión cerrada');
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Error actualizando perfil');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Valores del contexto
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  console.log('🔄 AuthProvider render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth, AuthProvider };
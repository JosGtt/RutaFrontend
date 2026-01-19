import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosAuth from '../config/axiosAuth';
import { API_ENDPOINTS, apiConfig } from '../config/api';

interface User {
  id: number;
  username: string;
  nombre_completo: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  // Funciones de autorización
  canEdit: () => boolean;
  canCreate: () => boolean;
  canRead: () => boolean;
  canDelete: () => boolean;
  canDeleteProgreso: () => boolean;
  canUnfinalize: () => boolean;
  isAdmin: () => boolean;
  isDeveloper: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configurar axios baseURL
  useEffect(() => {
    axiosAuth.defaults.baseURL = apiConfig.baseURL;
  }, []);

  // Verificar token al cargar la app (sessionStorage)
  useEffect(() => {
    const storedToken = sessionStorage.getItem('sedeges_token');
    const storedUser = sessionStorage.getItem('sedeges_user');

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn('No se pudo parsear el usuario en sessionStorage');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axiosAuth.post(
        API_ENDPOINTS.AUTH_LOGIN,
        { username, password },
        { withCredentials: true }
      );

      const { token: newToken, usuario: userData } = response.data;
      
      console.log('✅ Login exitoso, datos recibidos:', { 
        token: newToken?.substring(0, 20) + '...', 
        usuario: userData 
      });
      
      // Guardar en sessionStorage primero
      sessionStorage.setItem('sedeges_token', newToken);
      sessionStorage.setItem('sedeges_user', JSON.stringify(userData));
      
      // Luego actualizar el estado
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Estado actualizado correctamente');
      
      return true;
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sedeges_token');
    sessionStorage.removeItem('sedeges_user');
  };

  // Funciones de autorización
  const canEdit = (): boolean => {
    const rol = user?.rol?.toLowerCase();
    return rol === 'desarrollador' || rol === 'admin' || rol === 'administrador';
  };

  const canCreate = (): boolean => {
    return !!user; // Cualquier usuario autenticado puede crear
  };

  const canRead = (): boolean => {
    return !!user; // Cualquier usuario autenticado puede leer
  };

  const canDelete = (): boolean => {
    const rol = user?.rol?.toLowerCase();
    return rol === 'desarrollador' || rol === 'admin' || rol === 'administrador';
  };

  const canDeleteProgreso = (): boolean => {
    const rol = user?.rol?.toLowerCase();
    return rol === 'desarrollador' || rol === 'admin' || rol === 'administrador';
  };

  const canUnfinalize = (): boolean => {
    // Solo admin y desarrollador pueden cambiar de finalizada a en_proceso
    const rol = user?.rol?.toLowerCase();
    return rol === 'desarrollador' || rol === 'admin' || rol === 'administrador';
  };

  const isAdmin = (): boolean => {
    const rol = user?.rol?.toLowerCase();
    return rol === 'admin' || rol === 'administrador' || rol === 'desarrollador';
  };

  const isDeveloper = (): boolean => {
    return user?.rol?.toLowerCase() === 'desarrollador';
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    canEdit,
    canCreate,
    canRead,
    canDelete,
    canDeleteProgreso,
    canUnfinalize,
    isAdmin,
    isDeveloper
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
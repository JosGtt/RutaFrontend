import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute - Estado:', { 
    isLoading, 
    hasUser: !!user,
    user: user ? { id: user.id, username: user.username } : null 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-morado-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-gris-600)]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedRoute - Redirigiendo a login (no hay usuario)');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 ProtectedRoute - Acceso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;
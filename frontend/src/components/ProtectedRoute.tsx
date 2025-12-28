import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRole?: 'client' | 'freelancer' | 'admin';
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate('/');
      return;
    }

    setIsAuthorized(true);
  }, [isAuthenticated, user, requiredRole, navigate]);

  if (!isAuthorized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

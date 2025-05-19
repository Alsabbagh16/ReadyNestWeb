
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, loading: authContextLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authContextLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authContextLoading, navigate]);

  if (authContextLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return null; 
};
  
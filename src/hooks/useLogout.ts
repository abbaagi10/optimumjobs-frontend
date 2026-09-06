// src/hooks/useLogout.ts

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    queryClient.clear();
    queryClient.resetQueries();
    queryClient.removeQueries();
    
    localStorage.clear();
    sessionStorage.clear();
    
    logout();
    
    toast.success('Deconnexion reussie');
    navigate('/login', { replace: true });
  };

  return { handleLogout };
};
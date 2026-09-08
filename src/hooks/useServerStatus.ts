// src/hooks/useServerStatus.ts

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const useServerStatus = () => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        setIsServerOnline(true);
        return true;
      }
      return false;
    } catch (error) {
      setIsServerOnline(false);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkServerStatus().then((isOnline) => {
        if (!isOnline && isServerOnline) {
          console.warn('Serveur inaccessible');
          
          toast.error('Connexion au serveur perdue. Veuillez vous reconnecter.');
          
          queryClient.clear();
          queryClient.resetQueries();
          
          logout();
          
          setTimeout(() => {
            window.location.href = '/login?session=expired';
          }, 2000);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isServerOnline, logout, queryClient]);

  return { isServerOnline, checkServerStatus };
};
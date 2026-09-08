// src/hooks/useHeartbeat.ts

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const useHeartbeat = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const heartbeatRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConnection = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok && response.status === 401) {
        throw new Error('Session expiree');
      }

      if (!response.ok) {
        throw new Error('Serveur inaccessible');
      }

    } catch (error: any) {
      if (error.name === 'AbortError' || 
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_NETWORK')) {
        
        console.warn('Heartbeat: Serveur inaccessible');
        
        toast.error('Connexion au serveur perdue. Redéconnexion...');
        
        queryClient.clear();
        queryClient.resetQueries();
        
        logout();
        
        setTimeout(() => {
          window.location.href = '/login?session=expired';
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      heartbeatRef.current = setInterval(checkConnection, 60000);
      checkConnection();
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return { checkConnection };
};
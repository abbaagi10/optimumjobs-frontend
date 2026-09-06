// src/components/NetworkErrorHandler.tsx


import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const NetworkErrorHandler = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOffline = () => {
      toast.error('Vous etes hors ligne. Verifiez votre connexion internet.');
    };

    const handleOnline = () => {
      toast.success('Connexion retablie.');
    };

    const handleBeforeUnload = () => {
      queryClient.clear();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logout, queryClient]);

  return null;
};
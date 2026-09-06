// src/store/authStore.ts


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  setLoading: (status: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        set({ user });
      },
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      setLoading: (status) => set({ isLoading: status }),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      checkAuth: () => {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            const currentState = get();
            if (!currentState.isAuthenticated || !currentState.user) {
              set({ user, isAuthenticated: true, isLoading: false });
            }
            return true;
          } catch {
            set({ isLoading: false });
            return false;
          }
        } else {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
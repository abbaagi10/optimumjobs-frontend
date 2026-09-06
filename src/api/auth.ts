// src/api/auth.ts
// C:\optimumjobs-frontend\src\api\auth.ts

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authApi = {
  register: (data: RegisterCredentials): Promise<AxiosResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/auth/register/', data),

  login: (data: LoginCredentials): Promise<AxiosResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/auth/login/', data),

  refresh: (refresh: string): Promise<AxiosResponse<{ access: string }>> =>
    apiClient.post<{ access: string }>('/auth/refresh/', { refresh }),

  getMe: (): Promise<AxiosResponse<User>> =>
    apiClient.get<User>('/auth/me/'),
};
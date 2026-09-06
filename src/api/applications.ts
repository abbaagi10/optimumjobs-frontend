// src/api/applications.ts
import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { Application, ApplicationStatus, PaginatedResponse } from '../types';

export const applicationsApi = {
  // ✅ CORRIGÉ : Plus de /api/v1/ en double
  getMyApplications: (params?: { page?: number; page_size?: number }): Promise<AxiosResponse<PaginatedResponse<Application>>> => {
    console.log('🔵 [API] getMyApplications appelée avec params:', params || 'aucun paramètre');
    // ⚠️ IMPORTANT: Utiliser '/applications/' pas '/api/v1/applications/'
    return apiClient.get<PaginatedResponse<Application>>('/applications/', { params });
  },

  getDetail: (id: number): Promise<AxiosResponse<Application>> => {
    console.log(`🔵 [API] getDetail appelée pour l'ID: ${id}`);
    return apiClient.get<Application>(`/applications/${id}/`);
  },

  updateStatus: (id: number, status: ApplicationStatus): Promise<AxiosResponse<Application>> => {
    console.log(`🔵 [API] updateStatus appelée pour l'ID: ${id}, status: ${status}`);
    return apiClient.patch<Application>(`/applications/${id}/status/`, { status });
  },

  withdraw: (id: number): Promise<AxiosResponse<void>> => {
    console.log(`🔵 [API] withdraw appelée pour l'ID: ${id}`);
    return apiClient.post<void>(`/applications/${id}/withdraw/`);
  },

  apply: (opportunityId: number, data?: { cover_note?: string }): Promise<AxiosResponse<Application>> => {
    console.log(`🔵 [API] apply appelée pour l'opportunité: ${opportunityId}`, data);
    return apiClient.post<Application>(`/opportunities/${opportunityId}/apply/`, data || {});
  },
};
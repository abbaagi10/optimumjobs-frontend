// src/api/jobs.ts
import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { JobPosting, PaginatedResponse } from '../types';

export const jobsApi = {
  // ✅ CORRIGÉ : Plus de /api/v1/ en double
  getList: (params?: { 
    search?: string; 
    location?: string; 
    organization?: number;
    page?: number;
    page_size?: number;
  }): Promise<AxiosResponse<PaginatedResponse<JobPosting>>> => {
    console.log('🔵 [API jobs] getList appelée avec params:', params || 'aucun paramètre');
    // ⚠️ IMPORTANT: Utiliser '/opportunities/' pas '/api/v1/opportunities/'
    return apiClient.get<PaginatedResponse<JobPosting>>('/opportunities/', { params });
  },

  getById: (id: number): Promise<AxiosResponse<JobPosting>> => {
    console.log(`🔵 [API jobs] getById appelée pour l'ID: ${id}`);
    return apiClient.get<JobPosting>(`/opportunities/${id}/`);
  },

  create: (data: Partial<JobPosting>): Promise<AxiosResponse<JobPosting>> => {
    const orgId = data.organization;
    console.log(`🔵 [API jobs] create appelée pour l'organisation: ${orgId}`);
    return apiClient.post<JobPosting>(`/organizations/${orgId}/opportunities/`, data);
  },

  update: (id: number, data: Partial<JobPosting>): Promise<AxiosResponse<JobPosting>> => {
    console.log(`🔵 [API jobs] update appelée pour l'ID: ${id}`);
    return apiClient.patch<JobPosting>(`/opportunities/manage/${id}/`, data);
  },

  delete: (id: number): Promise<AxiosResponse<void>> => {
    console.log(`🔵 [API jobs] delete appelée pour l'ID: ${id}`);
    return apiClient.delete<void>(`/opportunities/manage/${id}/`);
  },

  publish: (id: number): Promise<AxiosResponse<JobPosting>> => {
    console.log(`🔵 [API jobs] publish appelée pour l'ID: ${id}`);
    return apiClient.post<JobPosting>(`/opportunities/manage/${id}/publish/`);
  },

  close: (id: number): Promise<AxiosResponse<JobPosting>> => {
    console.log(`🔵 [API jobs] close appelée pour l'ID: ${id}`);
    return apiClient.post<JobPosting>(`/opportunities/manage/${id}/close/`);
  },

  submitForReview: (id: number): Promise<AxiosResponse<JobPosting>> => {
    console.log(`🔵 [API jobs] submitForReview appelée pour l'ID: ${id}`);
    return apiClient.post<JobPosting>(`/opportunities/manage/${id}/submit/`);
  },
};
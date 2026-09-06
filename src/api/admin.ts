// src/api/admin.ts
// C:\optimumjobs-frontend\src\api\admin.ts

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { 
  AdminDashboardStats, 
  User, 
  Organization, 
  Opportunity, 
  PaginatedResponse,
  Application,
  AdminOpportunityFilters
} from '../types';

export const adminApi = {
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  getDashboardStats: (): Promise<AxiosResponse<AdminDashboardStats>> =>
    apiClient.get<AdminDashboardStats>('/admin/dashboard/'),

  // ==========================================================
  // UTILISATEURS
  // ==========================================================

  getUsers: (params?: { search?: string; role?: string; is_active?: boolean }): Promise<AxiosResponse<PaginatedResponse<User>>> =>
    apiClient.get<PaginatedResponse<User>>('/admin/users/', { params }),

  toggleUserActive: (id: number, is_active: boolean): Promise<AxiosResponse<User>> =>
    apiClient.patch<User>(`/admin/users/${id}/`, { is_active }),

  // ==========================================================
  // ORGANISATIONS
  // ==========================================================

  getOrganizations: (params?: { search?: string; is_verified?: boolean }): Promise<AxiosResponse<PaginatedResponse<Organization>>> =>
    apiClient.get<PaginatedResponse<Organization>>('/admin/organizations/', { params }),

  verifyOrganization: (id: number): Promise<AxiosResponse<Organization>> =>
    apiClient.post<Organization>(`/admin/organizations/${id}/verify/`),

  // ==========================================================
  // OPPORTUNITÉS - ADMIN
  // ==========================================================

  /**
   * ✅ Récupère les offres en attente de modération (pending_review)
   * Utilise l'endpoint /opportunities/manage/ pour avoir tous les champs
   */
  getPendingOpportunities: (): Promise<AxiosResponse<PaginatedResponse<Opportunity>>> => {
    console.log('🔵 [API Admin] Récupération des offres en attente');
    // ✅ Utiliser /opportunities/manage/ pour avoir le status
    // Mais il faut passer par l'organisation ou admin
    return apiClient.get<PaginatedResponse<Opportunity>>('/opportunities/', { 
      params: { status: 'pending_review', page_size: 50 }
    });
  },

  /**
   * ✅ Récupère toutes les offres avec filtres
   * Utilise l'endpoint /opportunities/ avec filtre
   */
  getAllOpportunities: (params?: AdminOpportunityFilters): Promise<AxiosResponse<PaginatedResponse<Opportunity>>> => {
    console.log('🔵 [API Admin] Récupération de toutes les offres', params);
    const queryParams: any = { page_size: 50 };
    if (params?.status && params.status !== 'all') queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.organization) queryParams.organization = params.organization;
    if (params?.date_from) queryParams.date_from = params.date_from;
    if (params?.date_to) queryParams.date_to = params.date_to;
    return apiClient.get<PaginatedResponse<Opportunity>>('/opportunities/', { params: queryParams });
  },

  /**
   * ✅ Récupère les détails d'une opportunité pour l'admin
   * Utilise l'endpoint /opportunities/manage/ pour avoir tous les champs
   */
  getAdminOpportunityDetail: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API Admin] Get admin opportunity detail ${id}`);
    // ✅ Utiliser /manage/ pour avoir tous les champs (status, rejection_reason, etc.)
    return apiClient.get<Opportunity>(`/opportunities/manage/${id}/`);
  },

  /**
   * Récupère les candidatures pour une opportunité (admin)
   */
  getOpportunityApplications: (id: number): Promise<AxiosResponse<PaginatedResponse<Application>>> => {
    console.log(`🔵 [API Admin] Get applications for opportunity ${id}`);
    return apiClient.get<PaginatedResponse<Application>>(`/opportunities/${id}/applications/`);
  },

  /**
   * ✅ Approuve ou rejette une opportunité
   * Endpoint: /opportunities/manage/{id}/review/
   */
  reviewOpportunity: (id: number, action: 'approve' | 'reject', rejection_reason?: string): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API Admin] Review opportunity ${id}: ${action}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/review/`, { action, rejection_reason });
  },

  /**
   * ✅ Publie une opportunité (approved → published)
   * Endpoint: /opportunities/manage/{id}/publish/
   */
  publishOpportunity: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API Admin] Publish opportunity ${id}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/publish/`);
  },

  /**
   * ✅ Clôture une opportunité
   * Endpoint: /opportunities/manage/{id}/close/
   */
  closeOpportunity: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API Admin] Close opportunity ${id}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/close/`);
  },

  /**
   * ✅ Archive une opportunité
   * Endpoint: /opportunities/manage/{id}/archive/
   */
  archiveOpportunity: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API Admin] Archive opportunity ${id}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/archive/`);
  },
};
// src/api/organization.ts
// C:\optimumjobs-frontend\src\api\organization.ts

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { Organization, OrgMember, Opportunity, PaginatedResponse } from '../types';

export const organizationApi = {
  // ==========================================================
  // ORGANISATIONS
  // ==========================================================

  getMyOrganizations: (): Promise<AxiosResponse<Organization[]>> =>
    apiClient.get<Organization[]>('/organizations/'),

  create: (data: Partial<Organization>): Promise<AxiosResponse<Organization>> =>
    apiClient.post<Organization>('/organizations/', data),

  getDetail: (id: number): Promise<AxiosResponse<Organization>> =>
    apiClient.get<Organization>(`/organizations/${id}/`),

  update: (id: number, data: Partial<Organization>): Promise<AxiosResponse<Organization>> =>
    apiClient.patch<Organization>(`/organizations/${id}/`, data),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete<void>(`/organizations/${id}/`),

  // ==========================================================
  // MEMBRES
  // ==========================================================

  getMembers: (orgId: number): Promise<AxiosResponse<OrgMember[]>> =>
    apiClient.get<OrgMember[]>(`/organizations/${orgId}/members/`),

  addMember: (orgId: number, data: { email: string; role: string }): Promise<AxiosResponse<OrgMember>> =>
    apiClient.post<OrgMember>(`/organizations/${orgId}/members/`, data),

  // ==========================================================
  // OPPORTUNITÉS
  // ==========================================================

  getOpportunities: (orgId: number): Promise<AxiosResponse<Opportunity[]>> =>
    apiClient.get<Opportunity[]>(`/organizations/${orgId}/opportunities/`),

  createOpportunity: (orgId: number, data: any): Promise<AxiosResponse<Opportunity>> =>
    apiClient.post<Opportunity>(`/organizations/${orgId}/opportunities/`, data),

  // ✅ AJOUTÉ: Soumettre pour révision (DRAFT → PENDING_REVIEW)
  submitForReview: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API] Submit opportunity ${id} for review`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/submit/`);
  },

  // ✅ AJOUTÉ: Publier une offre (APPROVED → PUBLISHED)
  publishOpportunity: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API] Publish opportunity ${id}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/publish/`);
  },

  // ✅ AJOUTÉ: Clôturer une offre (PUBLISHED → CLOSED)
  closeOpportunity: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API] Close opportunity ${id}`);
    return apiClient.post<Opportunity>(`/opportunities/manage/${id}/close/`);
  },

  // ✅ AJOUTÉ: Récupérer les détails d'une offre (pour modification)
  getOpportunityDetail: (id: number): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API] Get opportunity detail ${id}`);
    return apiClient.get<Opportunity>(`/opportunities/manage/${id}/`);
  },

  // ✅ AJOUTÉ: Mettre à jour une offre (DRAFT ou REJECTED)
  updateOpportunity: (id: number, data: Partial<Opportunity>): Promise<AxiosResponse<Opportunity>> => {
    console.log(`🔵 [API] Update opportunity ${id}`);
    return apiClient.patch<Opportunity>(`/opportunities/manage/${id}/`, data);
  },
};
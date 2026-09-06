// src/api/profile.ts
// C:\optimumjobs-frontend\src\api\profile.ts

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { CandidateProfile, Experience, Education, Language } from '../types';

export const profileApi = {
  getProfile: (): Promise<AxiosResponse<CandidateProfile>> =>
    apiClient.get<CandidateProfile>('/profile/'),

  updateProfile: (data: Partial<CandidateProfile>): Promise<AxiosResponse<CandidateProfile>> =>
    apiClient.patch<CandidateProfile>('/profile/', data),

  getExperiences: (): Promise<AxiosResponse<Experience[]>> =>
    apiClient.get<Experience[]>('/profile/experiences/'),

  addExperience: async (data: Omit<Experience, 'id'>): Promise<AxiosResponse<Experience>> => {
    console.log('🔵 [addExperience] Données à envoyer:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.post<Experience>('/profile/experiences/', data);
      console.log('🟢 [addExperience] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [addExperience] Erreur détaillée:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  updateExperience: async (id: number, data: Partial<Experience>): Promise<AxiosResponse<Experience>> => {
    console.log('🔵 [updateExperience] ID:', id, 'Données:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.patch<Experience>(`/profile/experiences/${id}/`, data);
      console.log('🟢 [updateExperience] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [updateExperience] Erreur:', error.response?.data);
      throw error;
    }
  },

  deleteExperience: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete<void>(`/profile/experiences/${id}/`),

  getEducation: (): Promise<AxiosResponse<Education[]>> =>
    apiClient.get<Education[]>('/profile/education/'),

  addEducation: async (data: Omit<Education, 'id'>): Promise<AxiosResponse<Education>> => {
    console.log('🔵 [addEducation] Données à envoyer:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.post<Education>('/profile/education/', data);
      console.log('🟢 [addEducation] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [addEducation] Erreur détaillée:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  updateEducation: async (id: number, data: Partial<Education>): Promise<AxiosResponse<Education>> => {
    console.log('🔵 [updateEducation] ID:', id, 'Données:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.patch<Education>(`/profile/education/${id}/`, data);
      console.log('🟢 [updateEducation] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [updateEducation] Erreur:', error.response?.data);
      throw error;
    }
  },

  deleteEducation: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete<void>(`/profile/education/${id}/`),

  getLanguages: (): Promise<AxiosResponse<Language[]>> =>
    apiClient.get<Language[]>('/profile/languages/'),

  addLanguage: async (data: Omit<Language, 'id'>): Promise<AxiosResponse<Language>> => {
    console.log('🔵 [addLanguage] Données à envoyer:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.post<Language>('/profile/languages/', data);
      console.log('🟢 [addLanguage] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [addLanguage] Erreur détaillée:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  updateLanguage: async (id: number, data: Partial<Language>): Promise<AxiosResponse<Language>> => {
    console.log('🔵 [updateLanguage] ID:', id, 'Données:', JSON.stringify(data, null, 2));
    
    try {
      const response = await apiClient.patch<Language>(`/profile/languages/${id}/`, data);
      console.log('🟢 [updateLanguage] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [updateLanguage] Erreur:', error.response?.data);
      throw error;
    }
  },

  deleteLanguage: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete<void>(`/profile/languages/${id}/`),
};
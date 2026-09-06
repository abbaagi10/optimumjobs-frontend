// src/api/documents.ts
// C:\optimumjobs-frontend\src\api\documents.ts

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import { UserDocument, DocumentType } from '../types';

export const documentsApi = {
  getList: (): Promise<AxiosResponse<UserDocument[]>> =>
    apiClient.get<UserDocument[]>('/documents/'),

  upload: async (file: File, documentType: DocumentType): Promise<AxiosResponse<UserDocument>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    console.log('🔵 [upload] Document type:', documentType, 'File:', file.name);

    try {
      const response = await apiClient.post<UserDocument>('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('🟢 [upload] Succès:', response.data);
      return response;
    } catch (error: any) {
      console.error('🔴 [upload] Erreur:', error.response?.data);
      throw error;
    }
  },

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete<void>(`/documents/${id}/`),

  getDownloadUrl: (id: number): string =>
    `${apiClient.defaults.baseURL}/documents/${id}/download/`,
};
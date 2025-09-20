import axios from 'axios';
import { ApiResponse, File, UploadResponse } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFiles = async (files: FileList, tags: string[]): Promise<UploadResponse[]> => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  formData.set('tags', tags.join(','));
  const response = await api.post<ApiResponse<UploadResponse[]>>('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to upload files');
  }
  return response.data.data || [];
};

export const getFiles = async (params?: {
  sortBy?: string;
  order?: string;
  tag?: string;
}): Promise<File[]> => {
  const response = await api.get<ApiResponse<File[]>>('/files', { params });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch files');
  }
  return response.data.data || [];
};

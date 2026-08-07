import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post<ApiResponse>('/auth/login', { email, password });
    return {
      token: response.data.token!,
      user: response.data.user!,
    };
  },

  register: async (name: string, email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/register', { name, email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse>('/auth/profile');
    return response.data.user!;
  },

  updateProfile: async (formData: FormData): Promise<User> => {
    const response = await api.put<ApiResponse>('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.user!;
  },

  uploadResume: async (file: File): Promise<{ resumeUrl: string }> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.put<ApiResponse>('/auth/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { resumeUrl: (response.data as any).resume };
  },
};

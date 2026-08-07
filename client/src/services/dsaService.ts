import { api } from './api';
import { ApiResponse, DsaStats, DsaTopic } from '../types';

export interface AddTopicPayload {
  topic: string;
  category: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export const dsaService = {
  getTopics: async (filters?: { category?: string; difficulty?: string; completed?: boolean }): Promise<DsaTopic[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));

    const response = await api.get<ApiResponse<DsaTopic[]>>(`/dsa/topics?${params.toString()}`);
    return response.data.data || [];
  },

  addTopic: async (payload: AddTopicPayload): Promise<DsaTopic> => {
    const response = await api.post<ApiResponse<DsaTopic>>('/dsa/add-topic', payload);
    return response.data.data!;
  },

  completeTopic: async (id: string): Promise<DsaTopic> => {
    const response = await api.patch<ApiResponse<DsaTopic>>(`/dsa/complete/${id}`);
    return response.data.data!;
  },

  getStats: async (): Promise<DsaStats> => {
    const response = await api.get<ApiResponse<{ stats: DsaStats }>>('/dsa/stats');
    return (response.data as any).stats;
  },
};

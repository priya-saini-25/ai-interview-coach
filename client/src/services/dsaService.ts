import { api } from './api';
import { ApiResponse, DsaStats, DsaTopic, DsaProblem, DsaRecommendationResponse, DsaAnalyticsData } from '../types';

export interface AddTopicPayload {
  topic: string;
  category: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export const dsaService = {
  getRecommendations: async (filters?: {
    role?: string;
    company?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
  }): Promise<DsaRecommendationResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.company) params.append('company', filters.company);
    if (filters?.topic) params.append('topic', filters.topic);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get<ApiResponse<DsaRecommendationResponse>>(`/dsa/recommendations?${params.toString()}`);
    return response.data.data!;
  },

  getProblemById: async (id: string): Promise<DsaProblem> => {
    const response = await api.get<ApiResponse<DsaProblem>>(`/dsa/problems/${id}`);
    return response.data.data!;
  },

  solveProblem: async (id: string): Promise<DsaTopic> => {
    const response = await api.post<ApiResponse<DsaTopic>>(`/dsa/solve/${id}`);
    return response.data.data!;
  },

  toggleRevision: async (id: string, savedForRevision?: boolean): Promise<DsaTopic> => {
    const response = await api.patch<ApiResponse<DsaTopic>>(`/dsa/revision/${id}`, { savedForRevision });
    return response.data.data!;
  },

  updateStatus: async (id: string, status: 'Not Started' | 'In Progress' | 'Solved'): Promise<DsaTopic> => {
    const response = await api.patch<ApiResponse<DsaTopic>>(`/dsa/progress/${id}`, { status });
    return response.data.data!;
  },

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

  getAnalytics: async (): Promise<DsaAnalyticsData> => {
    const response = await api.get<ApiResponse<DsaAnalyticsData>>('/dsa/analytics');
    return response.data.data!;
  },

  connectPlatforms: async (handles: { leetcode?: string; codeforces?: string; codechef?: string; hackerrank?: string }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/dsa/platforms/connect', handles);
    return response.data.data;
  },

  syncPlatforms: async (): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/dsa/platforms/sync');
    return response.data;
  },

  getPlatforms: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/dsa/platforms');
    return response.data.data;
  },

  getAiAnalysis: async (): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/dsa/ai-analysis');
    return response.data.data;
  },

  generateRoadmap: async (force: boolean = false): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/dsa/roadmap/generate${force ? '?force=true' : ''}`);
    return response.data.data;
  },

  getRoadmap: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/dsa/roadmap');
    return response.data.data;
  },

  updateRoadmapProblem: async (problemId: string, completed: boolean = true): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/dsa/roadmap/problem/${problemId}`, { completed });
    return response.data.data;
  },

  getTodayRevision: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/dsa/revision/today');
    return response.data.data;
  },

  reviewRevision: async (problemId: string, result: 'success' | 'failure' | 'skipped', difficultyRating?: number): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/dsa/revision/${problemId}/review`, { result, difficultyRating });
    return response.data.data;
  },

  getRevisionStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/dsa/revision/stats');
    return response.data.data;
  },

  getUpcomingRevision: async (days: number = 30): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/dsa/revision/upcoming?days=${days}`);
    return response.data.data;
  },
};


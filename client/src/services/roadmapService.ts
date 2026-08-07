import { api } from './api';
import { ApiResponse, RoadmapResponse } from '../types';

export interface GenerateRoadmapPayload {
  targetRole: string;
  targetCompany: string;
  currentYear: string;
  currentSkills: string[];
  targetPackage: string;
}

export const roadmapService = {
  getRoadmap: async (): Promise<RoadmapResponse | null> => {
    const response = await api.get<ApiResponse>('/roadmap');
    const roadmapData = (response.data as any).roadmap;
    if (!roadmapData) return null;
    const rawRoadmap = typeof roadmapData === 'string'
      ? roadmapData
      : roadmapData.roadmap;
    return { roadmap: rawRoadmap };
  },

  generateRoadmap: async (payload: GenerateRoadmapPayload): Promise<RoadmapResponse> => {
    const response = await api.post<ApiResponse>('/roadmap/generate', payload);
    const roadmapData = (response.data as any).roadmap;
    const rawRoadmap = typeof roadmapData === 'string'
      ? roadmapData
      : roadmapData.roadmap;
    return { roadmap: rawRoadmap };
  },
};

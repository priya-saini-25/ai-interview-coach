import { api } from './api';
import { ApiResponse, RoadmapResponse } from '../types';

export interface GenerateRoadmapPayload {
  targetRole: string;
  targetCompany: string;
  currentYear: string;
  currentSkills: string[];
  targetPackage: string;
}

export interface SaveRoadmapPayload {
  targetRole?: string;
  targetCompany?: string;
  currentYear?: string;
  currentSkills?: string[];
  targetPackage?: string;
  roadmap: string;
}

export const roadmapService = {
  getRoadmap: async (): Promise<RoadmapResponse | null> => {
    const response = await api.get<ApiResponse>('/roadmap');
    const data = response.data as any;
    if (!data || (!data.roadmap && !data.data)) return null;
    const rawRoadmap = typeof data.roadmap === 'string'
      ? data.roadmap
      : data.roadmap?.roadmap || '';
    return {
      roadmap: rawRoadmap,
      targetRole: data.targetRole,
      targetCompany: data.targetCompany,
      currentYear: data.currentYear,
      currentSkills: data.currentSkills,
      targetPackage: data.targetPackage,
      updatedAt: data.updatedAt,
    };
  },

  generateRoadmap: async (payload: GenerateRoadmapPayload): Promise<RoadmapResponse> => {
    const response = await api.post<ApiResponse>('/roadmap/generate', payload);
    const data = response.data as any;
    const rawRoadmap = typeof data.roadmap === 'string'
      ? data.roadmap
      : data.roadmap?.roadmap || '';
    return {
      roadmap: rawRoadmap,
      targetRole: payload.targetRole,
      targetCompany: payload.targetCompany,
      currentYear: payload.currentYear,
      currentSkills: payload.currentSkills,
      targetPackage: payload.targetPackage,
    };
  },

  saveRoadmap: async (payload: SaveRoadmapPayload): Promise<RoadmapResponse> => {
    const response = await api.post<ApiResponse>('/roadmap/save', payload);
    const data = response.data as any;
    const rawRoadmap = typeof data.roadmap === 'string'
      ? data.roadmap
      : data.roadmap?.roadmap || payload.roadmap;
    return {
      roadmap: rawRoadmap,
      targetRole: data.targetRole,
      targetCompany: data.targetCompany,
      currentYear: data.currentYear,
      currentSkills: data.currentSkills,
      targetPackage: data.targetPackage,
      updatedAt: data.updatedAt,
    };
  },
};

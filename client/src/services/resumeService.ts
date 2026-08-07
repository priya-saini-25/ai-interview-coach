import { api } from './api';
import { ApiResponse, ResumeAnalysis } from '../types';

export const resumeService = {
  getResumeAnalysis: async (): Promise<ResumeAnalysis | null> => {
    const response = await api.get<ApiResponse<{ analysis: ResumeAnalysis | null }>>('/ai/resume-analysis');
    return (response.data as any).analysis || null;
  },

  analyzeResume: async (): Promise<ResumeAnalysis> => {
    const response = await api.post<ApiResponse<{ analysis: ResumeAnalysis }>>('/ai/analyze-resume');
    return (response.data as any).analysis;
  },
};

import { api } from './api';
import { ApiResponse, InterviewSession } from '../types';

export interface StartInterviewPayload {
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
}

export const interviewService = {
  startInterview: async (payload: StartInterviewPayload): Promise<{ sessionId: string; questions: string[] }> => {
    const response = await api.post<ApiResponse>('/interview/start', payload);
    return {
      sessionId: (response.data as any).sessionId,
      questions: (response.data as any).questions,
    };
  },

  submitInterview: async (sessionId: string, answers: string[]): Promise<{ score: number; feedback: string[] }> => {
    const response = await api.post<ApiResponse>(`/interview/submit/${sessionId}`, { answers });
    return {
      score: (response.data as any).score,
      feedback: (response.data as any).feedback,
    };
  },

  getHistory: async (): Promise<InterviewSession[]> => {
    const response = await api.get<ApiResponse<InterviewSession[]>>('/interview/history');
    return response.data.data || [];
  },
};

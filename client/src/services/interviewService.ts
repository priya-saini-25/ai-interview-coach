import { api } from './api';
import { ApiResponse, InterviewSession, QuestionItem, SectionScores, DetailedAnalysis } from '../types';

export interface StartInterviewPayload {
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
}

export interface SubmitInterviewResponse {
  score: number;
  sectionScores?: SectionScores;
  feedback: string[];
  detailedAnalysis?: DetailedAnalysis;
}

export const interviewService = {
  startInterview: async (payload: StartInterviewPayload): Promise<{ sessionId: string; questions: (string | QuestionItem)[] }> => {
    const response = await api.post<ApiResponse>('/interview/start', payload);
    return {
      sessionId: (response.data as any).sessionId,
      questions: (response.data as any).questions || [],
    };
  },

  submitInterview: async (sessionId: string, answers: string[]): Promise<SubmitInterviewResponse> => {
    const response = await api.post<ApiResponse>(`/interview/submit/${sessionId}`, { answers });
    const data = response.data as any;
    return {
      score: data.score,
      sectionScores: data.sectionScores,
      feedback: data.feedback || [],
      detailedAnalysis: data.detailedAnalysis,
    };
  },

  getHistory: async (): Promise<InterviewSession[]> => {
    const response = await api.get<ApiResponse<InterviewSession[]>>('/interview/history');
    return response.data.data || [];
  },
};

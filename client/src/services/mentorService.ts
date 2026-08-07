import { api } from './api';
import { ApiResponse, MentorMessage, MentorChatResponse } from '../types';

export const mentorService = {
  sendMessage: async (message: string): Promise<MentorChatResponse> => {
    const response = await api.post<ApiResponse<MentorChatResponse>>('/mentor/chat', { message });
    return {
      reply: response.data.reply || '',
      messages: response.data.messages || [],
    };
  },

  getHistory: async (): Promise<MentorMessage[]> => {
    const response = await api.get<ApiResponse<MentorMessage[]>>('/mentor/history');
    return response.data.data || [];
  },

  clearHistory: async (): Promise<void> => {
    await api.delete('/mentor/history');
  },
};

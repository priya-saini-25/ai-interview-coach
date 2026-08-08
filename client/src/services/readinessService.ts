import { api } from './api';
import { ApiResponse, ReadinessScoreData } from '../types';

export const readinessService = {
  getScore: async (): Promise<ReadinessScoreData> => {
    const response = await api.get<ApiResponse<ReadinessScoreData>>('/readiness');
    return response.data.data!;
  },
};

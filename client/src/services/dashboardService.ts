import { api } from './api';
import { ApiResponse, DashboardSummary } from '../types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard');
    return response.data.data!;
  },
};

import { api } from './api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data.data || [];
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const response = await api.patch<ApiResponse<NotificationItem>>(`/notifications/read/${id}`);
    return response.data.data!;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

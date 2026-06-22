import { ApiResponse } from '@/types';
import {api} from '@/services/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getAll: async (skip = 0, take = 50): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get(`/Notifications?skip=${skip}&take=${take}`);
    return response.data;
  },
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get('/Notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<object>> => {
    const response = await api.post(`/Notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<object>> => {
    const response = await api.post('/Notifications/read-all');
    return response.data;
  },
};
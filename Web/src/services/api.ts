import axios from 'axios';
import {
  User,
  CalendarThing,
  CalendarEvent,
  EventComment,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  AuthResponse,
  UserRole
} from '@/types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (data && typeof data === 'object' && 'success' in data) {
        return Promise.reject(data);
      }
      return Promise.reject({
        success: false,
        message: data?.message || `Ошибка ${status}`,
        error: data,
        timestamp: new Date().toISOString(),
      });
    }
    return Promise.reject({
      success: false,
      message: error.message || 'Ошибка соединения с сервером',
      error: error,
      timestamp: new Date().toISOString(),
    });
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/Auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<AuthResponse>;
    }
  },

  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/Auth/register', data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<AuthResponse>;
    }
  },

  logout: async (refreshToken: string): Promise<ApiResponse<object>> => {
    try {
      const response = await api.post('/Auth/logout', { refreshToken });
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<object>;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/Auth/me');
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<User>;
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/Auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<AuthResponse>;
    }
  },
};

export const calendarService = {
  getAll: async (): Promise<ApiResponse<CalendarThing[]>> => {
    try {
      const response = await api.get('/Calendars');
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing[]>;
    }
  },

  getById: async (id: string): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.get(`/Calendars/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  create: async (data: Omit<CalendarThing, 'id' | 'createdAt' | 'createdBy' | 'members' | 'managers' | 'isArchived'>): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.post('/Calendars', data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  update: async (id: string, data: Partial<CalendarThing>): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.put(`/Calendars/${id}`, data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    try {
      const response = await api.delete(`/Calendars/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<object>;
    }
  },

  addMember: async (calendarId: string, userId: string): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.post(`/Calendars/${calendarId}/members/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  removeMember: async (calendarId: string, userId: string): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.delete(`/Calendars/${calendarId}/members/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  addManager: async (calendarId: string, userId: string): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.post(`/Calendars/${calendarId}/managers/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },

  removeManager: async (calendarId: string, userId: string): Promise<ApiResponse<CalendarThing>> => {
    try {
      const response = await api.delete(`/Calendars/${calendarId}/managers/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarThing>;
    }
  },
};

export const eventService = {
  getAll: async (calendarId?: string): Promise<ApiResponse<CalendarEvent[]>> => {
    try {
      const url = calendarId ? `/Events?calendarId=${calendarId}` : '/Events';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent[]>;
    }
  },

  getById: async (id: string): Promise<ApiResponse<CalendarEvent>> => {
    try {
      const response = await api.get(`/Events/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent>;
    }
  },

  create: async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy' | 'status'>): Promise<ApiResponse<CalendarEvent>> => {
    try {
      const response = await api.post('/Events', data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent>;
    }
  },

  update: async (id: string, data: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> => {
    try {
      const response = await api.put(`/Events/${id}`, data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent>;
    }
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    try {
      const response = await api.delete(`/Events/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<object>;
    }
  },

  addParticipant: async (eventId: string, userId: string): Promise<ApiResponse<CalendarEvent>> => {
    try {
      const response = await api.post(`/Events/${eventId}/participants/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent>;
    }
  },

  removeParticipant: async (eventId: string, userId: string): Promise<ApiResponse<CalendarEvent>> => {
    try {
      const response = await api.delete(`/Events/${eventId}/participants/${userId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<CalendarEvent>;
    }
  },
};

export const commentService = {
  getByEvent: async (eventId: string): Promise<ApiResponse<EventComment[]>> => {
    try {
      const response = await api.get(`/Comments/event/${eventId}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<EventComment[]>;
    }
  },

  create: async (data: { eventId: string; content: string }): Promise<ApiResponse<EventComment>> => {
    try {
      const response = await api.post('/Comments', data);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<EventComment>;
    }
  },

  update: async (id: string, content: string): Promise<ApiResponse<EventComment>> => {
    try {
      const response = await api.put(`/Comments/${id}`, { content });
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<EventComment>;
    }
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    try {
      const response = await api.delete(`/Comments/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<object>;
    }
  },
};

export const userService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get('/Users');
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<User[]>;
    }
  },

  updateRole: async (id: string, role: UserRole): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put(`/Users/${id}/role`, { role });
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<User>;
    }
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    try {
      const response = await api.delete(`/Users/${id}`);
      return response.data;
    } catch (error: any) {
      return error as ApiResponse<object>;
    }
  },
};
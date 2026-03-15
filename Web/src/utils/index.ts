import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, CalendarThing, CalendarEvent } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

export const checkPermission = (
  user: User | null,
  requiredRole: string[]
): boolean => {
  if (!user) return false;
  return requiredRole.includes(user.role);
};

export const hasCalendarAccess = (
  user: User | null,
  calendar: CalendarThing,
  accessLevel: 'view' | 'edit' | 'manage'
): boolean => {
  if (!user) return false;

  if (user.role === 'ADMIN') return true;

  if (!calendar.members.includes(user.id)) {
    return false;
  }

  if (accessLevel === 'view' || calendar.isPublic) {
    return true;
  }

  if (accessLevel === 'edit') {
    return user.role === 'MANAGER' || calendar.managers.includes(user.id);
  }

  if (accessLevel === 'manage') {
    return user.role === 'MANAGER' || calendar.managers.includes(user.id);
  }

  return false;
};

export const hasEventAccess = (
  user: User | null,
  event: CalendarEvent,
  calendars: CalendarThing[],
  accessLevel: 'view' | 'edit' | 'comment'
): boolean => {
  if (!user) return false;
  
  if (user.role === 'ADMIN') return true;
  
  const calendar = calendars.find(c => c.id === event.calendarId);
  if (!calendar) return false;
  
  if (!calendar.members.includes(user.id) && !calendar.isPublic) {
    return false;
  }
  
  if (accessLevel === 'view') {
    return event.participants.includes(user.id) || 
           event.createdBy === user.id ||
           calendar.managers.includes(user.id);
  }
  
  if (accessLevel === 'edit') {
    return user.role === 'MANAGER' || 
           (calendar.managers.includes(user.id) || event.createdBy === user.id);
  }
  
  if (accessLevel === 'comment') {
    return calendar.members.includes(user.id);
  }
  
  return false;
};
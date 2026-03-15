import { create } from 'zustand';
import { User, CalendarThing, CalendarEvent, EventComment } from '@/types';
import { mockUsers, mockCalendars, mockEvents, mockComments } from '@/mocks/data';

interface AppStore {
  user: User | null;
  users: User[];
  calendars: CalendarThing[];
  events: CalendarEvent[];
  comments: EventComment[];
  selectedCalendar: CalendarThing | null;
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setCalendars: (calendars: CalendarThing[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setComments: (comments: EventComment[]) => void;
  setSelectedCalendar: (calendar: CalendarThing | null) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  initializeMockData: () => void;
  
  addCalendar: (calendar: CalendarThing) => void;
  updateCalendar: (id: string, updates: Partial<CalendarThing>) => void;
  deleteCalendar: (id: string) => void;
  addCalendarMember: (calendarId: string, userId: string) => void;
  removeCalendarMember: (calendarId: string, userId: string) => void;
  addCalendarManager: (calendarId: string, userId: string) => void;
  removeCalendarManager: (calendarId: string, userId: string) => void;
  
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addEventParticipant: (eventId: string, userId: string) => void;
  removeEventParticipant: (eventId: string, userId: string) => void;
  
  addComment: (comment: EventComment) => void;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  
  getUsersByRole: (role: string) => User[];
  getCalendarMembers: (calendarId: string) => User[];
  getEventComments: (eventId: string) => EventComment[];
  getUserCalendars: (userId: string) => CalendarThing[];
  getUserEvents: (userId: string) => CalendarEvent[];
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  users: [],
  calendars: [],
  events: [],
  comments: [],
  selectedCalendar: null,
  selectedEvent: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  setCalendars: (calendars) => set({ calendars }),
  setEvents: (events) => set({ events }),
  setComments: (comments) => set({ comments }),
  setSelectedCalendar: (calendar) => set({ selectedCalendar: calendar }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  initializeMockData: () => {
    set({
      users: mockUsers,
      calendars: mockCalendars,
      events: mockEvents,
      comments: mockComments,
    });
  },
  
  addCalendar: (calendar) =>
    set((state) => ({ calendars: [...state.calendars, calendar] })),
  
  updateCalendar: (id, updates) =>
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === id ? { ...calendar, ...updates } : calendar
      ),
    })),
  
  deleteCalendar: (id) =>
    set((state) => ({
      calendars: state.calendars.filter((calendar) => calendar.id !== id),
    })),
  
  addCalendarMember: (calendarId, userId) =>
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? { ...calendar, members: [...calendar.members, userId] }
          : calendar
      ),
    })),
  
  removeCalendarMember: (calendarId, userId) =>
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? { 
              ...calendar, 
              members: calendar.members.filter((id) => id !== userId),
              managers: calendar.managers.filter((id) => id !== userId)
            }
          : calendar
      ),
    })),
  
  addCalendarManager: (calendarId, userId) =>
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? { 
              ...calendar, 
              managers: [...calendar.managers, userId],
              members: calendar.members.includes(userId) 
                ? calendar.members 
                : [...calendar.members, userId]
            }
          : calendar
      ),
    })),
  
  removeCalendarManager: (calendarId, userId) =>
    set((state) => ({
      calendars: state.calendars.map((calendar) =>
        calendar.id === calendarId
          ? { ...calendar, managers: calendar.managers.filter((id) => id !== userId) }
          : calendar
      ),
    })),
  
  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),
  
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      ),
    })),
  
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
  
  addEventParticipant: (eventId, userId) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? { ...event, participants: [...event.participants, userId] }
          : event
      ),
    })),
  
  removeEventParticipant: (eventId, userId) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? { ...event, participants: event.participants.filter((id) => id !== userId) }
          : event
      ),
    })),
  
  addComment: (comment) =>
    set((state) => ({ comments: [...state.comments, comment] })),
  
  updateComment: (id, content) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === id 
          ? { ...comment, content, updatedAt: new Date().toISOString() }
          : comment
      ),
    })),
  
  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== id),
    })),
  
  getUsersByRole: (role) => {
    const state = get();
    return state.users.filter(user => user.role === role && user.isActive);
  },
  
  getCalendarMembers: (calendarId) => {
    const state = get();
    const calendar = state.calendars.find(c => c.id === calendarId);
    if (!calendar) return [];
    return state.users.filter(user => calendar.members.includes(user.id));
  },
  
  getEventComments: (eventId) => {
    const state = get();
    return state.comments
      .filter(comment => comment.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getUserCalendars: (userId) => {
    const state = get();
    const user = state.users.find(u => u.id === userId);
    if (!user) return [];
    
    if (user.role === 'ADMIN') {
      return state.calendars;
    }
    
    return state.calendars.filter(calendar => 
      calendar.members.includes(userId) || 
      calendar.isPublic
    );
  },
  
  getUserEvents: (userId) => {
    const state = get();
    const user = state.users.find(u => u.id === userId);
    if (!user) return [];
    
    if (user.role === 'ADMIN') {
      return state.events;
    }
    
    return state.events.filter(event => 
      event.participants.includes(userId) ||
      event.createdBy === userId ||
      (user.role === 'MANAGER' && 
       state.calendars.some(c => 
         c.id === event.calendarId && c.managers.includes(userId)
       ))
    );
  },
}));
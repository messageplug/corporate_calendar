import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, calendarService } from '@/services/api';
import { formatDateTime } from '@/utils';
import { toast } from 'react-hot-toast';
import { CalendarEvent, CalendarThing } from '@/types'; 

export default function EventsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // 👇 Явная типизация useState
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarThing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, calendarsRes] = await Promise.all([
        eventService.getAll(),
        calendarService.getAll(),
      ]);
      if (eventsRes.success) setEvents(eventsRes.data || []);
      else toast.error(eventsRes.message);
      if (calendarsRes.success) setCalendars(calendarsRes.data || []);
      else toast.error(calendarsRes.message);
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 Типизация колбэков фильтрации
  const filteredEvents = events.filter((event: CalendarEvent) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const calendar = calendars.find((c: CalendarThing) => c.id === event.calendarId);
    if (!calendar) return false;
    return event.participants.includes(user.id) ||
           event.createdBy === user.id ||
           calendar.members.includes(user.id);
  }).sort((a: CalendarEvent, b: CalendarEvent) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Все события</h1>
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Нет событий</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const calendar = calendars.find((c: CalendarThing) => c.id === event.calendarId);
              return (
                <div
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(event.start)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{event.participants.length} участников</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{calendar?.name || 'Неизвестный календарь'}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
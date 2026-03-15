import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, calendarService } from '@/services/api';
import { formatDateTime } from '@/utils';
import { toast } from 'react-hot-toast';
import { CalendarEvent, CalendarThing as CalendarType } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (q && user) {
      performSearch();
    } else {
      setIsLoading(false);
    }
  }, [q, user, authLoading]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, calendarsRes] = await Promise.all([
        eventService.getAll(),
        calendarService.getAll(),
      ]);
      if (eventsRes.success) setEvents(eventsRes.data || []);
      if (calendarsRes.success) setCalendars(calendarsRes.data || []);
    } catch (err) {
      toast.error('Ошибка поиска');
    } finally {
      setIsLoading(false);
    }
  };

  const searchTerm = (q as string)?.toLowerCase() || '';

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm) ||
    (event.description && event.description.toLowerCase().includes(searchTerm)) ||
    (event.location && event.location.toLowerCase().includes(searchTerm))
  );

  const filteredCalendars = calendars.filter(cal =>
    cal.name.toLowerCase().includes(searchTerm) ||
    (cal.description && cal.description.toLowerCase().includes(searchTerm))
  );

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Поиск...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Результаты поиска: "{q}"</h1>
        </div>

        <div className="space-y-8">
          {/* Календари */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Календари</h2>
            {filteredCalendars.length === 0 ? (
              <p className="text-gray-500">Ничего не найдено</p>
            ) : (
              <div className="space-y-3">
                {filteredCalendars.map(cal => (
                  <div
                    key={cal.id}
                    onClick={() => router.push(`/calendar/${cal.id}/view`)}
                    className="card hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: cal.color }} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{cal.name}</h3>
                        <p className="text-sm text-gray-500">{cal.description}</p>
                        <p className="text-xs text-gray-400">{cal.members.length} участников</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* События */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">События</h2>
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500">Ничего не найдено</p>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map(event => {
                  const calendar = calendars.find(c => c.id === event.calendarId);
                  return (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="card hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{formatDateTime(event.start)}</span>
                            {event.location && <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{event.location}</span>}
                            <span className="flex items-center"><Users className="h-4 w-4 mr-1" />{event.participants.length}</span>
                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{calendar?.name}</span>
                          </div>
                        </div>
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color || '#3b82f6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
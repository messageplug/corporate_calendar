import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Plus, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CalendarCard } from '@/components/calendar/CalendarCard';
import { EventList } from '@/components/calendar/EventList';
import { useAppStore } from '@/store/store';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService, eventService } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { calendars, events, setCalendars, setEvents } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    setError('');

    try {
      const [calendarsRes, eventsRes] = await Promise.all([
        calendarService.getAll(),
        eventService.getAll(),
      ]);

      if (calendarsRes.success) {
        setCalendars(calendarsRes.data || []);
      } else {
        setError('Ошибка загрузки календарей: ' + calendarsRes.message);
        toast.error(calendarsRes.message);
      }

      if (eventsRes.success) {
        setEvents(eventsRes.data || []);
      } else {
        setError('Ошибка загрузки событий: ' + eventsRes.message);
        toast.error(eventsRes.message);
      }
    } catch (err: any) {
      const message = err?.message || 'Ошибка соединения с сервером';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const userCalendars = calendars.filter(calendar => 
    calendar.members.includes(user?.id || '') || calendar.isPublic
  );

  const userEvents = events.filter(event => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const calendar = calendars.find(c => c.id === event.calendarId);
    if (!calendar) return false;
    return event.participants.includes(user.id) ||
           event.createdBy === user.id ||
           calendar.members.includes(user.id);
  });

  const upcomingEvents = userEvents
    .filter(event => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const stats = {
    calendars: userCalendars.length,
    events: upcomingEvents.length,
    members: userCalendars.reduce((acc, cal) => acc + cal.members.length, 0),
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Загрузка данных...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Добро пожаловать, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Управляйте своими календарями и событиями
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {user?.role !== 'USER' && (
              <button 
                onClick={() => router.push('/event/create')}
                className="btn-primary flex items-center space-x-2 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Создать событие</span>
                <span className="sm:hidden">Создать</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium"
            >
              Попробовать снова
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Доступных календарей</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.calendars}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Предстоящих событий</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.events}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Всего участников</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.members}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Мои календари
              </h2>
              <a
                href="/calendar/all"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Посмотреть все
              </a>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {userCalendars.length === 0 ? (
                <div className="card text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Нет доступных календарей</p>
                </div>
              ) : (
                userCalendars.slice(0, 3).map((calendar) => (
                  <CalendarCard key={calendar.id} calendar={calendar} />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Предстоящие события
              </h2>
              <a
                href="/events"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Посмотреть все
              </a>
            </div>

            <EventList events={upcomingEvents.slice(0, 5)} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
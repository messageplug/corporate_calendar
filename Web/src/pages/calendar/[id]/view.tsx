import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService, eventService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';
import { CalendarEvent, CalendarThing } from '@/types'; // 👈 Импорт типов

export default function CalendarViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  
  // 👇 Явная типизация с union-типами для null
  const [calendar, setCalendar] = useState<CalendarThing | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (id) {
      loadData();
    }
  }, [id, user, authLoading]);

  const loadData = async () => {
    const calRes = await calendarService.getById(id as string);
    if (calRes.success) {
      setCalendar(calRes.data!);
    } else {
      toast.error(calRes.message);
      router.push('/dashboard');
      return;
    }
    const eventsRes = await eventService.getAll(id as string);
    if (eventsRes.success) {
      setEvents(eventsRes.data || []);
    } else {
      toast.error(eventsRes.message);
    }
  };

  if (authLoading || !calendar) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay === 0 ? 6 : startDay - 1 }, (_, i) => i);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{calendar.name} — просмотр</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-700 mb-2">
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`blank-${i}`} className="h-24 bg-gray-50 rounded p-1" />)}
            {days.map(day => {
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              // 👇 Типизация колбэка фильтрации
              const dayEvents = events.filter((e: CalendarEvent) => 
                new Date(e.start).toDateString() === new Date(dateStr).toDateString()
              );
              return (
                <div key={day} className="h-24 border border-gray-200 rounded p-1 overflow-y-auto">
                  <div className="font-medium text-sm">{day}</div>
                  {dayEvents.map((e: CalendarEvent) => (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/events/${e.id}`)}
                      className="text-xs p-1 mb-1 rounded cursor-pointer truncate"
                      style={{ backgroundColor: e.color || '#3b82f6', color: 'white' }}
                    >
                      {e.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
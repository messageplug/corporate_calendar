import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CalendarCard } from '@/components/calendar/CalendarCard';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { CalendarThing, User } from '@/types'; // 👈 Импорт типов

export default function AllCalendarsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // 👇 Явная типизация
  const [calendars, setCalendars] = useState<CalendarThing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        loadCalendars();
      }
    }
  }, [user, authLoading, router]);

  const loadCalendars = async () => {
    setIsLoading(true);
    const res = await calendarService.getAll();
    if (res.success) {
      setCalendars(res.data || []);
    } else {
      toast.error(res.message || 'Ошибка загрузки');
    }
    setIsLoading(false);
  };

  // 👇 Типизация колбэка фильтрации
  const userCalendars = calendars.filter((cal: CalendarThing) =>
    cal.members.includes(user?.id || '') || cal.isPublic
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Мои календари</h1>
          </div>
          {user?.role !== 'USER' && (
            <button
              onClick={() => router.push('/calendar/create')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Создать календарь</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {userCalendars.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Нет доступных календарей</p>
            </div>
          ) : (
            userCalendars.map((calendar: CalendarThing) => (
              <CalendarCard key={calendar.id} calendar={calendar} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
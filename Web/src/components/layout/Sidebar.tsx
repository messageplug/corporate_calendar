import { useRouter } from 'next/router';
import { Calendar, Users, Settings, LogOut, Plus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/store';
import { hasCalendarAccess } from '@/utils';

export const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const calendars = useAppStore((state) => state.calendars);

  if (!user) return null;

  const userCalendars = user.role === 'ADMIN'
    ? calendars
    : calendars.filter(calendar => 
        calendar.members.includes(user.id) || calendar.isPublic
      );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full">
      <nav className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Календари
          </h2>

          {user.role !== 'USER' && (
            <button 
              onClick={() => router.push('/calendar/create')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Создать календарь</span>
            </button>
          )}

          <div className="space-y-1">
            {userCalendars.slice(0, 5).map((calendar) => {
              const isManager = hasCalendarAccess(user, calendar, 'manage');

              return (
                <button
                  key={calendar.id}
                  onClick={() => router.push(`/calendar/${calendar.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="truncate">{calendar.name}</span>
                  </div>
                  {isManager && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Управление
            </h2>

            <button
              onClick={() => router.push('/users')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Пользователи</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Настройки
          </h2>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Настройки</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Выйти</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
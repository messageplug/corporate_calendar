import { useRouter } from 'next/router';
import { Calendar, Users, Settings } from 'lucide-react';
import { CalendarThing as CalendarType } from '@/types';
import { formatDate } from '@/utils';

interface CalendarCardProps {
  calendar: CalendarType;
}

export const CalendarCard = ({ calendar }: CalendarCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/calendar/${calendar.id}/view`);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/calendar/${calendar.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="card hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: calendar.color }}
          >
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{calendar.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {calendar.description || 'Описание отсутствует'}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-3">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{calendar.members.length} участников</span>
              </div>
              <div className="text-sm text-gray-500">
                Создан {formatDate(calendar.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSettings}
          className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};
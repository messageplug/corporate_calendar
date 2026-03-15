import { useRouter } from 'next/router';
import { Clock, MapPin, Users } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { formatDateTime } from '@/utils';

interface EventListProps {
  events: CalendarEvent[];
}

export const EventList = ({ events }: EventListProps) => {
  const router = useRouter();

  if (events.length === 0) {
    return (
      <div className="card text-center py-8 sm:py-12">
        <p className="text-gray-500">Нет предстоящих событий</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => router.push(`/events/${event.id}`)}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>

              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{formatDateTime(event.start)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{event.participants.length} участников</span>
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>

            <div
              className="h-3 w-3 rounded-full flex-shrink-0 ml-2 mt-1"
              style={{ backgroundColor: event.color || '#3b82f6' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
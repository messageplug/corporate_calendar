import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventComments } from '@/components/calendar/EventComments';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/store';
import { eventService, calendarService, userService } from '@/services/api';
import { formatDateTime, formatTime, getInitials } from '@/utils';
import { toast } from 'react-hot-toast';
import { CalendarEvent, CalendarThing, User } from '@/types';
const { events, setEvents } = useAppStore();

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { setEvents, setCalendars, setUsers } = useAppStore();

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [calendar, setCalendar] = useState<CalendarThing | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    location: '',
    start: '',
    end: '',
    color: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (id) {
      loadEvent();
      loadUsers();
    }
  }, [id, user]);

  const loadEvent = async () => {
    if (!id) return;
    const res = await eventService.getById(id as string);
    if (res.success && res.data) {
      setEvent(res.data);
      setEditData({
        title: res.data.title,
        description: res.data.description || '',
        location: res.data.location || '',
        start: new Date(res.data.start).toISOString().slice(0, 16),
        end: new Date(res.data.end).toISOString().slice(0, 16),
        color: res.data.color || '#3b82f6',
      });
      // загрузить календарь события
      const calRes = await calendarService.getById(res.data.calendarId);
      if (calRes.success && calRes.data) {
        setCalendar(calRes.data);
      }
    } else {
      toast.error(res.message || 'Ошибка загрузки события');
      router.push('/dashboard');
    }
  };

  const loadUsers = async () => {
    const res = await userService.getAll();
    if (res.success && res.data) {
      setAllUsers(res.data);
      setUsers(res.data);
    }
  };

  const handleSave = async () => {
    if (!event) return;
    const res = await eventService.update(event.id, {
      ...editData,
      start: new Date(editData.start).toISOString(),
      end: new Date(editData.end).toISOString(),
    });
    if (res.success && res.data) {
      toast.success('Событие обновлено');
      setEvent(res.data);
      setIsEditing(false);
      
      // Обновляем стор, используя текущий events
      setEvents(events.map(e => e.id === event.id ? res.data! : e));
    } else {
      toast.error(res.message || 'Ошибка обновления');
    }
  };

  const handleCancel = () => {
    if (!event) return;
    setEditData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      color: event.color || '#3b82f6',
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!window.confirm('Вы уверены, что хотите удалить это событие?')) return;
    const res = await eventService.delete(event.id);
    if (res.success) {
      toast.success('Событие удалено');
      router.push('/dashboard');
    } else {
      toast.error(res.message || 'Ошибка удаления');
    }
  };

  const handleToggleParticipant = async () => {
    if (!event || !user) return;
    const isParticipant = event.participants.includes(user.id);
    let res;
    if (isParticipant) {
      res = await eventService.removeParticipant(event.id, user.id);
    } else {
      res = await eventService.addParticipant(event.id, user.id);
    }
    if (res.success && res.data) {
      toast.success('Событие обновлено');
      setEvent(res.data);
      setIsEditing(false);
      
      // Обновляем стор, используя текущий events
      setEvents(events.map(e => e.id === event.id ? res.data! : e));
    } else {
      toast.error(res.message || 'Ошибка');
    }
  };

  const handleStatusChange = async (status: CalendarEvent['status']) => {
    if (!event) return;
    const res = await eventService.update(event.id, { status });
    if (res.success && res.data) {
      toast.success('Событие обновлено');
      setEvent(res.data);
      setIsEditing(false);
      
      // Обновляем стор, используя текущий events
      setEvents(events.map(e => e.id === event.id ? res.data! : e));
    } else {
      toast.error(res.message || 'Ошибка');
    }
  };

  if (!event || !calendar || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </Layout>
    );
  }

  const canEdit = user.role === 'ADMIN' || event.createdBy === user.id || calendar.managers.includes(user.id);
  const canComment = calendar.members.includes(user.id) || calendar.isPublic || user.role === 'ADMIN';
  const isParticipant = event.participants.includes(user.id);

  const eventParticipants = allUsers.filter(u => event.participants.includes(u.id));
  const eventCreator = allUsers.find(u => u.id === event.createdBy);

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="input-field text-2xl font-bold"
                  />
                ) : (
                  event.title
                )}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                />
                <span className="text-gray-600">{calendar.name}</span>
                <span className={`px-2 py-1 text-xs rounded ${statusColors[event.status]}`}>
                  {event.status === 'SCHEDULED' && 'Запланировано'}
                  {event.status === 'IN_PROGRESS' && 'В процессе'}
                  {event.status === 'COMPLETED' && 'Завершено'}
                  {event.status === 'CANCELLED' && 'Отменено'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleParticipant}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isParticipant
                  ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isParticipant ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  <span>Не участвовать</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Участвовать</span>
                </>
              )}
            </button>

            {canEdit && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Редактировать</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Сохранить</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Отмена</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="input-field"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Начало
                      </label>
                      <input
                        type="datetime-local"
                        value={editData.start}
                        onChange={(e) => setEditData({ ...editData, start: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Окончание
                      </label>
                      <input
                        type="datetime-local"
                        value={editData.end}
                        onChange={(e) => setEditData({ ...editData, end: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Место проведения
                    </label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="input-field"
                      placeholder="Введите адрес или место проведения"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цвет события
                    </label>
                    <input
                      type="color"
                      value={editData.color}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {event.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Описание</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Детали события</h3>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Календарь</p>
                            <p className="font-medium">{calendar.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Время</p>
                            <p className="font-medium">
                              {formatDateTime(event.start)} - {formatTime(event.end)}
                            </p>
                          </div>
                        </div>

                        {event.location && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Место проведения</p>
                              <p className="font-medium">{event.location}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Создатель</p>
                            <p className="font-medium">{eventCreator?.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Изменить статус</h3>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleStatusChange('SCHEDULED')}
                            disabled={event.status === 'SCHEDULED'}
                            className={`w-full text-left px-4 py-3 rounded-lg ${event.status === 'SCHEDULED' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-3 w-3 bg-blue-500 rounded-full" />
                              <span>Запланировано</span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleStatusChange('IN_PROGRESS')}
                            disabled={event.status === 'IN_PROGRESS'}
                            className={`w-full text-left px-4 py-3 rounded-lg ${event.status === 'IN_PROGRESS' ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                              <span>В процессе</span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleStatusChange('COMPLETED')}
                            disabled={event.status === 'COMPLETED'}
                            className={`w-full text-left px-4 py-3 rounded-lg ${event.status === 'COMPLETED' ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-3 w-3 bg-green-500 rounded-full" />
                              <span>Завершено</span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleStatusChange('CANCELLED')}
                            disabled={event.status === 'CANCELLED'}
                            className={`w-full text-left px-4 py-3 rounded-lg ${event.status === 'CANCELLED' ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-3 w-3 bg-red-500 rounded-full" />
                              <span>Отменено</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {canComment && <EventComments eventId={event.id} />}
          </div>

          <div>
            <div className="card">
              <h3 className="font-medium text-gray-900 mb-4">Участники ({eventParticipants.length})</h3>

              <div className="space-y-3">
                {eventParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitials(participant.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-6">
              <h3 className="font-medium text-gray-900 mb-4">Информация о календаре</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: calendar.color }}
                  >
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{calendar.name}</p>
                    <p className="text-sm text-gray-500">{calendar.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Доступ:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${calendar.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {calendar.isPublic ? 'Публичный' : 'Приватный'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {calendar.members.length} участников
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
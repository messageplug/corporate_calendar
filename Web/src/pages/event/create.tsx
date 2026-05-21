import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService, eventService, userService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { CalendarThing, User } from '@/types';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [calendars, setCalendars] = useState<CalendarThing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    calendarId: '',
    start: '',
    end: '',
    location: '',
    color: '#3b82f6',
    participants: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const init = async () => {
      setIsLoading(true);
      await loadCalendars();
      await loadUsers();
      setIsLoading(false);
    };

    init();
  }, [user, authLoading, router]);

  const loadCalendars = async () => {
    const res = await calendarService.getAll();
    if (res.success) {
      const editable = res.data!.filter(c => 
        c.members.includes(user!.id) || c.managers.includes(user!.id) || user!.role === 'ADMIN'
      );
      setCalendars(editable);
      if (editable.length > 0 && !formData.calendarId) {
        setFormData(prev => ({ ...prev, calendarId: editable[0].id }));
      }
    } else {
      toast.error(res.message);
    }
  };

  const loadUsers = async () => {
    const res = await userService.getAll();
    if (res.success) {
      setUsers(res.data!);
    } else {
      toast.error(res.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.calendarId || !formData.start || !formData.end) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await eventService.create({
        title: formData.title,
        description: formData.description,
        calendarId: formData.calendarId,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        location: formData.location,
        color: formData.color,
        participants: formData.participants,
      });
      if (response.success && response.data) {
        toast.success('Событие создано');
        router.push(`/events/${response.data.id}`);
      } else {
        toast.error(response.message || 'Ошибка создания');
      }
    } catch (err: any) {
      toast.error(err.message || 'Ошибка соединения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  const selectedCalendar = calendars.find(c => c.id === formData.calendarId);
  const availableUsers = selectedCalendar 
    ? users.filter(u => selectedCalendar.members.includes(u.id) && u.id !== user?.id)
    : [];

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Создание нового события</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название события <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Введите название события"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Календарь <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.calendarId}
              onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Выберите календарь</option>
              {calendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата и время начала <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата и время окончания <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Опишите детали события"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Место проведения
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20 cursor-pointer"
            />
          </div>

          {selectedCalendar && availableUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Участники
              </label>
              <div className="space-y-2">
                {availableUsers.map(availableUser => (
                  <div key={availableUser.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id={`user-${availableUser.id}`}
                      checked={formData.participants.includes(availableUser.id)}
                      onChange={() => handleToggleParticipant(availableUser.id)}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <label htmlFor={`user-${availableUser.id}`} className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {availableUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{availableUser.name}</p>
                          <p className="text-sm text-gray-500">{availableUser.email}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span>Отмена</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Создание...' : 'Создать событие'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
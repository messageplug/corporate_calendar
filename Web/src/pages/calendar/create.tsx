import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService } from '@/services/api';
import { toast } from 'react-hot-toast';

export default function CreateCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    isPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Проверка прав: создавать календарь могут MANAGER и ADMIN
    if (user.role === 'USER') {
      toast.error('У вас нет прав для создания календаря');
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Введите название календаря');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await calendarService.create(formData);
      if (response.success && response.data) {
        toast.success('Календарь создан');
        router.push(`/calendar/${response.data.id}`);
      } else {
        toast.error(response.message || 'Ошибка создания календаря');
      }
    } catch (err: any) {
      toast.error(err.message || 'Ошибка соединения');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Создание календаря</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Например: Рабочий календарь"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Краткое описание календаря"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цвет
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20 cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Публичный календарь (доступен всем)
            </label>
          </div>

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
              <span>{isSubmitting ? 'Создание...' : 'Создать календарь'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
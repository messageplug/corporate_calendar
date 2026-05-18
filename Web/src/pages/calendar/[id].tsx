import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
  Trash2,
  Edit,
  Save,
  X,
  Search
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/store';
import { calendarService, userService } from '@/services/api';
import { hasCalendarAccess } from '@/utils';
import { getInitials } from '@/utils';
import { toast } from 'react-hot-toast';
import { CalendarThing, User } from '@/types';

export default function CalendarManagePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { calendars, setCalendars, setUsers } = useAppStore();
  const [calendar, setCalendar] = useState<CalendarThing | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    color: '',
    isPublic: false,
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [availableSearch, setAvailableSearch] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (id) {
      loadCalendar();
      loadUsers();
    }
  }, [id, user]);

  const loadCalendar = async () => {
    if (!id) return;
    const response = await calendarService.getById(id as string);
    if (response.success && response.data) {
      setCalendar(response.data);
      setEditData({
        name: response.data.name,
        description: response.data.description || '',
        color: response.data.color,
        isPublic: response.data.isPublic,
      });
    } else {
      toast.error(response.message || 'Ошибка загрузки календаря');
      router.push('/dashboard');
    }
  };

  const loadUsers = async () => {
    const response = await userService.getAll();
    if (response.success && response.data) {
      setAllUsers(response.data);
      setUsers(response.data);
    } else {
      toast.error(response.message || 'Ошибка загрузки пользователей');
    }
  };

  if (!calendar || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (!hasCalendarAccess(user, calendar, 'manage')) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="card text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
            <p className="text-gray-600 mb-4">У вас нет прав для управления этим календарем</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const calendarMembers = allUsers.filter(u => calendar.members.includes(u.id));
  const filteredMembers = calendarMembers.filter(member =>
    member.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const calendarManagers = allUsers.filter(u => calendar.managers.includes(u.id));

  const availableUsers = allUsers.filter(u =>
    !calendar.members.includes(u.id) &&
    u.id !== user.id &&
    u.isActive
  );
  const filteredAvailable = availableUsers.filter(availableUser =>
    availableUser.name.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!calendar) return;
    const response = await calendarService.update(calendar.id, editData);
    if (response.success && response.data) {
      toast.success('Календарь обновлён');
      setCalendar(response.data);
      const updatedCalendars = calendars.map(c => c.id === calendar.id ? response.data! : c);
      setCalendars(updatedCalendars);
      setIsEditing(false);
    } else {
      toast.error(response.message || 'Ошибка обновления');
    }
  };

  const handleCancel = () => {
    if (!calendar) return;
    setEditData({
      name: calendar.name,
      description: calendar.description || '',
      color: calendar.color,
      isPublic: calendar.isPublic,
    });
    setIsEditing(false);
  };

  const handleAddMember = async (userId: string) => {
    if (!calendar) return;
    const response = await calendarService.addMember(calendar.id, userId);
    if (response.success && response.data) {
      toast.success('Участник добавлен');
      setCalendar(response.data);
      const updated = calendars.map(c => c.id === calendar.id ? response.data! : c);
      setCalendars(updated);
    } else {
      toast.error(response.message || 'Ошибка добавления');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!calendar) return;
    if (userId === calendar.createdBy) {
      toast.error('Нельзя удалить создателя календаря');
      return;
    }
    const response = await calendarService.removeMember(calendar.id, userId);
    if (response.success && response.data) {
      toast.success('Участник удалён');
      setCalendar(response.data);
      const updated = calendars.map(c => c.id === calendar.id ? response.data! : c);
      setCalendars(updated);
    } else {
      toast.error(response.message || 'Ошибка удаления');
    }
  };

  const handleToggleManager = async (userId: string, isManager: boolean) => {
    if (!calendar) return;
    if (userId === calendar.createdBy) {
      toast.error('Создатель календаря всегда является менеджером');
      return;
    }
    let response;
    if (isManager) {
      response = await calendarService.removeManager(calendar.id, userId);
    } else {
      response = await calendarService.addManager(calendar.id, userId);
    }
    if (response.success && response.data) {
      toast.success(isManager ? 'Права менеджера сняты' : 'Менеджер назначен');
      setCalendar(response.data);
      const updated = calendars.map(c => c.id === calendar.id ? response.data! : c);
      setCalendars(updated);
    } else {
      toast.error(response.message || 'Ошибка изменения прав');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление календарем</h1>
            <p className="text-gray-600">Настройки участников и прав доступа</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Информация о календаре</h2>
                {!isEditing && hasCalendarAccess(user, calendar, 'manage') && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Редактировать</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название календаря
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цвет
                    </label>
                    <input
                      type="color"
                      value={editData.color}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={editData.isPublic}
                      onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                      Публичный календарь
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Сохранить</span>
                    </button>
                    <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Отмена</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: calendar.color }} />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{calendar.name}</h3>
                      <p className="text-gray-600 mt-1">{calendar.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded ${calendar.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {calendar.isPublic ? 'Публичный' : 'Приватный'}
                        </span>
                        <span>Создан {new Date(calendar.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Участники календаря</h2>
              </div>

              {/* Поле поиска по участникам */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-4">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const isCreator = member.id === calendar.createdBy;
                    const isManager = calendar.managers.includes(member.id);

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="font-medium text-gray-900">{member.name}</span>
                              {isCreator && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  Создатель
                                </span>
                              )}
                              {isManager && !isCreator && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Менеджер
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded ${member.role === 'ADMIN' ? 'bg-red-100 text-red-800' : member.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {member.role === 'ADMIN' ? 'Админ' : member.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!isCreator && hasCalendarAccess(user, calendar, 'manage') && (
                            <>
                              {isManager ? (
                                <button
                                  onClick={() => handleToggleManager(member.id, true)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  title="Убрать права менеджера"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleManager(member.id, false)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Назначить менеджером"
                                >
                                  <Shield className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Удалить из календаря"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">Участники не найдены</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Добавить участников</h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Введите имя для поиска..."
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {availableSearch.trim() === '' ? (
                <p className="text-gray-500 text-center py-4">Введите имя для поиска пользователей</p>
              ) : filteredAvailable.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Пользователи не найдены</p>
              ) : (
                <div className="space-y-3">
                  {filteredAvailable.map((availableUser) => (
                    <div key={availableUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {getInitials(availableUser.name)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{availableUser.name}</span>
                          <p className="text-xs text-gray-500">{availableUser.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(availableUser.id)}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
                        title="Добавить в календарь"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Всего участников:</span>
                  <span className="font-medium">{calendarMembers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Менеджеров:</span>
                  <span className="font-medium">{calendarManagers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Обычных пользователей:</span>
                  <span className="font-medium">
                    {calendarMembers.length - calendarManagers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className={`px-2 py-1 rounded text-sm ${calendar.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {calendar.isPublic ? 'Публичный' : 'Приватный'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
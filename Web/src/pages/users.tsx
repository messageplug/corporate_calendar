import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, UserPlus, Edit, Trash2, Mail, User, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userService, authService } from '@/services/api';
import { toast } from 'react-hot-toast';
import { User as UserType } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth(); // добавляем authLoading
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      toast.error('Доступ запрещён');
      router.push('/dashboard');
      return;
    }

    loadUsers();
  }, [user, authLoading, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    const res = await userService.getAll();
    if (res.success) {
      setUsers(res.data || []);
    } else {
      toast.error(res.message || 'Ошибка загрузки пользователей');
    }
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await userService.updateRole(userId, newRole as any);
      if (res.success) {
        toast.success('Роль обновлена');
        loadUsers();
      } else {
        toast.error(res.message || 'Ошибка обновления');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при обновлении роли');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя? Это действие необратимо.')) return;
    
    try {
      const res = await userService.delete(userId);
      if (res.success) {
        toast.success('Пользователь удалён');
        loadUsers();
      } else {
        toast.error(res.message || 'Ошибка удаления');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при удалении');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as any,
      });
      if (res.success) {
        toast.success('Пользователь добавлен');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'USER' });
        loadUsers();
      } else {
        toast.error(res.message || 'Ошибка добавления');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при добавлении пользователя');
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      ADMIN: 'Администратор',
      MANAGER: 'Менеджер',
      USER: 'Пользователь',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
              <p className="text-gray-600">Добавление, редактирование и удаление пользователей</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Добавить пользователя</span>
          </button>
        </div>

        <div className="card">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по имени или email..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="text-sm text-gray-500">
                Найдено: {filteredUsers.length} пользователей
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Пользователь</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Роль</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Статус</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                            {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{userItem.name}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {userItem.email}
                            </p>
                          </div>
                        </div>
                       </td>
                      <td className="py-3 px-4">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={userItem.id === user.id}
                        >
                          <option value="USER">Пользователь</option>
                          <option value="MANAGER">Менеджер</option>
                          <option value="ADMIN">Администратор</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDelete(userItem.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Пользователи не найдены</p>
            </div>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Добавить пользователя</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Имя</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Пароль</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Роль</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field mt-1"
                  >
                    <option value="USER">Пользователь</option>
                    <option value="MANAGER">Менеджер</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                    Отмена
                  </button>
                  <button type="submit" className="btn-primary">
                    Добавить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setEditingUser(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Редактировать пользователя</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
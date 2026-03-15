import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, UserPlus, Edit, Trash2, Shield, Mail, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Только админ может видеть эту страницу
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    // Mock пользователи
    const mockUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Администратор Системы',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:00:00Z',
        isActive: true,
      },
      {
        id: '2',
        email: 'manager@example.com',
        name: 'Менеджер Проектов',
        role: 'MANAGER',
        createdAt: '2024-01-20T14:30:00Z',
        isActive: true,
      },
      {
        id: '3',
        email: 'user@example.com',
        name: 'Пользователь Тестовый',
        role: 'USER',
        createdAt: '2024-01-25T09:15:00Z',
        isActive: true,
      },
      {
        id: '4',
        email: 'anna@example.com',
        name: 'Анна Иванова',
        role: 'USER',
        createdAt: '2024-02-01T11:45:00Z',
        isActive: true,
      },
      {
        id: '5',
        email: 'peter@example.com',
        name: 'Петр Сидоров',
        role: 'MANAGER',
        createdAt: '2024-02-05T16:20:00Z',
        isActive: true,
      },
    ];
    
    setUsers(mockUsers);
  }, [user, router]);
  
  if (user?.role !== 'ADMIN') {
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
          
          <button className="btn-primary flex items-center space-x-2">
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
                          {userItem.name.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}
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
                      {getRoleBadge(userItem.role)}
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
                        <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Пользователи не найдены</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
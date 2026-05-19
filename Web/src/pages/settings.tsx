import { useRouter } from 'next/router';
import { useState } from 'react';
import { ArrowLeft, Save, User, Mail, Bell, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
  });
  
  if (!user) {
    router.push('/auth/login');
    return null;
  }
  
  const handleSave = () => {
    alert('Настройки сохранены (заглушка)');
  };
  
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
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Профиль</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-medium text-gray-900 mb-4">Информация о пользователе</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Роль</span>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Администратор' :
                     user.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
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
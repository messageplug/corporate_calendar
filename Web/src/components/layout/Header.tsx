import { useRouter } from 'next/router';
import { useState } from 'react';
import { Calendar, Bell, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { NotificationDropdown } from '../noty/NotificationDropdown';

export const Header = () => {
  //test
  const router = useRouter();
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Логотип со ссылкой на главную */}
            <a href="/dashboard" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">CRM Календарь</span>
                <span className="sm:hidden">CRM</span>
              </h1>
            </a>

            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="pl-9 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-3 py-2 rounded-r-lg hover:bg-primary-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationDropdown />

            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role === 'ADMIN' ? 'Администратор' : 
                   user?.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
                </p>
              </div>

              <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                <User className="h-5 w-5" />
              </div>
            </div>

            <div className="sm:hidden">
              <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Мобильный поиск */}
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 text-white px-3 py-2 rounded-r-lg hover:bg-primary-700"
            >
              Найти
            </button>
          </form>
        </div>

        {/* Мобильное меню */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-2">
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role === 'ADMIN' ? 'Администратор' : 
                   user?.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
                </p>
              </div>

              <a
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Calendar className="h-5 w-5" />
                <span>Главная</span>
              </a>

              <a
                href="/settings"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span>Профиль</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
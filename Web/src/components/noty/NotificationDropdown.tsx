import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationService, Notification } from '@/services/notificationApi';
import { useRouter } from 'next/router';
import { formatDateTime } from '@/utils';
import { toast } from 'react-hot-toast';

export const NotificationDropdown = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await notificationService.getAll(0, 20);
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    const res = await notificationService.getUnreadCount();
    if (res.success && res.data !== undefined) {
      setUnreadCount(res.data);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const res = await notificationService.markAsRead(id);
    if (res.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else {
      toast.error(res.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await notificationService.markAllAsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Все уведомления отмечены прочитанными');
    } else {
      toast.error(res.message);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.relatedEntityId) {
      if (notification.type === 'comment' || notification.type === 'event_changed' || notification.type === 'participant_added') {
        router.push(`/events/${notification.relatedEntityId}`);
      }
    }
    setIsOpen(false);
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Отметить все
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Загрузка...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Нет уведомлений</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif.id);
                        }}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { commentService, userService } from '@/services/api';
import { EventComment, User } from '@/types';
import { formatDateTime, getInitials } from '@/utils';
import { toast } from 'react-hot-toast';

interface EventCommentsProps {
  eventId: string;
}

export const EventComments = ({ eventId }: EventCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
    loadUsers();
  }, [eventId]);

  const loadComments = async () => {
    setIsLoading(true);
    const res = await commentService.getByEvent(eventId);
    if (res.success) {
      setComments(res.data || []);
    } else {
      toast.error(res.message || 'Ошибка загрузки комментариев');
    }
    setIsLoading(false);
  };

  const loadUsers = async () => {
    const res = await userService.getAll();
    if (res.success) {
      setUsers(res.data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const res = await commentService.create({ eventId, content: newComment.trim() });
    if (res.success && res.data) {
      setComments(prev => [res.data!, ...prev]);
      setNewComment('');
    } else {
      toast.error(res.message || 'Ошибка добавления комментария');
    }
  };

  const handleEdit = (comment: EventComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    const res = await commentService.update(commentId, editContent.trim());
    if (res.success && res.data) {
      setComments(prev => prev.map(c => c.id === commentId ? res.data! : c));
      setEditingComment(null);
      setEditContent('');
    } else {
      toast.error(res.message || 'Ошибка обновления');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить комментарий?')) return;
    const res = await commentService.delete(commentId);
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Комментарий удалён');
    } else {
      toast.error(res.message || 'Ошибка удаления');
    }
  };

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u?.name || 'Неизвестный пользователь';
  };

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Комментарии ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                {getInitials(user.name)}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="btn-primary flex items-center space-x-2 py-2 px-4"
                >
                  <Send className="h-4 w-4" />
                  <span>Отправить</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 mb-6">Войдите в систему, чтобы оставлять комментарии</p>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-center py-4">Загрузка комментариев...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Комментариев пока нет</p>
        ) : (
          comments.map((comment) => {
            const commentUser = users.find(u => u.id === comment.userId);
            const isOwner = user?.id === comment.userId;
            const canEdit = isOwner || user?.role === 'ADMIN';

            return (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {getInitials(commentUser?.name || '')}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {commentUser?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(comment.createdAt)}
                          {comment.createdAt !== comment.updatedAt && ' (ред.)'}
                        </span>
                      </div>
                      {canEdit && (
                        <div className="flex items-center space-x-2">
                          {editingComment === comment.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                className="text-green-600 hover:text-green-700 text-sm"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingComment(null)}
                                className="text-gray-600 hover:text-gray-700 text-sm"
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(comment)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editingComment === comment.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
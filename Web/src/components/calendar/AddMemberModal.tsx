import { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { AutoComplete } from '@/components/search/AutoComplete';
import { User } from '@/types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string) => void;
  existingMembers: string[];
}

export const AddMemberModal = ({ 
  isOpen, 
  onClose, 
  onAddMember,
  existingMembers 
}: AddMemberModalProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleSelect = (user: User) => {
    if (!existingMembers.includes(user.id)) {
      setSelectedUser(user);
    }
  };
  
  const handleAdd = () => {
    if (selectedUser) {
      onAddMember(selectedUser.id);
      setSelectedUser(null);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Добавить участника
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск пользователей
              </label>
              <AutoComplete onSelect={handleSelect} />
              
              {selectedUser && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        <p className="text-xs text-gray-500">
                          {selectedUser.role === 'ADMIN' ? 'Администратор' : 
                           selectedUser.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAdd}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Добавить</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  showReload?: boolean;
  onReload?: () => void;
}

export const LoadingSpinner = ({ 
  message = 'Загрузка...', 
  showReload = false,
  onReload 
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
        <div className="h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
      
      {showReload && onReload && (
        <button
          onClick={onReload}
          className="mt-4 flex items-center space-x-2 text-primary-600 hover:text-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Повторить попытку</span>
        </button>
      )}
    </div>
  );
};
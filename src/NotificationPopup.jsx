import { useEffect } from 'react';
import './notification.css';

export default function NotificationPopup({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} border-l-4 p-4 rounded shadow-lg max-w-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl mr-2">{icons[type]}</span>
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-lg font-bold hover:opacity-70">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

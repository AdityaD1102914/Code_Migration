import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Toaster = ({ toasts, removeToast }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full p-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-2 duration-300 flex items-center space-x-3 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : toast.type === 'warning'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          {getIcon(toast.type)}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 text-xl hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
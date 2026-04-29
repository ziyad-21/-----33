
import React, { useEffect } from 'react';
import { CheckCircle, AlertOctagon, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  isRTL: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, isRTL }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 animate-slide-down ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {type === 'success' ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
      <span className="font-bold text-lg">{message}</span>
      <button onClick={onClose} className="ml-4 hover:bg-white/20 rounded-full p-1">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;

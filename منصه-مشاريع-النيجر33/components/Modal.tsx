
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isRTL?: boolean;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isRTL, contentClassName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-md max-h-full rounded-lg shadow-2xl ${isRTL ? 'text-right' : 'text-left'} ${contentClassName || 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b rounded-t ${contentClassName?.includes('border') ? 'border-inherit' : ''}`}>
          <h3 className={`text-xl font-semibold ${contentClassName ? '' : 'text-gray-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            type="button"
            className={`ml-auto inline-flex items-center justify-center rounded-lg bg-transparent p-1.5 text-sm ${contentClassName ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-900'}`}
          >
            <X size={20} />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;

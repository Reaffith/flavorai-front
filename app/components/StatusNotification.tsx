'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface StatusNotificationProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

export const StatusNotification: React.FC<StatusNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } text-white w-[90%] sm:w-auto sm:max-w-sm animate-slide-in z-50`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm sm:text-base">{message}</p>
        <button onClick={onClose} className="ml-4 text-white font-bold">
          ×
        </button>
      </div>
    </div>,
    document.getElementById('portal-root')!
  );
};
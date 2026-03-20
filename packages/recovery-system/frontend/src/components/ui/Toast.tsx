import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#52b56e';
      case 'error':
        return '#e05555';
      default:
        return '#1a2e26';
    }
  };

  return (
    <div 
      className="fixed bottom-7 left-1/2 transform -translate-x-1/2 translate-y-15 text-white px-5.5 py-2.5 rounded-[20px] text-[13px] font-semibold z-[9999] opacity-0 transition-all pointer-events-none"
      style={{
        backgroundColor: getBackgroundColor(),
        transform: 'translateX(-50%) translateY(0px)',
        opacity: 1
      }}
    >
      {message}
    </div>
  );
}

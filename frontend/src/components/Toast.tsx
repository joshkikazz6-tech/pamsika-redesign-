import React from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#121c2a] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm border border-white/10">
      <span className="material-symbols-outlined text-[#d3bbff] text-[18px]">info</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

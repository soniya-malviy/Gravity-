import React, { useEffect } from 'react';

interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, items }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="fixed z-[300] glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[200px] animate-in zoom-in-95 duration-200"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <span className="text-indigo-400">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

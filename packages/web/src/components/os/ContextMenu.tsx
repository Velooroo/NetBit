import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  type?: 'separator';
  icon?: string;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 32));

  return (
    <motion.div
      ref={menuRef}
      className="fixed bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 py-2 min-w-48 z-50"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <hr 
              key={index} 
              className="my-1 border-gray-200" 
            />
          );
        }

        return (
          <motion.button
            key={index}
            className={`
              w-full flex items-center px-4 py-2 text-sm text-left transition-colors
              ${item.disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
              }
            `}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            whileHover={!item.disabled ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
            whileTap={!item.disabled ? { scale: 0.98 } : {}}
          >
            {item.icon && (
              <span className="mr-3 text-base">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default ContextMenu;
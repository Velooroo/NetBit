import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const Window: React.FC<WindowProps> = ({
  title,
  children,
  position,
  size,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  onSizeChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('window-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      onFocus();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
      };
      onPositionChange(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, size]);

  return (
    <motion.div
      ref={windowRef}
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseDown={onFocus}
    >
      {/* Window Header */}
      <div 
        className="window-header flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 select-none">{title}</span>
        </div>
        <div className="flex items-center space-x-1">
          {/* Minimize Button */}
          <button
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimize"
          />
          {/* Maximize Button */}
          <button
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle maximize state
              const isMaximized = size.width >= window.innerWidth - 100;
              if (isMaximized) {
                onSizeChange({ width: 800, height: 600 });
                onPositionChange({ x: 100, y: 100 });
              } else {
                onSizeChange({ 
                  width: window.innerWidth - 100, 
                  height: window.innerHeight - 150 
                });
                onPositionChange({ x: 50, y: 50 });
              }
            }}
            title="Maximize"
          />
          {/* Close Button */}
          <button
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
          />
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto p-4" style={{ height: size.height - 40 }}>
        {children}
      </div>

      {/* Resize Handles */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
        <div
          className="w-full h-full"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            onFocus();
          }}
        />
        {/* Visual indicator for resize handle */}
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 opacity-50" 
             style={{
               clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)'
             }}
        />
      </div>
    </motion.div>
  );
};

export default Window;
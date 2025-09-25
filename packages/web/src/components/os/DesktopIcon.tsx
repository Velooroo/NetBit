import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DesktopIconProps {
  title: string;
  icon: string;
  onDoubleClick: () => void;
  onRightClick?: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  title, 
  icon, 
  onDoubleClick, 
  onRightClick 
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setIsSelected(true);
    
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      // This is the second click - trigger double click
      onDoubleClick();
      setClickCount(0);
      setClickTimeout(null);
      return;
    }

    // This is the first click - start timer
    const timeout = setTimeout(() => {
      setClickCount(0);
      setIsSelected(false);
      setClickTimeout(null);
    }, 300);

    setClickTimeout(timeout);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSelected(true);
    if (onRightClick) {
      onRightClick();
    }
  };

  const handleBlur = () => {
    setIsSelected(false);
  };

  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center w-20 h-20 p-2 cursor-pointer rounded
        ${isSelected ? 'bg-blue-500/30 backdrop-blur-sm' : 'hover:bg-white/10'}
        transition-colors duration-200
      `}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onBlur={handleBlur}
      tabIndex={0}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: Math.random() * 0.2 // Stagger animation
      }}
    >
      {/* Icon */}
      <div className="text-2xl mb-1 drop-shadow-lg">
        {icon}
      </div>
      
      {/* Title */}
      <div className="text-xs text-white text-center drop-shadow-lg leading-tight">
        <span className="px-1 py-0.5 bg-black/20 rounded backdrop-blur-sm">
          {title}
        </span>
      </div>
    </motion.div>
  );
};

export default DesktopIcon;
import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiSearch } from 'react-icons/fi';

interface TaskbarApp {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
}

interface TaskbarProps {
  apps: TaskbarApp[];
  onAppClick: (appId: string) => void;
  onAppClose: (appId: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ apps, onAppClick, onAppClose }) => {
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-lg border-t border-gray-700"
      initial={{ y: 48 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Start Menu Button */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Start Menu"
          >
            <FiHome size={16} />
          </motion.button>
          
          <motion.button
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Search"
          >
            <FiSearch size={16} />
          </motion.button>
        </div>

        {/* Running Apps */}
        <div className="flex items-center space-x-1 flex-1 mx-4">
          {apps.map(app => (
            <motion.button
              key={app.id}
              className={`
                flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors
                ${app.isMinimized 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
              onClick={() => onAppClick(app.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                onAppClose(app.id);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`${app.title} ${app.isMinimized ? '(Minimized)' : ''}`}
            >
              <span>{app.icon}</span>
              <span className="max-w-32 truncate">{app.title}</span>
            </motion.button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center space-x-3">
          {/* Network Icon */}
          <div className="text-white text-sm">📶</div>
          
          {/* Volume Icon */}
          <div className="text-white text-sm">🔊</div>
          
          {/* Battery Icon */}
          <div className="text-white text-sm">🔋</div>
          
          {/* Clock */}
          <div className="text-white text-sm font-mono">
            {currentTime}
          </div>
          
          {/* Notifications */}
          <motion.button
            className="flex items-center justify-center w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Notifications"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Taskbar;
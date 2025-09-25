import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Taskbar from './Taskbar';
import Window from './Window';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';
import ProjectsApp from '../apps/ProjectsApp';
import MessagesApp from '../apps/MessagesApp';
import SettingsApp from '../apps/SettingsApp';
import WelcomeApp from '../apps/WelcomeApp';

interface DesktopApp {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface DesktopProps {
  children?: React.ReactNode;
  wallpaper?: string;
  user?: any;
  onGetStarted?: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ 
  children, 
  wallpaper = 'data:image/svg+xml,%3Csvg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" stop-color="%23667eea"/%3E%3Cstop offset="100%" stop-color="%23764ba2"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="url(%23bg)"/%3E%3Cg opacity="0.1"%3E%3Ccircle cx="400" cy="200" r="100" fill="white"/%3E%3Ccircle cx="1200" cy="400" r="150" fill="white"/%3E%3Ccircle cx="800" cy="700" r="80" fill="white"/%3E%3C/g%3E%3Ctext x="50%" y="95%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.3"%3ENetBit OS Desktop%3C/text%3E%3C/svg%3E',
  user,
  onGetStarted
}) => {
  const [apps, setApps] = useState<DesktopApp[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  const openApp = useCallback((appConfig: Omit<DesktopApp, 'isOpen' | 'isMinimized' | 'zIndex'>) => {
    setApps(prev => {
      const existingApp = prev.find(app => app.id === appConfig.id);
      if (existingApp) {
        // Bring to front and restore if minimized
        const newZIndex = maxZIndex + 1;
        setMaxZIndex(newZIndex);
        return prev.map(app =>
          app.id === appConfig.id
            ? { ...app, isMinimized: false, zIndex: newZIndex }
            : app
        );
      } else {
        // Create new app window
        const newZIndex = maxZIndex + 1;
        setMaxZIndex(newZIndex);
        return [...prev, {
          ...appConfig,
          isOpen: true,
          isMinimized: false,
          zIndex: newZIndex
        }];
      }
    });
  }, [maxZIndex]);

  const closeApp = useCallback((appId: string) => {
    setApps(prev => prev.filter(app => app.id !== appId));
  }, []);

  const minimizeApp = useCallback((appId: string) => {
    setApps(prev => prev.map(app =>
      app.id === appId ? { ...app, isMinimized: true } : app
    ));
  }, []);

  const focusApp = useCallback((appId: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setApps(prev => prev.map(app =>
      app.id === appId ? { ...app, zIndex: newZIndex, isMinimized: false } : app
    ));
  }, [maxZIndex]);

  const updateAppPosition = useCallback((appId: string, position: { x: number; y: number }) => {
    setApps(prev => prev.map(app =>
      app.id === appId ? { ...app, position } : app
    ));
  }, []);

  const updateAppSize = useCallback((appId: string, size: { width: number; height: number }) => {
    setApps(prev => prev.map(app =>
      app.id === appId ? { ...app, size } : app
    ));
  }, []);

  const handleDesktopRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Auto-open Welcome app on first load
  useEffect(() => {
    if (!user && desktopIcons.length > 0) {
      const welcomeApp = desktopIcons[0];
      openApp({
        id: welcomeApp.id,
        title: welcomeApp.title,
        component: welcomeApp.component,
        icon: welcomeApp.icon,
        position: welcomeApp.position,
        size: welcomeApp.size
      });
    }
  }, [user]);

  const desktopIcons = [
    {
      id: 'welcome',
      title: 'Welcome',
      icon: '👋',
      component: () => <WelcomeApp onGetStarted={onGetStarted} />,
      position: { x: 50, y: 50 },
      size: { width: 600, height: 500 }
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: '📁',
      component: () => <ProjectsApp />,
      position: { x: 100, y: 50 },
      size: { width: 800, height: 600 }
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: '💬',
      component: () => <MessagesApp />,
      position: { x: 50, y: 150 },
      size: { width: 900, height: 600 }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      component: () => <SettingsApp />,
      position: { x: 100, y: 150 },
      size: { width: 800, height: 600 }
    }
  ];

  return (
    <div 
      className="relative w-full h-screen overflow-hidden select-none"
      onContextMenu={handleDesktopRightClick}
      onClick={hideContextMenu}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Desktop Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
      
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-8">
        <div className="grid grid-cols-8 gap-4 w-full">
          {desktopIcons.map((icon, index) => (
            <DesktopIcon
              key={icon.id}
              title={icon.title}
              icon={icon.icon}
              onDoubleClick={() => openApp({
                id: icon.id,
                title: icon.title,
                component: icon.component,
                icon: icon.icon,
                position: icon.position,
                size: icon.size
              })}
            />
          ))}
        </div>
      </div>

      {/* Windows */}
      <AnimatePresence>
        {apps.filter(app => app.isOpen && !app.isMinimized).map(app => (
          <Window
            key={app.id}
            title={app.title}
            position={app.position}
            size={app.size}
            zIndex={app.zIndex}
            onClose={() => closeApp(app.id)}
            onMinimize={() => minimizeApp(app.id)}
            onFocus={() => focusApp(app.id)}
            onPositionChange={(position) => updateAppPosition(app.id, position)}
            onSizeChange={(size) => updateAppSize(app.id, size)}
          >
            <app.component />
          </Window>
        ))}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={hideContextMenu}
            items={[
              { label: 'New Folder', onClick: () => console.log('New Folder') },
              { label: 'Refresh', onClick: () => window.location.reload() },
              { type: 'separator' },
              { label: 'Display Settings', onClick: () => console.log('Display Settings') },
              { label: 'Personalize', onClick: () => console.log('Personalize') }
            ]}
          />
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <Taskbar 
        apps={apps}
        onAppClick={focusApp}
        onAppClose={closeApp}
      />
      
      {children}
    </div>
  );
};

export default Desktop;
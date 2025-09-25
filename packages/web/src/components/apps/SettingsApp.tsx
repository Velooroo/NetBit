import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBell, FiShield, FiMonitor, FiWifi, FiVolume2 } from 'react-icons/fi';

const SettingsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(75);

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'display', label: 'Display', icon: FiMonitor },
    { id: 'network', label: 'Network', icon: FiWifi },
    { id: 'audio', label: 'Audio', icon: FiVolume2 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    U
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Change Photo
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive push notifications on this device</p>
                </div>
                <motion.button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <motion.span
                    className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    animate={{ x: notifications ? 20 : 0 }}
                  />
                </motion.button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                <div className="space-y-3">
                  {['New Messages', 'Project Updates', 'System Alerts', 'Team Mentions'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'display':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-500">Use dark theme across the application</p>
                </div>
                <motion.button
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <motion.span
                    className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    animate={{ x: darkMode ? 20 : 0 }}
                  />
                </motion.button>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Display Scaling</h4>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>100% (Recommended)</option>
                  <option>125%</option>
                  <option>150%</option>
                  <option>175%</option>
                  <option>200%</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Audio Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Volume</h4>
                <div className="flex items-center space-x-4">
                  <FiVolume2 className="text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 w-10">{volume}%</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notification Sounds</h4>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Default</option>
                  <option>Chime</option>
                  <option>Bell</option>
                  <option>Ping</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            <p className="text-gray-600">Select a category from the sidebar to configure settings.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        </div>
        
        <div className="p-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={18} />
                <span className="text-sm">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {renderTabContent()}
        
        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <motion.button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
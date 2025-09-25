import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiBell, FiShield, FiKey, FiMail, FiGlobe, FiTrash2, FiSave, FiX, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface ProfileSettings {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  company: string;
  publicEmail: string;
  hireable: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  activityUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

const SettingsPage: React.FC = () => {
  const { section = 'profile' } = useParams<{ section?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    publicEmail: '',
    hireable: false,
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    activityUpdates: false,
    securityAlerts: true,
    marketingEmails: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setProfileSettings(prev => ({
          ...prev,
          displayName: userData.username,
          publicEmail: userData.email || '',
        }));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'security', name: 'Security', icon: FiShield },
    { id: 'keys', name: 'SSH Keys', icon: FiKey },
    { id: 'emails', name: 'Emails', icon: FiMail },
    { id: 'account', name: 'Account', icon: FiTrash2 },
  ];

  if (!user) {
    return (
      <AnimatedBackground variant="purple" particles={true} particleCount={20} reduced={true}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassCard className="text-center">
            <div className="text-purple-400 mb-4">
              <FiSettings className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Settings not available</h2>
            <p className="text-gray-300 mb-6">Please log in to access your settings.</p>
            <Link to="/login">
              <GlassButton variant="primary" size="lg">
                Sign in
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="blue" particles={true} particleCount={50}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 text-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))',
                textShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
              }}>
            Settings
          </h1>
          <p className="text-blue-200 text-center">Manage your account preferences and configuration</p>
        </motion.div>

        <div className="flex gap-8">
          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-64 flex-shrink-0"
          >
            <GlassCard className="overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiSettings className="mr-2 text-blue-400" />
                  Configuration
                </h2>
              </div>
              <nav className="p-4">
                {sidebarItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={`/settings/${item.id}`}
                      className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                        section === item.id
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40 shadow-lg shadow-blue-500/20'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-4 w-4 ${section === item.id ? 'text-blue-400' : ''}`} />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </GlassCard>
          </motion.div>

          {/* Enhanced Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <GlassCard>
              {/* Enhanced Message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`p-4 mb-6 rounded-xl backdrop-blur-sm border ${
                      message.type === 'success' 
                        ? 'bg-green-500/20 border-green-400/40 text-green-200' 
                        : 'bg-red-500/20 border-red-400/40 text-red-200'
                    }`}
                    style={{
                      boxShadow: message.type === 'success' 
                        ? '0 4px 20px rgba(34, 197, 94, 0.2)'
                        : '0 4px 20px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{message.text}</span>
                      <button
                        onClick={() => setMessage(null)}
                        className="ml-auto text-gray-400 hover:text-white transition-colors"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Settings */}
              {section === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                      <FiUser className="mr-3 text-blue-400" />
                      Public Profile
                    </h3>
                    <p className="text-gray-300">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-purple-300 mb-2">
                        Display name
                      </label>
                      <GlassInput
                        type="text"
                        id="displayName"
                        value={profileSettings.displayName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your display name"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-purple-300 mb-2">
                        Bio
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.02 }}
                        id="bio"
                        rows={3}
                        value={profileSettings.bio}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-4 py-4 bg-slate-700/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-purple-300 mb-2">
                          Location
                        </label>
                        <GlassInput
                          type="text"
                          id="location"
                          value={profileSettings.location}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-purple-300 mb-2">
                          Website
                        </label>
                        <GlassInput
                          type="url"
                          id="website"
                          value={profileSettings.website}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-purple-300 mb-2">
                        Company
                      </label>
                      <GlassInput
                        type="text"
                        id="company"
                        value={profileSettings.company}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company"
                      />
                    </div>

                    <motion.div 
                      className="flex items-center p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        id="hireable"
                        type="checkbox"
                        checked={profileSettings.hireable}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, hireable: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hireable" className="ml-3 block text-sm font-medium text-white">
                        Available for hire
                      </label>
                    </motion.div>

                    <div className="pt-6">
                      <GlassButton
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        loading={isLoading}
                        variant="primary"
                        size="lg"
                        className="flex items-center"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
                          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                        }}
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {!isLoading && 'Save Changes'}
                      </GlassButton>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Notification Settings */}
              {section === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                      <FiBell className="mr-3 text-blue-400" />
                      Notification Preferences
                    </h3>
                    <p className="text-gray-300">
                      Choose how you want to be notified about activity on NetBit.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: 'emailNotifications', title: 'Email notifications', desc: 'Receive email notifications for important updates.' },
                      { key: 'pushNotifications', title: 'Push notifications', desc: 'Receive browser push notifications.' },
                      { key: 'activityUpdates', title: 'Activity updates', desc: 'Get notified about activity on your projects.' },
                      { key: 'securityAlerts', title: 'Security alerts', desc: 'Important security notifications (recommended).' },
                      { key: 'marketingEmails', title: 'Marketing emails', desc: 'Receive emails about new features and updates.' }
                    ].map((setting, index) => (
                      <motion.div
                        key={setting.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex-1">
                          <label htmlFor={setting.key} className="text-sm font-medium text-white cursor-pointer">
                            {setting.title}
                          </label>
                          <p className="text-sm text-gray-400 mt-1">{setting.desc}</p>
                        </div>
                        <motion.input
                          whileTap={{ scale: 0.9 }}
                          id={setting.key}
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof NotificationSettings]}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                        />
                      </motion.div>
                    ))}

                    <div className="pt-6">
                      <GlassButton
                        onClick={handleSaveNotifications}
                        disabled={isLoading}
                        loading={isLoading}
                        variant="primary"
                        size="lg"
                        className="flex items-center"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
                          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                        }}
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {!isLoading && 'Save Preferences'}
                      </GlassButton>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Other sections placeholder */}
              {!['profile', 'notifications'].includes(section) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-12 text-center"
                >
                  <div className="text-blue-400 mb-4">
                    {React.createElement(sidebarItems.find(item => item.id === section)?.icon || FiSettings, { className: "h-16 w-16 mx-auto mb-4" })}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {sidebarItems.find(item => item.id === section)?.name || 'Settings'}
                  </h3>
                  <p className="text-gray-300 mb-6">This section is coming soon with exciting features.</p>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default SettingsPage;
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiBell, FiShield, FiKey, FiMail, FiGlobe, FiTrash2, FiSave, FiX } from 'react-icons/fi';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Settings not available</h2>
          <p className="mt-2 text-gray-600">Please log in to access your settings.</p>
          <Link to="/login" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Settings</h2>
              </div>
              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/settings/${item.id}`}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      section === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Message */}
              {message && (
                <div className={`p-4 border-b ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    <span className="text-sm">{message.text}</span>
                    <button
                      onClick={() => setMessage(null)}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Settings */}
              {section === 'profile' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Public profile</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        Display name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={profileSettings.displayName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        value={profileSettings.bio}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          value={profileSettings.location}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, location: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          value={profileSettings.website}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={profileSettings.company}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        id="hireable"
                        type="checkbox"
                        checked={profileSettings.hireable}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, hireable: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hireable" className="ml-2 block text-sm text-gray-900">
                        Available for hire
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {isLoading ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {section === 'notifications' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Notification preferences</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Choose how you want to be notified about activity on NetBit.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900">
                          Email notifications
                        </label>
                        <p className="text-sm text-gray-600">Receive email notifications for important updates.</p>
                      </div>
                      <input
                        id="emailNotifications"
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-900">
                          Push notifications
                        </label>
                        <p className="text-sm text-gray-600">Receive browser push notifications.</p>
                      </div>
                      <input
                        id="pushNotifications"
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="activityUpdates" className="text-sm font-medium text-gray-900">
                          Activity updates
                        </label>
                        <p className="text-sm text-gray-600">Get notified about activity on your projects.</p>
                      </div>
                      <input
                        id="activityUpdates"
                        type="checkbox"
                        checked={notificationSettings.activityUpdates}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, activityUpdates: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="securityAlerts" className="text-sm font-medium text-gray-900">
                          Security alerts
                        </label>
                        <p className="text-sm text-gray-600">Important security notifications (recommended).</p>
                      </div>
                      <input
                        id="securityAlerts"
                        type="checkbox"
                        checked={notificationSettings.securityAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="marketingEmails" className="text-sm font-medium text-gray-900">
                          Marketing emails
                        </label>
                        <p className="text-sm text-gray-600">Receive emails about new features and updates.</p>
                      </div>
                      <input
                        id="marketingEmails"
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {isLoading ? 'Saving...' : 'Save preferences'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other sections placeholder */}
              {!['profile', 'notifications'].includes(section) && (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {sidebarItems.find(item => item.id === section)?.name || 'Settings'}
                  </h3>
                  <p className="text-gray-600">This section is coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
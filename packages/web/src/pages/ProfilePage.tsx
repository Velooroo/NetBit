import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiLink, FiCalendar, FiMail, FiGithub, FiSettings, FiEdit3, FiFolder, FiStar, FiUsers, FiMessageCircle, FiGrid } from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface ProfileStats {
  projects: number;
  repositories: number;
  followers: number;
  following: number;
  contributions: number;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    projects: 0,
    repositories: 0,
    followers: 0,
    following: 0,
    contributions: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Mock stats for now
    setStats({
      projects: 3,
      repositories: 5,
      followers: 12,
      following: 8,
      contributions: 247
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Please log in to view your profile.</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            
            {/* Profile Info */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative -mt-12">
                    <div className="h-24 w-24 rounded-full bg-gray-700 border-4 border-white flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                    <p className="text-gray-600">Full Stack Developer</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        San Francisco, CA
                      </div>
                      <div className="flex items-center">
                        <FiLink className="h-4 w-4 mr-1" />
                        <a href="#" className="text-blue-600 hover:underline">website.com</a>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="h-4 w-4 mr-1" />
                        Joined December 2023
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-1">
                        <FiUsers className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{stats.followers}</span>
                        <span className="text-gray-600">followers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-900">{stats.following}</span>
                        <span className="text-gray-600">following</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiStar className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{stats.contributions}</span>
                        <span className="text-gray-600">contributions this year</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <Link
                  to="/settings/profile"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit3 className="h-4 w-4 mr-2" />
                  Edit profile
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: FiGrid },
                { id: 'projects', name: 'Projects', icon: FiFolder, count: stats.projects },
                { id: 'repositories', name: 'Repositories', icon: FiGithub, count: stats.repositories },
                { id: 'messages', name: 'Messages', icon: FiMessageCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Created repository <span className="font-medium">my-web-project/main-app</span>
                        </span>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Created project <span className="font-medium">my-web-project</span>
                        </span>
                        <span className="text-xs text-gray-400">1 day ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Joined NetBit
                        </span>
                        <span className="text-xs text-gray-400">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contribution Graph */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {stats.contributions} contributions in the last year
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {/* Legend */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">Less</span>
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-gray-200 rounded-sm"></div>
                        <div className="h-3 w-3 bg-green-200 rounded-sm"></div>
                        <div className="h-3 w-3 bg-green-300 rounded-sm"></div>
                        <div className="h-3 w-3 bg-green-400 rounded-sm"></div>
                        <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
                      </div>
                      <span className="text-sm text-gray-500">More</span>
                    </div>
                    
                    {/* Contribution grid - GitHub style with weeks */}
                    <div className="overflow-x-auto">
                      <div className="inline-flex flex-col space-y-1">
                        {/* Day labels */}
                        <div className="flex space-x-1 mb-2">
                          <div className="w-3"></div> {/* Spacer for day labels */}
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                            <div key={month} className="text-xs text-gray-500 w-8 text-center" style={{ marginLeft: i === 0 ? '0' : '16px' }}>
                              {month}
                            </div>
                          ))}
                        </div>
                        
                        {/* Days of week labels + contribution grid */}
                        <div className="flex">
                          {/* Day labels */}
                          <div className="flex flex-col space-y-1 mr-2">
                            <div className="h-3"></div> {/* Spacer */}
                            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                              <div key={i} className="text-xs text-gray-500 h-3 flex items-center">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Contribution squares - 53 weeks * 7 days */}
                          <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ gridTemplateColumns: 'repeat(53, 12px)' }}>
                            {Array.from({ length: 371 }).map((_, i) => {
                              const intensity = Math.random();
                              let bgColor = 'bg-gray-200';
                              if (intensity > 0.8) bgColor = 'bg-green-500';
                              else if (intensity > 0.6) bgColor = 'bg-green-400';
                              else if (intensity > 0.4) bgColor = 'bg-green-300';
                              else if (intensity > 0.2) bgColor = 'bg-green-200';
                              
                              return (
                                <div
                                  key={i}
                                  className={`h-3 w-3 rounded-sm ${bgColor} hover:ring-1 hover:ring-gray-400 cursor-pointer transition-all`}
                                  title={`${Math.floor(intensity * 10)} contributions`}
                                ></div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Contribution activity over the past year
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Projects ({stats.projects})</h3>
                <div className="text-center py-8">
                  <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects to show</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Projects you create will appear here.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/create-project"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiFolder className="mr-2 h-4 w-4" />
                      Create project
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Repositories ({stats.repositories})</h3>
                <div className="text-center py-8">
                  <FiGithub className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories to show</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Repositories you create will appear here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
                <div className="text-center py-8">
                  <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a conversation with other developers.
                  </p>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <FiMessageCircle className="mr-2 h-4 w-4" />
                      New message
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
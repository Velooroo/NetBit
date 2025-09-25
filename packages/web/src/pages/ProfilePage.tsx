import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiLink, FiCalendar, FiMail, FiGithub, FiSettings, FiEdit3, FiFolder, FiStar, FiUsers, FiMessageCircle, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton } from '../components/ui';

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
      <AnimatedBackground variant="purple" particles={true}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassCard className="text-center">
            <div className="text-purple-400 mb-4">
              <FiUsers className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
            <p className="text-gray-300 mb-6">Please log in to view your profile.</p>
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
    <AnimatedBackground variant="dark" particles={true} particleCount={40}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="relative overflow-hidden">
            {/* Animated Cover Photo */}
            <motion.div 
              className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '300% 300%',
              }}
            />
            
            {/* Profile Info */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative -mt-12">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-4 border-white shadow-lg flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* User Info */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4"
                  >
                    <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                    <p className="text-purple-300 text-lg">Full Stack Developer</p>
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-300">
                      <div className="flex items-center">
                        <FiMapPin className="h-4 w-4 mr-1 text-purple-400" />
                        San Francisco, CA
                      </div>
                      <div className="flex items-center">
                        <FiLink className="h-4 w-4 mr-1 text-purple-400" />
                        <a href="#" className="text-purple-300 hover:text-purple-200 transition-colors">website.com</a>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="h-4 w-4 mr-1 text-purple-400" />
                        Joined December 2023
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-8 mt-6">
                      {[
                        { icon: FiUsers, value: stats.followers, label: 'followers', color: 'text-blue-400' },
                        { value: stats.following, label: 'following', color: 'text-green-400' },
                        { icon: FiStar, value: stats.contributions, label: 'contributions', color: 'text-yellow-400' }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          {stat.icon && <stat.icon className={`h-4 w-4 ${stat.color}`} />}
                          <span className="font-bold text-white text-lg">{stat.value}</span>
                          <span className="text-gray-400">{stat.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                {/* Edit Profile Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to="/settings/profile">
                    <GlassButton variant="secondary" size="md" className="flex items-center">
                      <FiEdit3 className="h-4 w-4 mr-2" />
                      Edit profile
                    </GlassButton>
                  </Link>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <GlassCard padding="sm">
            <nav className="flex space-x-8" aria-label="Tabs">
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
                      ? 'border-purple-400 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-purple-500/30 text-purple-200 py-0.5 px-2.5 rounded-full text-xs font-medium backdrop-blur-sm">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </GlassCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiStar className="mr-2 text-purple-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      { color: 'bg-green-500', text: 'Created repository', repo: 'my-web-project/main-app', time: '2 hours ago' },
                      { color: 'bg-blue-500', text: 'Created project', repo: 'my-web-project', time: '1 day ago' },
                      { color: 'bg-purple-500', text: 'Joined NetBit', time: '3 days ago' }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
                      >
                        <div className={`h-3 w-3 ${activity.color} rounded-full shadow-lg`}></div>
                        <span className="text-gray-300">
                          {activity.text} {activity.repo && <span className="font-medium text-white">{activity.repo}</span>}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Contribution Graph */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <FiGithub className="mr-2 text-purple-400" />
                    {stats.contributions} contributions in the last year
                  </h3>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                    {/* Simplified contribution visualization for better mobile experience */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-400 mb-2">{stats.contributions}</div>
                      <div className="text-gray-300">Total contributions this year</div>
                      <div className="mt-6 grid grid-cols-12 gap-1">
                        {Array.from({ length: 52 }).map((_, i) => {
                          const intensity = Math.random();
                          let bgColor = 'bg-gray-600';
                          if (intensity > 0.8) bgColor = 'bg-purple-400';
                          else if (intensity > 0.6) bgColor = 'bg-purple-500';
                          else if (intensity > 0.4) bgColor = 'bg-purple-600';
                          else if (intensity > 0.2) bgColor = 'bg-purple-700';
                          
                          return (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.01 }}
                              className={`h-3 w-full rounded-sm ${bgColor} hover:scale-110 transition-transform cursor-pointer`}
                              title={`Week ${i + 1}: ${Math.floor(intensity * 10)} contributions`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="text-center py-12">
                <FiFolder className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No projects to show</h3>
                <p className="text-gray-400 mb-6">
                  Projects you create will appear here.
                </p>
                <Link to="/create-project">
                  <GlassButton variant="primary" size="lg" className="flex items-center mx-auto">
                    <FiFolder className="mr-2 h-4 w-4" />
                    Create project
                  </GlassButton>
                </Link>
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="text-center py-12">
                <FiGithub className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No repositories to show</h3>
                <p className="text-gray-400">
                  Repositories you create will appear here.
                </p>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <FiMessageCircle className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
                <p className="text-gray-400 mb-6">
                  Start a conversation with other developers.
                </p>
                <GlassButton variant="primary" size="lg" className="flex items-center mx-auto">
                  <FiMessageCircle className="mr-2 h-4 w-4" />
                  New message
                </GlassButton>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GitBranch, 
  Plus, 
  Star, 
  GitFork, 
  Clock, 
  Users,
  Search,
  BarChart3,
  MessageSquare,
  Activity
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  owner: {
    username: string;
    full_name: string | null;
  };
  stats: {
    stars: number;
    forks: number;
    commits: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'commit' | 'message' | 'repo_created';
  title: string;
  description: string;
  timestamp: string;
  repository?: string;
}

const HomePage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load repositories
      const reposResponse = await fetch('http://localhost:8000/api/repositories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData.data || []);
      }

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: 1,
          type: 'commit',
          title: 'Initial commit',
          description: 'Added project structure and basic configuration',
          timestamp: '2024-01-15T10:30:00Z',
          repository: 'my-project'
        },
        {
          id: 2,
          type: 'message',
          title: 'Team discussion',
          description: 'Discussed new feature implementation in dev chat',
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: 3,
          type: 'repo_created',
          title: 'Repository created',
          description: 'Created new repository: awesome-api',
          timestamp: '2024-01-14T16:45:00Z',
          repository: 'awesome-api'
        }
      ]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitBranch className="w-4 h-4 text-green-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'repo_created':
        return <Plus className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back to NetBit!</h1>
                <p className="text-blue-100 text-lg">
                  Your unified development platform for Git repositories and team collaboration
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-lg p-4">
                  <BarChart3 className="w-12 h-12" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span className="font-medium">{repositories.length} Repositories</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Active Chats</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Team Collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repositories Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your Repositories</h2>
                  <Link
                    to="/repo/new"
                    className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Repository</span>
                  </Link>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredRepositories.length === 0 ? (
                  <div className="p-8 text-center">
                    <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Try adjusting your search terms.' : 'Create your first repository to get started.'}
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/repo/new"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Repository</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredRepositories.map(repo => (
                    <div key={repo.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Link
                              to={`/repo/${repo.name}`}
                              className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {repo.name}
                            </Link>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              repo.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {repo.is_public ? 'Public' : 'Private'}
                            </span>
                          </div>
                          
                          {repo.description && (
                            <p className="text-gray-600 mb-3">{repo.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>{repo.stats?.stars || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GitFork className="w-4 h-4" />
                              <span>{repo.stats?.forks || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Updated {formatDate(repo.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                          {activity.repository && (
                            <Link
                              to={`/repo/${activity.repository}`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {activity.repository}
                            </Link>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/repo/new"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Repository</p>
                    <p className="text-sm text-gray-500">Create a new project</p>
                  </div>
                </Link>
                
                <Link
                  to="/chat"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Team Chat</p>
                    <p className="text-sm text-gray-500">Join the conversation</p>
                  </div>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Your Profile</p>
                    <p className="text-sm text-gray-500">View your stats</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
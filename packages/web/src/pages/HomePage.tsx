import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGitBranch, FiStar, FiClock, FiPlus, FiGithub, FiSettings, FiTrash2, FiEye, FiLock, FiUnlock } from 'react-icons/fi';
import { FaCodeBranch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton } from '../components/ui';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  stars_count?: number;
  forks_count?: number;
  is_private?: boolean;
  language?: string;
  size?: string;
  last_commit?: string;
}

interface ApiResponse {
  success: boolean;
  message: string | null;
  data: Repository[] | null;
}

const HomePage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'stars'>('updated');

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/repos', {
          headers: {
            'Authorization': `Basic ${btoa('Kazilsky:password123')}`
          }
        });

        const data: ApiResponse = await response.json();
        
        if (data.success && data.data) {
          // Enhanced mock data for demonstration
          const reposWithStats = data.data.map((repo, index) => ({
            ...repo,
            stars_count: Math.floor(Math.random() * 100),
            forks_count: Math.floor(Math.random() * 50),
            is_private: Math.random() > 0.7,
            language: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'][index % 5],
            size: ['2.4 MB', '15.8 MB', '892 KB', '5.2 MB', '1.1 MB'][index % 5],
            last_commit: ['2 hours ago', '1 day ago', '3 days ago', '1 week ago', '2 weeks ago'][index % 5]
          }));
          setRepositories(reposWithStats);
        } else {
          setError(data.message || 'Failed to fetch repositories');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Filter and sort repositories
  const filteredAndSortedRepositories = repositories
    .filter(repo => {
      if (filter === 'public') return !repo.is_private;
      if (filter === 'private') return repo.is_private;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return (b.stars_count || 0) - (a.stars_count || 0);
        case 'updated':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <AnimatedBackground variant="dark" particles={true} particleCount={15} reduced={true}>
        <div className="flex justify-center items-center min-h-screen">
          <GlassCard className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Loading repositories...</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  if (error) {
    return (
      <AnimatedBackground variant="dark" particles={true} particleCount={15} reduced={true}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full text-center">
            <div className="text-red-400 mb-4">
              <FiGithub className="h-12 w-12 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Error loading repositories</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <GlassButton 
              variant="primary" 
              onClick={() => window.location.reload()}
              className="flex items-center mx-auto"
            >
              Try Again
            </GlassButton>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="dark" particles={true} particleCount={20} reduced={true}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))',
                  textShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
                }}>
              Repository Management
            </h1>
            <p className="text-purple-200">
              Manage and organize your Git repositories
            </p>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <FiGithub className="h-5 w-5 text-purple-400" />
                <span className="text-sm">
                  {filteredAndSortedRepositories.length} {filteredAndSortedRepositories.length === 1 ? 'repository' : 'repositories'}
                </span>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'public' | 'private')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'updated' | 'stars')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="updated">Last Updated</option>
                  <option value="name">Name</option>
                  <option value="stars">Stars</option>
                </select>
              </div>

              <Link to="/create-repo">
                <GlassButton variant="primary" size="md" className="flex items-center">
                  <FiPlus className="mr-2" />
                  New Repository
                </GlassButton>
              </Link>
            </div>
          </div>
        </motion.div>

        {filteredAndSortedRepositories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="text-center py-16">
              <div className="text-purple-400 mb-6">
                <FiGithub className="h-20 w-20 mx-auto mb-4" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">No repositories found</h3>
              <p className="text-gray-300 mb-8">
                {filter !== 'all' 
                  ? `No ${filter} repositories match your criteria.` 
                  : 'Get started by creating your first repository.'}
              </p>
              {filter !== 'all' ? (
                <GlassButton 
                  variant="secondary" 
                  onClick={() => setFilter('all')}
                  className="mr-4"
                >
                  Show All
                </GlassButton>
              ) : null}
              <Link to="/create-repo">
                <GlassButton variant="primary" size="lg" className="flex items-center mx-auto">
                  <FiPlus className="mr-2 h-5 w-5" />
                  Create Repository
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredAndSortedRepositories.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Link to={`/repo/${repo.name}`} className="block h-full">
                    <GlassCard 
                      className="h-full hover:bg-black/40 transition-all duration-200 hover:scale-[1.02] group" 
                      animate={false}
                    >
                      {/* Repository Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200">
                            <FiGitBranch className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                                {repo.name}
                              </h3>
                              <div className="flex-shrink-0">
                                {repo.is_private ? (
                                  <FiLock className="h-4 w-4 text-orange-400" title="Private" />
                                ) : (
                                  <FiUnlock className="h-4 w-4 text-green-400" title="Public" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-white/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle settings
                            }}
                          >
                            <FiSettings className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Repository Description */}
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {repo.description || 'No description provided'}
                      </p>
                      
                      {/* Repository Metadata */}
                      <div className="space-y-3 mb-4">
                        {repo.language && (
                          <div className="flex items-center text-xs text-gray-400">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              repo.language === 'JavaScript' ? 'bg-yellow-400' :
                              repo.language === 'TypeScript' ? 'bg-blue-400' :
                              repo.language === 'Python' ? 'bg-green-400' :
                              repo.language === 'Go' ? 'bg-cyan-400' :
                              'bg-orange-400'
                            }`} />
                            <span>{repo.language}</span>
                            {repo.size && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{repo.size}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {repo.last_commit && (
                          <div className="flex items-center text-xs text-gray-400">
                            <FiClock className="mr-2 h-3 w-3" />
                            <span>Updated {repo.last_commit}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Repository Stats */}
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <div className="flex space-x-4">
                          <span className="inline-flex items-center text-sm text-gray-400">
                            <FiStar className="mr-1 text-yellow-400" />
                            {repo.stars_count}
                          </span>
                          <span className="inline-flex items-center text-sm text-gray-400">
                            <FaCodeBranch className="mr-1 text-blue-400" />
                            {repo.forks_count}
                          </span>
                        </div>
                        <span className="inline-flex items-center text-sm text-gray-400">
                          {new Date(repo.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Enhanced Glassmorphism Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="text-center" padding="sm">
            <p className="text-gray-300 text-sm flex items-center justify-center">
              <FiGithub className="mr-2 h-4 w-4 text-purple-400" />
              &copy; {new Date().getFullYear()} NetBit Repository Management. Built for developers.
            </p>
          </GlassCard>
        </div>
      </motion.footer>
    </AnimatedBackground>
  );
};

export default HomePage;

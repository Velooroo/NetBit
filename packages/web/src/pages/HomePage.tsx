import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGitBranch, FiStar, FiClock, FiPlus } from 'react-icons/fi';
import { FaCodeBranch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton } from '../components/ui';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  stars_count?: number;
  forks_count?: number;
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
          // Добавляем mock-данные для демонстрации
          const reposWithStats = data.data.map(repo => ({
            ...repo,
            stars_count: Math.floor(Math.random() * 100),
            forks_count: Math.floor(Math.random() * 50)
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

  if (loading) {
    return (
      <AnimatedBackground variant="dark" particles={true} particleCount={30}>
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
      <AnimatedBackground variant="dark" particles={true} particleCount={30}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full text-center">
            <div className="text-red-400 mb-4">
              <svg className="h-12 w-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Error fetching repositories</h3>
            <p className="text-gray-300">{error}</p>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="dark" particles={true} particleCount={30}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Repositories</h2>
            <p className="text-gray-300">
              {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
            </p>
          </div>
          <Link to="/create-repo">
            <GlassButton variant="primary" size="md" className="flex items-center">
              <FiPlus className="mr-2" />
              New Repository
            </GlassButton>
          </Link>
        </motion.div>

        {repositories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-purple-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-medium text-white mb-2">No repositories</h3>
              <p className="text-gray-300 mb-6">
                Get started by creating a new repository.
              </p>
              <Link to="/create-repo">
                <GlassButton variant="primary" size="lg" className="flex items-center mx-auto">
                  <FiPlus className="mr-2 h-5 w-5" />
                  New Repository
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/repo/${repo.name}`} className="block h-full">
                  <GlassCard 
                    className="h-full hover:bg-black/40 transition-all duration-200 hover:scale-[1.02] group" 
                    animate={false}
                  >
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200">
                        <FiGitBranch className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {repo.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {repo.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    
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
                        <FiClock className="mr-1 text-purple-400" />
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
          </div>
        )}
      </main>

      {/* Glassmorphism Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="text-center" padding="sm">
            <p className="text-gray-300 text-sm">
              &copy; {new Date().getFullYear()} NetBit. Made with ❤️ for developers.
            </p>
          </GlassCard>
        </div>
      </motion.footer>
    </AnimatedBackground>
  );
};

export default HomePage;

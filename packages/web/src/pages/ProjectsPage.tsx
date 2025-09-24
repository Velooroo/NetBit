import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiStar, FiGitBranch, FiPlus, FiLock, FiUnlock, FiSearch, FiFilter, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';
import { apiRequest } from '../lib/api';

interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  is_public: boolean;
  created_at: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiRequest<Project[]>('http://localhost:8000/api/projects');
        
        if (response.success && response.data) {
          setProjects(response.data);
        } else {
          setError(response.message || 'Failed to fetch projects');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && project.is_public) ||
                         (filterType === 'private' && !project.is_public);
    
    return matchesSearch && matchesFilter;
  });

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
            <p className="text-white text-lg">Loading projects...</p>
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
            <h3 className="text-xl font-medium text-white mb-2">Error loading projects</h3>
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
          className="mb-8"
        >
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                <p className="text-gray-300">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
              <Link to="/create-project">
                <GlassButton variant="primary" size="md" className="flex items-center">
                  <FiPlus className="mr-2 h-4 w-4" />
                  New Project
                </GlassButton>
              </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <GlassInput
                  type="text"
                  placeholder="Find a project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="h-4 w-4 text-purple-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-3 pr-10 py-4 text-white bg-slate-700/30 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredProjects.length === 0 ? (
            <GlassCard className="text-center py-12">
              <FiBookOpen className="mx-auto h-16 w-16 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || filterType !== 'all' ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-300 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter.' 
                  : 'Get started by creating a new project.'}
              </p>
              {(!searchTerm && filterType === 'all') && (
                <Link to="/create-project">
                  <GlassButton variant="primary" size="lg" className="flex items-center mx-auto">
                    <FiPlus className="mr-2 h-5 w-5" />
                    New project
                  </GlassButton>
                </Link>
              )}
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="hover:bg-black/40 transition-all duration-200 hover:scale-[1.02] group" animate={false}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200">
                            <FiFolder className="h-5 w-5 text-white" />
                          </div>
                          <Link 
                            to={`/projects/${project.name}`}
                            className="text-purple-300 hover:text-purple-200 font-bold text-lg hover:underline transition-colors flex-1"
                          >
                            {project.name}
                          </Link>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            project.is_public 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          }`}>
                            {project.is_public ? (
                              <>
                                <FiUnlock className="mr-1 h-3 w-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <FiLock className="mr-1 h-3 w-3" />
                                Private
                              </>
                            )}
                          </span>
                        </div>
                        
                        {project.description && (
                          <p className="text-gray-400 text-sm mb-4 leading-relaxed ml-12">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-xs text-gray-400 ml-12 pt-3 border-t border-white/10">
                          <span className="flex items-center">
                            <FiStar className="mr-1 h-3 w-3 text-yellow-400" />
                            0
                          </span>
                          <span className="flex items-center">
                            <FiGitBranch className="mr-1 h-3 w-3 text-blue-400" />
                            0 repositories
                          </span>
                          <span className="flex items-center">
                            Updated {new Date(project.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </AnimatedBackground>
  );
};

export default ProjectsPage;
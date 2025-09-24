import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiStar, FiGitBranch, FiPlus, FiLock, FiUnlock, FiSearch, FiFilter, FiBookOpen } from 'react-icons/fi';
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading projects</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
              <p className="mt-1 text-sm text-gray-600">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <Link 
              to="/create-project" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Find a project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filterType !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter.' 
                : 'Get started by creating a new project.'}
            </p>
            {(!searchTerm && filterType === 'all') && (
              <div className="mt-6">
                <Link
                  to="/create-project"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  New project
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiFolder className="h-4 w-4 text-gray-500" />
                      <Link 
                        to={`/projects/${project.name}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-base hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        project.is_public 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
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
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FiStar className="mr-1 h-3 w-3" />
                        0
                      </span>
                      <span className="flex items-center">
                        <FiGitBranch className="mr-1 h-3 w-3" />
                        0 repositories
                      </span>
                      <span>
                        Updated {new Date(project.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
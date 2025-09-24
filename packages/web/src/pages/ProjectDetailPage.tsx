import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiFolder, FiPlus, FiGitBranch, FiStar, FiClock, FiLock, FiUnlock, FiSettings, FiArrowLeft } from 'react-icons/fi';
import { apiRequest } from '../lib/api';

interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  is_public: boolean;
  created_at: string;
}

interface Repository {
  id: number;
  name: string;
  project_id: number;
  description: string | null;
  is_private: boolean;
  clone_url: string;
  size: number;
  created_at: string;
}

interface ProjectDetails {
  project: Project;
  repositories: Repository[];
  config: any;
  owner: any;
}

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

const ProjectDetailPage: React.FC = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    is_public: true,
  });
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectName) return;

      try {
        // Assuming the username is Kazilsky for now - in a real app this would come from auth context
        const response = await apiRequest<ProjectDetails>(`http://localhost:8000/api/projects/Kazilsky/${projectName}`);
        
        if (response.success && response.data) {
          setProjectDetails(response.data);
        } else {
          setError(response.message || 'Failed to fetch project details');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectName]);

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    setIsCreatingRepo(true);
    try {
      const response = await apiRequest<Repository>(`http://localhost:8000/api/projects/Kazilsky/${projectName}/repos/create`, {
        method: 'POST',
        body: JSON.stringify(newRepo),
      });

      if (response.success && response.data) {
        // Refresh project details to show the new repository
        window.location.reload();
      } else {
        setError(response.message || 'Failed to create repository');
      }
    } catch (err) {
      setError('Error creating repository');
      console.error(err);
    } finally {
      setIsCreatingRepo(false);
      setShowCreateRepo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading project</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    );
  }

  const { project, repositories } = projectDetails;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiArrowLeft className="mr-1 h-4 w-4" />
                Back to projects
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/repositories" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Repositories
              </Link>
              <Link to="/profile" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Profile
              </Link>
              <Link to="/settings" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">          
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 rounded-lg p-3 mr-4">
                <FiFolder className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">{project.name}</h1>
                  {project.is_public ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <FiUnlock className="mr-1 h-3 w-3" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      <FiLock className="mr-1 h-3 w-3" />
                      Private
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-600 mb-2 max-w-2xl">{project.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <FiSettings className="mr-2 h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Repositories ({repositories.length})
              </h3>
              <button
                onClick={() => setShowCreateRepo(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                New Repository
              </button>
            </div>
          </div>

          {repositories.length === 0 ? (
            <div className="text-center py-12">
              <FiGitBranch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No repositories</h3>
              <p className="text-sm text-gray-500 mb-6">
                Get started by creating a new repository in this project.
              </p>
              <button
                onClick={() => setShowCreateRepo(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                New Repository
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {repositories.map((repo) => (
                <div key={repo.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <Link to={`/projects/${project.name}/${repo.name}`} className="block">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <FiGitBranch className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-blue-600 font-medium hover:underline text-sm">
                            {repo.name}
                          </h4>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 ml-4">
                        <span className="flex items-center">
                          <FiStar className="mr-1 h-4 w-4" />
                          0
                        </span>
                        <span className="flex items-center whitespace-nowrap">
                          <FiClock className="mr-1 h-4 w-4" />
                          {new Date(repo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Repository Modal */}
        {showCreateRepo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Repository</h3>
                <form onSubmit={handleCreateRepository} className="space-y-4">
                  <div>
                    <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Repository name
                    </label>
                    <input
                      type="text"
                      id="repo-name"
                      required
                      value={newRepo.name}
                      onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="my-repository"
                    />
                  </div>
                  <div>
                    <label htmlFor="repo-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="repo-description"
                      rows={3}
                      value={newRepo.description}
                      onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="A brief description..."
                    />
                  </div>
                  <div>
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-2">Visibility</legend>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="repo-visibility"
                            checked={newRepo.is_public}
                            onChange={() => setNewRepo({ ...newRepo, is_public: true })}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Public</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="repo-visibility"
                            checked={!newRepo.is_public}
                            onChange={() => setNewRepo({ ...newRepo, is_public: false })}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Private</span>
                        </label>
                      </div>
                    </fieldset>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateRepo(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingRepo || !newRepo.name}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {isCreatingRepo ? 'Creating...' : 'Create Repository'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetailPage;
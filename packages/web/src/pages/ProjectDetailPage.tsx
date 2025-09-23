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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to projects
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiFolder className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <div className="ml-3">
                    {project.is_public ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiUnlock className="mr-1 h-3 w-3" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiLock className="mr-1 h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>
                </div>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FiSettings className="mr-2 h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Repositories ({repositories.length})
              </h3>
              <button
                onClick={() => setShowCreateRepo(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2" />
                New Repository
              </button>
            </div>

            {repositories.length === 0 ? (
              <div className="text-center py-8">
                <FiGitBranch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new repository in this project.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateRepo(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                    New Repository
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {repositories.map((repo) => (
                  <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <Link to={`/projects/${project.name}/${repo.name}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiGitBranch className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{repo.name}</h4>
                            {repo.description && (
                              <p className="text-sm text-gray-500">{repo.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiStar className="mr-1 h-4 w-4" />
                            0
                          </span>
                          <span className="flex items-center">
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
        </div>

        {/* Create Repository Modal */}
        {showCreateRepo && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Repository</h3>
                <form onSubmit={handleCreateRepository} className="space-y-4">
                  <div>
                    <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700">
                      Repository name
                    </label>
                    <input
                      type="text"
                      id="repo-name"
                      required
                      value={newRepo.name}
                      onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="my-repository"
                    />
                  </div>
                  <div>
                    <label htmlFor="repo-description" className="block text-sm font-medium text-gray-700">
                      Description (optional)
                    </label>
                    <textarea
                      id="repo-description"
                      rows={3}
                      value={newRepo.description}
                      onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="A brief description..."
                    />
                  </div>
                  <div>
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Visibility</legend>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="repo-visibility"
                            checked={newRepo.is_public}
                            onChange={() => setNewRepo({ ...newRepo, is_public: true })}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Public</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="repo-visibility"
                            checked={!newRepo.is_public}
                            onChange={() => setNewRepo({ ...newRepo, is_public: false })}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Private</span>
                        </label>
                      </div>
                    </fieldset>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateRepo(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingRepo || !newRepo.name}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiLock, FiUnlock, FiInfo } from 'react-icons/fi';
import { apiRequest } from '../lib/api';

interface CreateProjectRequest {
  name: string;
  description?: string;
  is_public: boolean;
}

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    is_public: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<any>('http://localhost:8000/api/projects/create', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success && response.data) {
        // Redirect to the newly created project
        navigate(`/projects/${response.data.name}`);
      } else {
        setError(response.message || 'Failed to create project');
      }
    } catch (err: any) {
      setError('Error connecting to the server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isValidProjectName = (name: string) => {
    return /^[a-zA-Z0-9][a-zA-Z0-9\-_]*[a-zA-Z0-9]$/.test(name) && name.length >= 2 && name.length <= 50;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create a new project</h1>
          <p className="mt-2 text-sm text-gray-600">
            A project contains repositories, team members, and project-level settings.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project name *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  <FiFolder className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 block w-full rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="my-awesome-project"
                  maxLength={50}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be 2-50 characters, start and end with alphanumeric characters, may contain hyphens and underscores.
              </p>
              {formData.name && !isValidProjectName(formData.name) && (
                <p className="mt-1 text-xs text-red-600">
                  Project name is invalid
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="A brief description of your project..."
                  maxLength={500}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Optional. Briefly describe your project's purpose.
              </p>
            </div>

            {/* Visibility */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </legend>
                <div className="space-y-3">
                  <label className="relative flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="is_public"
                        value="true"
                        checked={formData.is_public === true}
                        onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <div className="flex items-center">
                        <FiUnlock className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-medium text-gray-900">Public</span>
                      </div>
                      <p className="text-gray-500">Anyone can see this project</p>
                    </div>
                  </label>
                  <label className="relative flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="is_public"
                        value="false"
                        checked={formData.is_public === false}
                        onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <div className="flex items-center">
                        <FiLock className="h-4 w-4 text-red-500 mr-1" />
                        <span className="font-medium text-gray-900">Private</span>
                      </div>
                      <p className="text-gray-500">Only you and collaborators can see this project</p>
                    </div>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !formData.name || !isValidProjectName(formData.name)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
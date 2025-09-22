import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  GitBranch, 
  Lock, 
  Globe, 
  Users, 
  FileText, 
  Tag,
  AlertCircle,
  Check
} from 'lucide-react';

interface CreateRepoFormData {
  name: string;
  description: string;
  projectId: number | null;
  isPublic: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
}

const CreateRepoPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<CreateRepoFormData>({
    name: '',
    description: '',
    projectId: null,
    isPublic: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    // Load user's projects
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const validateRepoName = (name: string): string | null => {
    if (!name) return null;
    
    if (name.length < 2) {
      return 'Repository name must be at least 2 characters long';
    }
    
    if (name.length > 100) {
      return 'Repository name must be less than 100 characters';
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      return 'Repository name can only contain letters, numbers, dots, hyphens, and underscores';
    }
    
    if (name.startsWith('.') || name.endsWith('.')) {
      return 'Repository name cannot start or end with a dot';
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'projectId') {
      setFormData(prev => ({
        ...prev,
        projectId: value === '' ? null : parseInt(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Validate repo name in real-time
      if (name === 'name') {
        setNameError(validateRepoName(value));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final validation
    const nameValidationError = validateRepoName(formData.name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    if (!formData.projectId) {
      setError('Please select a project for this repository');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          project_id: formData.projectId,
          is_public: formData.isPublic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the new repository
        navigate(`/repo/${formData.name}`);
      } else {
        setError(data.message || 'Failed to create repository');
      }
    } catch (err) {
      console.error('Create repository error:', err);
      setError('Network error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create a new repository</h1>
              <p className="text-gray-600">Start a new project or add an existing repository</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Selection */}
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  required
                  value={formData.projectId || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose which project this repository belongs to
                </p>
              </div>

              {/* Repository Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Repository name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      nameError ? 'border-red-300 pr-10' : 'border-gray-300'
                    }`}
                    placeholder="my-awesome-project"
                  />
                  {nameError && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {nameError ? (
                  <p className="mt-1 text-sm text-red-600">{nameError}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Great repository names are short and memorable. Need inspiration? How about <span className="font-mono text-blue-600">super-pancake</span>?
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A short description of your repository"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Help others understand what your project is about
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublic}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Private</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Only you and collaborators you choose can see this repository
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublic}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Public</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Anyone can see this repository. You choose who can commit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !!nameError || !formData.name || !formData.projectId}
                  className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                    isLoading || !!nameError || !formData.name || !formData.projectId
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Create repository
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Initialize with README</h3>
            </div>
            <p className="text-sm text-blue-700">
              After creating your repository, you can add a README file to describe your project.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Collaborate</h3>
            </div>
            <p className="text-sm text-green-700">
              Invite team members to collaborate on your repository with different permission levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRepoPage;
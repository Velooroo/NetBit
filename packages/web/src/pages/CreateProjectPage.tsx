import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiLock, FiUnlock, FiInfo, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';
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
    <AnimatedBackground variant="purple" particles={true} particleCount={20} reduced={true}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-purple-300 hover:text-purple-200 mb-6 group transition-all duration-200"
          >
            <motion.div
              whileHover={{ x: -4 }}
              className="mr-2"
            >
              <FiArrowLeft />
            </motion.div>
            Back to projects
          </Link>
          <motion.h1 
            className="text-4xl font-bold text-white mb-3"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))',
              textShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
            }}
          >
            Create New Project
          </motion.h1>
          <p className="text-purple-200">
            A project contains repositories, team members, and project-level settings.
          </p>
        </motion.div>

        {/* Enhanced Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-start"
                    style={{
                      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <FiInfo className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Project Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="name" className="block text-sm font-medium text-purple-300 mb-2">
                  Project name *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 z-10">
                    <FiFolder className="h-4 w-4" />
                  </div>
                  <GlassInput
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="my-awesome-project"
                    className="pl-12"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Must be 2-50 characters, start and end with alphanumeric characters, may contain hyphens and underscores.
                </p>
                <AnimatePresence>
                  {formData.name && !isValidProjectName(formData.name) && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-xs text-red-400"
                    >
                      Project name is invalid
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="description" className="block text-sm font-medium text-purple-300 mb-2">
                  Description
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-slate-700/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="A brief description of your project..."
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Optional. Briefly describe your project's purpose.
                </p>
              </motion.div>

              {/* Enhanced Visibility */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <fieldset>
                  <legend className="block text-sm font-medium text-purple-300 mb-4">
                    Visibility
                  </legend>
                  <div className="space-y-4">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="relative flex items-start cursor-pointer p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center h-5">
                        <motion.input
                          whileTap={{ scale: 0.9 }}
                          type="radio"
                          name="is_public"
                          value="true"
                          checked={formData.is_public === true}
                          onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <div className="flex items-center mb-1">
                          <FiUnlock className="h-4 w-4 text-green-400 mr-2" />
                          <span className="font-medium text-white">Public</span>
                        </div>
                        <p className="text-gray-400">Anyone can see this project</p>
                      </div>
                    </motion.label>
                    
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className="relative flex items-start cursor-pointer p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center h-5">
                        <motion.input
                          whileTap={{ scale: 0.9 }}
                          type="radio"
                          name="is_public"
                          value="false"
                          checked={formData.is_public === false}
                          onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <div className="flex items-center mb-1">
                          <FiLock className="h-4 w-4 text-orange-400 mr-2" />
                          <span className="font-medium text-white">Private</span>
                        </div>
                        <p className="text-gray-400">Only you and collaborators can see this project</p>
                      </div>
                    </motion.label>
                  </div>
                </fieldset>
              </motion.div>

              {/* Enhanced Submit Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end space-x-4 pt-6 border-t border-white/10"
              >
                <Link to="/">
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    disabled={isLoading}
                  >
                    Cancel
                  </GlassButton>
                </Link>
                
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading || !formData.name || !isValidProjectName(formData.name)}
                  loading={isLoading}
                  className="flex items-center min-w-[140px]"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  {!isLoading && (
                    <>
                      <FiPlus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </GlassButton>
              </motion.div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default CreateProjectPage;
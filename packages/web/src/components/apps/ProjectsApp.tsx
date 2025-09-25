import React from 'react';
import { motion } from 'framer-motion';
import { FiFolder, FiGitBranch, FiUsers, FiPlus } from 'react-icons/fi';

const ProjectsApp: React.FC = () => {
  const mockProjects = [
    { id: 1, name: 'netbit-frontend', type: 'React', lastModified: '2 hours ago', status: 'active' },
    { id: 2, name: 'api-backend', type: 'Rust', lastModified: '1 day ago', status: 'archived' },
    { id: 3, name: 'mobile-app', type: 'React Native', lastModified: '3 hours ago', status: 'active' },
    { id: 4, name: 'docs-site', type: 'Next.js', lastModified: '1 week ago', status: 'draft' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
          <div className="text-sm text-gray-500">
            {mockProjects.length} projects
          </div>
        </div>
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus size={16} />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiFolder className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.type}</p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiGitBranch size={14} />
                  <span>main</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiUsers size={14} />
                  <span>3</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Modified {project.lastModified}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsApp;
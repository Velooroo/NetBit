import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiArrowRight, FiCode, FiUsers, FiZap } from 'react-icons/fi';

interface WelcomeAppProps {
  onGetStarted?: () => void;
}

const WelcomeApp: React.FC<WelcomeAppProps> = ({ onGetStarted }) => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white overflow-auto">
      <div className="p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <FiGithub size={48} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to NetBit OS</h1>
          <p className="text-blue-100 text-lg">
            Experience development in a whole new way
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <FiCode className="text-2xl mb-3" />
            <h3 className="text-lg font-semibold mb-2">Desktop Development</h3>
            <p className="text-blue-100 text-sm">
              Access your projects, code reviews, and repositories in a familiar desktop environment.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <FiUsers className="text-2xl mb-3" />
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-blue-100 text-sm">
              Chat with your team, share files, and collaborate on projects in real-time.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <FiZap className="text-2xl mb-3" />
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-blue-100 text-sm">
              Native desktop performance with the convenience of web technologies.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <FiGithub className="text-2xl mb-3" />
            <h3 className="text-lg font-semibold mb-2">Git Integration</h3>
            <p className="text-blue-100 text-sm">
              Full Git support with visual diff tools, branch management, and merge conflict resolution.
            </p>
          </div>
        </motion.div>

        {/* Get Started Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-blue-100 mb-6">
            Ready to revolutionize your development workflow?
          </p>
          
          <div className="space-y-4">
            <motion.button
              className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
            >
              <span>Get Started</span>
              <FiArrowRight />
            </motion.button>
            
            <motion.button
              className="w-full bg-transparent border border-white/30 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Take a Tour
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center text-blue-100 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>NetBit OS - Where development meets innovation</p>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeApp;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './index.css';
import PresaleButton from './components/PresaleButton';

function App() {
  const [email, setEmail] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      title: 'Teaching',
      description: 'AI-powered personalized learning paths that adapt to your pace and style.',
      icon: '📚'
    },
    {
      title: 'Qualifying',
      description: 'Validate your skills with real-world assessments and certifications.',
      icon: '🎯'
    },
    {
      title: 'Obsidian Base',
      description: 'Your knowledge hub - organized, searchable, and always accessible.',
      icon: '💎'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Everyone Deserves a{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Great Professor
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Meet your AI mentor that understands how you learn, guides your journey, 
            and helps you achieve mastery in any subject.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <PresaleButton className="inline-block" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Bento Grid Layout */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
            Built for the Future of Learning
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8
                  hover:bg-white/10 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Waitlist
          </h2>
          <p className="text-gray-400 mb-8">
            Be the first to experience the future of AI-powered education.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/20 rounded-xl
                text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400
                transition-colors"
            />
            <button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 
                hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl
                transition-all duration-300 whitespace-nowrap"
            >
              Get Early Access
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>&copy; 2025 Netbit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App; 
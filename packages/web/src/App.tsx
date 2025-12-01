import React from 'react';
import { motion } from 'framer-motion';
import './index.css';

import Navbar from './components/Navbar';
import PresaleButton from './components/PresaleButton';

const features = [
  {
    title: 'Teaching',
    description: 'Personalized learning paths tailored to your skill level and goals.',
    icon: '📚',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    title: 'Qualifying',
    description: 'Skill verification through practical assessments and challenges.',
    icon: '✅',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    title: 'Obsidian Base',
    description: 'Your personal knowledge vault that grows with your learning journey.',
    icon: '💎',
    gradient: 'from-teal-400 to-cyan-500',
  },
  {
    title: 'Git Server',
    description: 'Private repositories for your projects with seamless integration.',
    icon: '🔐',
    gradient: 'from-cyan-400 to-green-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-6 pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-black to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full"
          >
            <span className="text-green-400 text-sm font-medium">🚀 Now in Pre-sale</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Everyone Deserves
            </span>
            <br />
            <span className="text-white">a Great Professor</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Your AI mentor with memory, emotions, and unwavering dedication.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#presale">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl font-semibold text-lg text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-shadow"
              >
                Join Pre-sale
              </motion.button>
            </a>
            <a href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg text-white hover:bg-white/10 transition-colors"
              >
                Explore Features
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to accelerate your development journey
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`
                  relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                  border border-white/10 backdrop-blur-sm
                  hover:border-green-500/30 transition-all duration-300
                  ${index === 0 ? 'md:col-span-2' : ''}
                `}
              >
                <div className={`
                  w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} 
                  flex items-center justify-center text-2xl mb-6
                  shadow-lg shadow-green-500/20
                `}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-lg">{feature.description}</p>
                
                {/* Decorative gradient */}
                <div className={`
                  absolute top-0 right-0 w-32 h-32 
                  bg-gradient-to-br ${feature.gradient} opacity-5 rounded-2xl blur-2xl
                `} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pre-sale Section */}
      <section id="presale" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-sm font-medium">💰 Limited Spots Available</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Join the Future of</span>
            <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Dev Education
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Be an early adopter and get exclusive access to the most advanced AI-powered learning platform.
          </p>
          
          <PresaleButton />
          
          <p className="mt-6 text-sm text-gray-500">
            By participating, you agree to our terms and conditions.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-white">Netbit</span>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2024 Netbit. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
 
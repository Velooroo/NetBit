import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'dark';
  particles?: boolean;
  particleCount?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  variant = 'purple',
  particles = true,
  particleCount = 50
}) => {
  const gradients = {
    purple: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800',
    blue: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800',
    dark: 'bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900'
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div 
        className={`absolute inset-0 ${gradients[variant]}`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: '300% 300%',
        }}
      />

      {/* Enhanced Purple Lighting Orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Floating particles effect */}
      {particles && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-1 h-1 bg-purple-400/60' :
                i % 3 === 1 ? 'w-2 h-2 bg-blue-400/40' :
                'w-1.5 h-1.5 bg-indigo-400/50'
              }`}
              animate={{
                x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                   Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), 
                   Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              }}
              transition={{
                duration: Math.random() * 25 + 15,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
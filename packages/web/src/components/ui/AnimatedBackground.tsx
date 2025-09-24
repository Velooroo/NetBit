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
    dark: 'bg-gradient-to-br from-gray-900 via-slate-900 to-black'
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
      
      {/* Floating particles effect */}
      {particles && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              animate={{
                x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                   Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), 
                   Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
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
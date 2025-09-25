import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'dark';
  particles?: boolean;
  particleCount?: number;
  reduced?: boolean; // New prop for reduced performance mode
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  variant = 'purple',
  particles = true,
  particleCount = 30, // Reduced default from 50
  reduced = false // Default false for full experience
}) => {
  const gradients = {
    purple: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800',
    blue: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800',
    dark: 'bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900'
  };

  // Detect potential performance issues and auto-reduce effects
  const shouldReduce = reduced || (typeof window !== 'undefined' && 
    (navigator.hardwareConcurrency <= 4 || window.devicePixelRatio > 2));

  // Memoize particle count based on performance
  const optimizedParticleCount = useMemo(() => {
    if (!particles) return 0;
    let count = particleCount;
    if (shouldReduce) {
      count = Math.max(Math.floor(particleCount * 0.3), 5); // Reduce by 70%, minimum 5
    }
    return Math.max(count, 0); // Ensure never negative
  }, [particles, particleCount, shouldReduce]);

  // Memoize orb animations to prevent unnecessary re-renders
  const orbVariants = useMemo(() => ({
    orb1: shouldReduce ? {
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.4, 0.2],
    } : {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      x: [0, 50, 0],
      y: [0, -30, 0],
    },
    orb2: shouldReduce ? {
      scale: [1.1, 1, 1.1],
      opacity: [0.3, 0.5, 0.3],
    } : {
      scale: [1.2, 1, 1.2],
      opacity: [0.4, 0.7, 0.4],
      x: [0, -40, 0],
      y: [0, 40, 0],
    },
    orb3: shouldReduce ? {
      scale: [1, 1.2, 1],
      opacity: [0.1, 0.3, 0.1],
    } : {
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.5, 0.2],
      rotate: [0, 180, 360],
    }
  }), [shouldReduce]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background - Simplified for performance */}
      <motion.div 
        className={`absolute inset-0 ${gradients[variant]}`}
        animate={shouldReduce ? {} : {
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={shouldReduce ? {} : {
          duration: 30, // Slower animation for better performance
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundSize: shouldReduce ? '200% 200%' : '300% 300%',
        }}
      />

      {/* Optimized Purple Lighting Orbs */}
      {!shouldReduce && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl"
            animate={orbVariants.orb1}
            transition={{
              duration: 12, // Slower for performance
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl"
            animate={orbVariants.orb2}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"
            animate={orbVariants.orb3}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )}
      
      {/* Optimized floating particles effect */}
      {particles && optimizedParticleCount > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(optimizedParticleCount)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-1 h-1 bg-purple-400/40' :
                i % 3 === 1 ? 'w-1.5 h-1.5 bg-blue-400/30' :
                'w-1 h-1 bg-indigo-400/35'
              }`}
              animate={{
                x: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                  Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
                ],
                y: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), 
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)
                ],
                opacity: shouldReduce ? [0.2, 0.4, 0.2] : [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: shouldReduce ? 
                  Math.random() * 20 + 20 :  // 20-40s for reduced mode
                  Math.random() * 25 + 15,   // 15-40s for normal mode
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
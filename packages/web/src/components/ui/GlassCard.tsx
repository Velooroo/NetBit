import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  padding?: 'sm' | 'md' | 'lg';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  animate = true,
  delay = 0,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl ${paddingClasses[padding]} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
};

export default GlassCard;
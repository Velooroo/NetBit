import React from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'social';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'transition-all duration-200 font-semibold rounded-xl shadow-lg focus:outline-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-purple-500/25',
    secondary: 'bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-white/10 text-white hover:shadow-purple-500/25',
    social: 'bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-white/10 text-white hover:shadow-purple-500/25'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
          />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default GlassButton;
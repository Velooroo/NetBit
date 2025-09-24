import React from 'react';
import { motion } from 'framer-motion';

interface GlassInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  name,
  id,
  className = ''
}) => {
  const baseClasses = `
    w-full px-4 py-4 
    bg-slate-700/30 backdrop-blur-sm 
    border border-white/20 rounded-xl 
    text-white placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
    transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <motion.input
      whileFocus={{ scale: 1.02 }}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      className={baseClasses}
    />
  );
};

export default GlassInput;
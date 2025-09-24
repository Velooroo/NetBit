import React from 'react';
import { motion } from 'framer-motion';

const icons = [
  {
    name: "Google",
    bg: "bg-[#232334]",
    icon: (
      <svg width={22} height={22} viewBox="0 0 48 48" fill="none">
        <g>
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.02 1.54 7.41 2.83l5.49-5.49C33.08 3.5 28.9 1.5 24 1.5 14.78 1.5 6.94 7.9 3.98 16.09l6.91 5.37C12.3 15.44 17.67 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.14 24.47c0-1.97-.18-3.88-.51-5.72H24v10.84h12.44c-.54 2.94-2.14 5.43-4.57 7.12l7.03 5.44C42.82 38.96 46.14 32.41 46.14 24.47z"/>
          <path fill="#FBBC05" d="M10.89 28.17a14.52 14.52 0 010-8.34l-6.91-5.37a23.9 23.9 0 000 19.08l6.91-5.37z"/>
          <path fill="#EA4335" d="M24 46.5c6.52 0 12-2.15 16.01-5.84l-7.03-5.44c-1.94 1.3-4.43 2.09-8.98 2.09-6.32 0-11.69-5.94-13.11-13.94l-6.91 5.37C6.94 40.1 14.78 46.5 24 46.5z"/>
        </g>
      </svg>
    )
  },
  {
    name: "Facebook",
    bg: "bg-[#232334]",
    icon: (
      <svg width={22} height={22} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#4267B2"/>
        <path d="M30.1 24H26v12h-5V24h-3v-5h3v-3c0-2.2 1.3-5 5-5h4v5h-2c-.6 0-1 .4-1 1v2h3.5l-.4 5z" fill="#fff"/>
      </svg>
    )
  }
];

const SocialLoginButtons: React.FC = () => (
  <div className="flex gap-3 justify-center mb-6">
    {icons.map(({ name, bg, icon }) => (
      <motion.button
        key={name}
        className={`${bg} p-2 rounded-full flex items-center justify-center shadow`}
        whileTap={{ scale: 0.92 }}
        title={name}
        type="button"
        tabIndex={-1}
      >
        {icon}
      </motion.button>
    ))}
  </div>
);

export default SocialLoginButtons;
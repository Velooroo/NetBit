import React from 'react';
import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn } from 'lucide-react';

import Aurora from '../components/background/Aurora';
import Iridescence from '../components/background/Iridescence';

interface HelloPageProps {
  user?: any;
  onGetStarted?: () => void;
}
interface IconProps {
  icon: React.ReactNode;
  size?: number;
}

const RoundIcon: React.FC<IconProps> = ({ icon, size = 40 }) => (
  <div className='
    w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg 
    flex items-center justify-center shadow-md
    ' 
    style={{ width: size, height: size }}
  >
    {icon}
  </div>
);

const HelloUser: React.FC<HelloPageProps> = ({ user, onGetStarted }) => {
  return (
    <div className='
      h-full w-full absolute top-0 left-0 
      bg-gradient-to-b from-[#667eea] to-[#764ba2] pointer-events-none'
    >
      {/* Background visuals */}
      <Aurora />
      <Iridescence />

      {/* Beta indication */}
      <div className='absolute top-4 right-4 bg-yellow-300/80 px-3 py-1 rounded-full text-sm font-semibold text-black shadow-md'>
        Beta - Too Soon
      </div>

      <div className='w-[80%] h-[70%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto'> 
        <motion.div className='
          w-full p-6 h-full bg-white/10 backdrop-blur-lg border border-white/20 
          rounded-2xl shadow-lg flex items-center justify-between overflow-hidden
          '
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left side - Login */}
          <div className='w-1/2 h-full flex flex-col items-start justify-center px-6 space-y-4'>
            <motion.h1 className='text-4xl font-bold text-white'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >Login</motion.h1>
            <motion.p className='text-sm text-white/80'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >Welcome back! Please enter your details to continue.</motion.p>
            <motion.div className='flex flex-col gap-3 w-full'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button disabled className='
                bg-white/10 text-white/50 border border-white/20 
                rounded-lg shadow-md px-4 py-2 flex items-center justify-center gap-2 cursor-not-allowed
              '>
                <LogIn size={16} /> Sign in with GitHub
              </button>
              <button disabled className='
                bg-white/10 text-white/50 border border-white/20 
                rounded-lg shadow-md px-4 py-2 flex items-center justify-center gap-2 cursor-not-allowed
              '>
                <LogIn size={16} /> Sign in with Google
              </button>
            </motion.div>
          </div>

          {/* Vertical divider */}
          <motion.div className='
            absolute top-0 left-1/2 h-full border-l border-white/20'
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 1 }}
          />

          {/* Right side - Registration */}
          <div className='w-1/2 h-full flex flex-col items-end justify-center px-6 space-y-4'>
            <motion.h1 className='text-4xl font-bold text-white'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >{user ? `Hello, ${user.name}` : 'Register'}</motion.h1>
            <motion.p className='text-sm text-white/80 text-right'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >Create a new account to join us today!</motion.p>
            <motion.button className='
              bg-white/20 backdrop-blur-lg border border-white/20 
              rounded-lg shadow-md px-4 py-2 text-white font-semibold
              hover:bg-white/30 transition
              '
              onClick={onGetStarted}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {user ? 'Continue' : 'Sign Up'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelloUser;
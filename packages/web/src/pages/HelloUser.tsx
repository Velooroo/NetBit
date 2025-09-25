import React from 'react';
import { motion } from 'framer-motion';
import Aurora from '../components/background/Aurora';
import Iridescence from '../components/background/Iridescence';

interface HelloPageProps {
  user?: any;
  onGetStarted?: () => void;
}

const HelloUser: React.FC<HelloPageProps> = ({ user, onGetStarted }) => {
  return (
    <div className='
      h-full w-full absolute top-0 left-0 
      bg-gradient-to-b from-[#667eea] to-[#764ba2] pointer-events-none'
    >
      {/* Делаю окно авторизации в стиле минимализма с анимациями из motion */}
      <div className='w-78 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto'> 
        {/* Рамка в стиле MacOS с темным режимом и закруглениями с авторизацией и вариантами входа через гитхаб и гугл */}
        <motion.div className='
          w-full h-full bg-white/10 backdrop-blur-lg border border-white/20 
          rounded-2xl shadow-lg flex flex-col items-center justify-center
          '>
            <div className='text-3xl font-molot font-extrabold text-white mb-4 mt-2'>NETBIT</div>
            <div className='pl-6 pr-6 text-white text-center mb-6'>Добро пожаловать, {user?.username || 'Гость'}!</div>
            {/* Поля авторизации */}
            <input className='w-[90%] mb-6 bg-black/5 pb-2 pt-2 pl-2 rounded-xl' placeholder='Логин'/>
            <button
              onClick={onGetStarted}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                py-2 px-4 rounded-b-2xl shadow-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Начать работу
            </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HelloUser;
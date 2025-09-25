import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { GlassCard, GlassButton } from '../ui';
import { useWelcome } from '../../context/WelcomeContext';

const WelcomeDialog: React.FC = () => {
  const { showWelcome, completeWelcome } = useWelcome();

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.9) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(168, 85, 247, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.div
          initial={{ x: '100%', scale: 0.8, opacity: 0 }}
          animate={{ x: 0, scale: 1, opacity: 1 }}
          exit={{ x: '100%', scale: 0.8, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            duration: 0.8
          }}
          className="w-full max-w-md"
        >
          <GlassCard 
            className="text-center relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Floating light effects */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Large Email Emoji */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="text-8xl mb-6"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                }}
              >
                📧
              </motion.div>

              {/* Welcome Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-3xl font-bold text-white mb-4"
                style={{
                  textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
                }}
              >
                Добро пожаловать в NetBit!
              </motion.h1>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-white/90 mb-8 px-4 space-y-3"
              >
                <p className="text-lg leading-relaxed">
                  NetBit - это современный мессенджер для разработчиков и команд
                </p>
                <p className="text-sm text-white/70">
                  С планируемой массовой экосистемой устройств и программного софта
                </p>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="space-y-3 mb-8 text-left"
              >
                {[
                  'Безопасное общение в команде',
                  'Интеграция с Git репозиториями', 
                  'Совместная работа над проектами',
                  'Экосистема инструментов разработки'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                    className="flex items-center text-white/80"
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="relative -mx-8 -mb-8"
              >
                <GlassButton
                  onClick={completeWelcome}
                  variant="primary"
                  size="lg"
                  className="w-full py-6 text-lg font-semibold rounded-t-none rounded-b-3xl flex items-center justify-center group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <span>Начать работу</span>
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <FiArrowRight className="w-5 h-5" />
                  </motion.div>
                </GlassButton>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeDialog;
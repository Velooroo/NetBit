import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton } from '../components/ui';
import WelcomeDialog from '../components/ui/WelcomeDialog';
import { useWelcome } from '../context/WelcomeContext';

const DemoPage: React.FC = () => {
  const { setShowWelcome } = useWelcome();

  const handleShowWelcome = () => {
    localStorage.removeItem('hasSeenWelcome'); // Reset to simulate first time user
    setShowWelcome(true);
  };

  return (
    <AnimatedBackground variant="purple" particles={true} particleCount={50}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome Dialog Demo
            </h1>
            <p className="text-gray-300 mb-8">
              Click the button below to see the Mac-style welcome dialog with beautiful animations.
            </p>
            
            <GlassButton
              onClick={handleShowWelcome}
              variant="primary"
              size="lg"
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
              }}
            >
              🎭 Show Welcome Dialog
            </GlassButton>
            
            <p className="text-xs text-gray-400 mt-4">
              This demonstrates the welcome flow for first-time users
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default DemoPage;
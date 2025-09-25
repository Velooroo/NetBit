import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFacebook, FaGithub, FaUser, FaLock } from 'react-icons/fa';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';
import { useWelcome } from '../context/WelcomeContext';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginPageProps {
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { isFirstTimeUser, setShowWelcome } = useWelcome();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      // Trigger shake animation
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store user data and auth token separately
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        
        // Trigger success animation first
        setIsLoginSuccess(true);
        
        // After animation delay, check for welcome dialog
        setTimeout(() => {
          if (isFirstTimeUser) {
            setShowWelcome(true);
          }
          // Call the onLogin prop with just the user data
          onLogin(data.data.user);
        }, 800); // Wait for slide animation to complete
        
      } else {
        setError(data.message || 'Login failed');
        // Trigger shake animation on error
        if (formRef.current) {
          formRef.current.style.animation = 'shake 0.5s';
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.style.animation = '';
            }
          }, 500);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error, please try again');
      // Trigger shake animation on error
      if (formRef.current) {
        formRef.current.style.animation = 'shake 0.5s';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.animation = '';
          }
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login pressed`);
    // TODO: Implement social login
  };

  return (
    <AnimatedBackground variant="purple" particles={true} particleCount={25} reduced={true}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ 
            opacity: isLoginSuccess ? 0 : 1, 
            scale: isLoginSuccess ? 0.8 : 1, 
            rotateY: isLoginSuccess ? 90 : 0,
            x: isLoginSuccess ? '-100%' : 0
          }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 90, x: '-100%' }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
        >
          <GlassCard className="w-full max-w-md">
            {/* Title with enhanced purple glow */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.h1 
                className="text-4xl font-bold text-white mb-2 tracking-wider"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))',
                  textShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
                }}
                animate={{
                  textShadow: [
                    '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
                    '0 0 40px rgba(147, 51, 234, 0.8), 0 0 80px rgba(147, 51, 234, 0.6)',
                    '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)',
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                NETBIT
              </motion.h1>
              <p className="text-purple-200 text-sm">
                Welcome back to your workspace
              </p>
            </motion.div>

            {/* Enhanced Social Login Buttons with purple glow */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center space-x-4 mb-6"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.1, 
                  y: -3,
                  boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialLogin('Facebook')}
                className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-purple-400/30 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                style={{
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.2)'
                }}
              >
                <FaFacebook className="text-white text-xl" />
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.1, 
                  y: -3,
                  boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialLogin('GitHub')}
                className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-purple-400/30 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                style={{
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.2)'
                }}
              >
                <FaGithub className="text-white text-xl" />
              </motion.button>
            </motion.div>

            {/* Enhanced Divider with purple glow */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center mb-6"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-purple-400/50"></div>
              <span className="px-4 text-purple-300 text-sm font-medium">или используйте email</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-purple-400/50 to-purple-400/50"></div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                  }}
                  role="alert"
                >
                  <span className="block text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              ref={formRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 z-10" />
                <GlassInput
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Username or Email"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-12"
                />
              </div>
              
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 z-10" />
                <GlassInput
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-12"
                />
              </div>

              <div className="mt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassButton
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full"
                    size="lg"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {!isLoading && 'ВОЙТИ'}
                  </GlassButton>
                </motion.div>
              </div>
            </motion.form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center mt-6"
            >
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium hover:underline"
                >
                  Sign up for NetBit
                </Link>
              </p>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </AnimatedBackground>
  );
};

export default LoginPage; 
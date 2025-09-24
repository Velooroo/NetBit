import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaGithub } from 'react-icons/fa';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginPageProps {
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        // Call the onLogin prop with just the user data
        onLogin(data.data.user);
        // Redirect to home page
        navigate('/');
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
    <AnimatedBackground variant="purple" particles={true}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <GlassCard className="w-full max-w-md">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
              NETBIT
            </h1>
            <p className="text-gray-300 text-sm">
              Welcome back to your workspace
            </p>
          </motion.div>

          {/* Social Login Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center space-x-4 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialLogin('Facebook')}
              className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-white/10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              <FaFacebook className="text-white text-xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialLogin('GitHub')}
              className="w-14 h-14 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 border border-white/10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              <FaGithub className="text-white text-xl" />
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center mb-6"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">или используйте email</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm"
              role="alert"
            >
              <span className="block text-sm">{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <GlassInput
              id="username"
              name="username"
              type="text"
              required
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            
            <GlassInput
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />

            <div className="mt-6">
              <GlassButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                {!isLoading && 'ВОЙТИ'}
              </GlassButton>
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
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
              >
                Sign up for NetBit
              </Link>
            </p>
          </motion.div>
        </GlassCard>
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
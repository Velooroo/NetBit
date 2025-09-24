import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginCard from '../components/LoginCard';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData: { username: string; password: string }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success && data.data) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        onLogin(data.data.user);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A300DE] to-[#0037A6]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <LoginCard onLogin={handleLogin} isLoading={isLoading} error={error} />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Нет аккаунта?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
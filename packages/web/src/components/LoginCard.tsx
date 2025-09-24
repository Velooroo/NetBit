import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SocialLoginButtons from './SocialLoginButtons';

interface LoginCardProps {
  onLogin: (formData: { username: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
}

const LoginCard: React.FC<LoginCardProps> = ({ onLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <motion.div
      className="bg-[#181a22] rounded-2xl shadow-2xl px-8 py-10 w-[370px] flex flex-col items-center"
      initial={{ opacity: 0.8, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className="text-3xl font-molot font-extrabold text-white mb-6">NETBIT</div>
      <SocialLoginButtons />
      <div className="w-full flex justify-center text-gray-400 text-xs mb-3">или используйте email</div>
      {error && (
        <motion.div
          className="bg-red-900/60 border border-red-700 text-red-200 w-full px-4 py-2 rounded-lg mb-3 text-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
      <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Email"
          className="w-full bg-[#232334] rounded-lg p-3 text-white text-base border-none outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Пароль"
          className="w-full bg-[#232334] rounded-lg p-3 text-white text-base border-none outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleChange}
        />
        <div className="flex justify-end">
          <a href="#" className="text-xs text-blue-300 hover:underline">Забыли пароль?</a>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin"></span>
              Вход...
            </div>
          ) : (
            "ВОЙТИ"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default LoginCard;
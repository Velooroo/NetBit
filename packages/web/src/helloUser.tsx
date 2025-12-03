import React from 'react';
import { motion } from 'framer-motion';

interface HelloUserProps {
  user?: { name?: string };
  onGetStarted?: () => void;
}

const HelloUser: React.FC<HelloUserProps> = ({ user, onGetStarted }) => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      color: 'white',
      background: 'linear-gradient(180deg,#667eea,#764ba2)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 920,
          padding: 28,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.06)',
          boxShadow: '0 6px 30px rgba(0,0,0,0.35)'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          {user?.name ? `Hello, ${user.name}` : 'Welcome'}
        </h1>
        <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)' }}>
          Это простой placeholder для страницы HelloUser. Нажми кнопку, чтобы вернуться на лендинг.
        </p>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onGetStarted ?? (() => window.location.assign('/'))}
            style={{
              padding: '10px 16px',
              background: 'white',
              color: '#5b2a9d',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Get started
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HelloUser;

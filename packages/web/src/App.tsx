import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import components
import Header from './components/Header';
import Hello from './pages/HelloUser';

interface User {
  id: number;
  username: string;
  email: string | null;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const handleGetStarted = () => {
    // Navigate to login page when "Get Started" is clicked
    window.location.href = '/login';
  };

  return (
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Only show header for non-OS pages */}
          {user && window.location.pathname !== '/' && <Header user={user} onLogout={handleLogout} />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                user ? <Hello user={user} /> : <Hello onGetStarted={handleGetStarted} />
              } />
              {/* <Route path="/login" element={
                user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} /> 
              } /> */}
            </Routes>
          </main>
          
          {/* Welcome Dialog - only for non-OS pages */}
          {window.location.pathname !== '/' && <WelcomeDialog />}
        </div>
      </Router>
  );
}

export default App; 
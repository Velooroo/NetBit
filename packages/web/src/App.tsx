import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import components
import Header from './components/Header';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import OSPage from './pages/OSPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import RepoPage from './pages/RepoPage';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import { WelcomeProvider } from './context/WelcomeContext';
import WelcomeDialog from './components/ui/WelcomeDialog';

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
    <WelcomeProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Only show header for non-OS pages */}
          {user && window.location.pathname !== '/' && <Header user={user} onLogout={handleLogout} />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                user ? <OSPage user={user} /> : <OSPage onGetStarted={handleGetStarted} />
              } />
              <Route path="/legacy" element={
                user ? <ProjectsPage /> : <LandingPage onGetStarted={handleGetStarted} />
              } />
              <Route path="/login" element={
                user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
              } />
              <Route path="/register" element={
                user ? <Navigate to="/" /> : <RegisterPage onRegister={handleLogin} />
              } />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/repositories" element={
                user ? <HomePage /> : <Navigate to="/login" />
              } />
              <Route path="/profile" element={
                user ? <ProfilePage /> : <Navigate to="/login" />
              } />
              <Route path="/settings" element={
                user ? <SettingsPage /> : <Navigate to="/login" />
              } />
              <Route path="/settings/:section" element={
                user ? <SettingsPage /> : <Navigate to="/login" />
              } />
              <Route path="/messages" element={
                user ? <MessagesPage /> : <Navigate to="/login" />
              } />
              <Route path="/create-project" element={
                user ? <CreateProjectPage /> : <Navigate to="/login" />
              } />
              <Route path="/projects/:projectName" element={
                user ? <ProjectDetailPage /> : <Navigate to="/login" />
              } />
              <Route path="/projects/:projectName/:repoName" element={
                user ? <RepoPage /> : <Navigate to="/login" />
              } />

              {/* Legacy routes for backward compatibility */}
              <Route path="/repo/:name" element={
                user ? <RepoPage/> : <Navigate to="/login" />
              } />
              <Route path="/repo/:name/:branch" element={
                user ? <RepoPage/> : <Navigate to="/login" />
              } />
 
            </Routes>
          </main>
          
          {/* Welcome Dialog - only for non-OS pages */}
          {window.location.pathname !== '/' && <WelcomeDialog />}
        </div>
      </Router>
    </WelcomeProvider>
  );
}

export default App; 
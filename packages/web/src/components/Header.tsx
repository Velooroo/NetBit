import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGithub, FiSearch, FiPlus, FiBell, FiChevronDown } from "react-icons/fi"

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <FiGithub className="h-8 w-8 text-white mr-2" />
              <span className="text-white font-semibold text-lg">NetBit</span>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-4 ml-6">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Projects
              </Link>
              <Link 
                to="/messages" 
                className="text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Messages
              </Link>
              <Link 
                to="/explore" 
                className="text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Explore
              </Link>
              <Link 
                to="/marketplace" 
                className="text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Marketplace
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search or jump to..."
                className={`block w-full pl-10 pr-3 py-1.5 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  searchFocused ? 'bg-white text-gray-900 placeholder-gray-500' : ''
                }`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Create new dropdown */}
            <div className="relative">
              <button className="flex items-center text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
                <FiPlus className="h-4 w-4 mr-1" />
                <FiChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>

            {/* Notifications */}
            <button className="text-gray-300 hover:text-white p-2 rounded-md transition-colors">
              <FiBell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as <strong>{user?.username}</strong>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
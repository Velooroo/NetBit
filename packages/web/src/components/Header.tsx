import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGitBranch } from "react-icons/fi"
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
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Делаю заготовку под кнопки для центра хедера
  // Внешний вид кнопок: Вокруг надписи идет заполнение черно-синим оттенком, полная, без тени в стиле минимализма
  function centerButton(name: String, link) {
    return (
      <a href={link} className="w-28 h-12 content-center text-center bg-purple-500 hover:bg-purple-800 rounded-full">
        {<text className="text-white">{name}</text>}
      </a>
    );
  };

  return (
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <FiGitBranch className="mr-2 text-indigo-600" />
            NetBit
          </h1>
          <nav className="flex space-x-8 justify-center place-items-center flex-1">
            {centerButton("Repositories", "/")}
            {centerButton("Profile", "/profile")}
            {centerButton("Settings", "/settings")}
          </nav>
        </div>
      </header>

 );
};

export default Header; 
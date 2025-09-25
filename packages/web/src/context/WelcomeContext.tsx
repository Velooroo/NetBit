import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WelcomeContextType {
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: (first: boolean) => void;
  completeWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

interface WelcomeProviderProps {
  children: ReactNode;
}

export const WelcomeProvider: React.FC<WelcomeProviderProps> = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user has seen welcome before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsFirstTimeUser(true);
    }
  }, []);

  const completeWelcome = () => {
    setShowWelcome(false);
    setIsFirstTimeUser(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <WelcomeContext.Provider 
      value={{
        showWelcome,
        setShowWelcome,
        isFirstTimeUser,
        setIsFirstTimeUser,
        completeWelcome
      }}
    >
      {children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  return context;
};
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useStorageState } from '../hooks/useStorageState';
import { useRouter, useSegments } from 'expo-router';

import { testStorageUser} from "@/constants/userInfo"

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
  initialUser: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialUser 
}) => {
  const [storedUser, setStoredUser] = useStorageState('user', initialUser);
  const segments = useSegments();
  const router = useRouter();

  // Эффект для проверки аутентификации при изменении маршрута
  useEffect(() => {
    const inAuthGroup = segments[0] === '(protected)';
    
    if (!storedUser && inAuthGroup) {
      router.replace('/');
    } else if (storedUser && !inAuthGroup) {
      router.replace('/(protected)');
    }
  }, [storedUser, segments]);

  const login = async (username: string, password: string) => {
  if (!username || !password) {
    return Promise.reject(new Error('Пожалуйста, введите почту и пароль'));
  }

  if (username !== testStorageUser.username) {
    return Promise.reject(new Error('Неверная почта'));
  }

  if (password !== testStorageUser.password) {
    return Promise.reject(new Error('Неверный пароль'));
  }

  await setStoredUser(username);
  return Promise.resolve();
};

  const logout = async () => {
    await setStoredUser(null);
    router.replace('/(auth)');
  };

  const value = {
    user: storedUser,
    login,
    logout,
    isAuthenticated: !!storedUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

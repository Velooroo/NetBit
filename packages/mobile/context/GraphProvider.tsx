import { createContext, useContext, useState } from 'react';
import { useRouter } from 'expo-router';

// Определяем типы для контекста
interface TabContextType {
  tabHidden: boolean;
  setTabHidden: (hidden: boolean) => void;
}

// Создаём контекст с undefined в качестве начального значения
const TabContext = createContext<TabContextType | undefined>(undefined);

// Типы для пропсов провайдера
interface TabProviderProps {
  children: React.ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const router = useRouter();
  const [tabHidden, setTabHidden] = useState(false);

  // Создаём объект значений для контекста
  const contextValue = {
    tabHidden,
    setTabHidden
  };

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

// Хук для удобного использования контекста
export function useTab() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab должен использоваться внутри TabProvider');
  }
  return context;
}
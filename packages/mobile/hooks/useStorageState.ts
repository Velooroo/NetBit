import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useStorageState(key: string) {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    const loadStorageValue = async () => {
      try {
        const value = Platform.OS === 'web' 
          ? localStorage.getItem(key)
          : await SecureStore.getItemAsync(key);
        setState(value);
      } catch (e) {
        console.error('Error loading storage value:', e);
      }
    };
    loadStorageValue();
  }, [key]);

  const setValue = async (value: string | null) => {
    try {
      if (Platform.OS === 'web') {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } else {
        if (value === null) {
          await SecureStore.deleteItemAsync(key);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      }
      setState(value);
    } catch (e) {
      console.error('Error saving storage value:', e);
    }
  };

  return [state, setValue] as const;
}

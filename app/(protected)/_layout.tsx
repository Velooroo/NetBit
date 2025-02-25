import { useAuth } from '../../context/AuthProvider';
import { Redirect, Stack, Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  // Если пользователь не аутентифицирован, делаем редирект
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView >
        <View style={styles.header}>
          <Text style={styles.logo}>MyApp</Text>
          <View style={styles.userContainer}>
            <Text style={styles.username}>{user}</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </SafeAreaView>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{ title: 'Сообщения', headerShown: false }}
        />
        <Tabs.Screen
          name="options"
          options={{ title: 'Настройки', headerShown: false }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // для Android
  },
  content: {
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

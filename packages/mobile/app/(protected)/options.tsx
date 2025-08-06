import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthProvider';

export default function ProtectedTest() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Добро пожаловать, {user}!
      </Text>
      <Text style={styles.subtitle}>
        Вы находитесь в защищенной зоне приложения
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

import { Stack, Tabs } from 'expo-router';
import { AuthProvider } from '../context/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider initialUser={null}>
      <Stack
        options={{
          headerShown: false,
        }}  
      >
        <Stack.Screen 
          name="(auth)" 
          options={{
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="(protected)" 
          options={{
            headerShown: false
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}

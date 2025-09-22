import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      options={{
        headerShown: false
      }}  
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

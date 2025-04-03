import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthProvider";
import { DimensionsProvider } from "../context/DimensionContext";

export default function RootLayout() {
  return (
    <DimensionsProvider>
      <AuthProvider initialUser={null}>
        <Stack
          options={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </DimensionsProvider>
  );
}

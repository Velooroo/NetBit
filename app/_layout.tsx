import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthProvider";
import { TabProvider } from "../context/GraphProvider";
import { DimensionsProvider } from "../context/DimensionContext";
import React from "react";

export default function RootLayout() {
  return (
    <DimensionsProvider>
      <AuthProvider initialUser={null}>
        <TabProvider>
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
        </TabProvider>
      </AuthProvider>
    </DimensionsProvider>
  );
}

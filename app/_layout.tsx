import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/api/queryClient';
import { getCurrentUser } from '../src/services/auth';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser)
  const setHydrated = useAuthStore((state) => state.setHydrated)

  React.useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const currentUser = await getCurrentUser()

        if (isMounted) {
          if (currentUser) {
            setUser(currentUser)
          }
          setHydrated(true)
        }
      } catch {
        if (isMounted) {
          setHydrated(true)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [setHydrated, setUser])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
import React from 'react';
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  if (!isHydrated) {
    return null
  }

  if (user) {
    return <Redirect href={'/(tabs)/home' as any} />
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

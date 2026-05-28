import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function IndexRoute() {
  const user = useAuthStore((state) => state.user);
  return <Redirect href={(user ? '/(tabs)/home' : '/(auth)/splash') as any} />;
}
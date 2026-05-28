import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppCard from '../../src/components/AppCard';
import AppHeader from '../../src/components/AppHeader';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';

export default function SplashRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Travel Admin" subtitle="Expo Router auth entry for the production skeleton." />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <AppHeader title="Welcome" subtitle="Use this flow for designer handoff and auth wiring." />
        </AppCard>
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Login" onPress={() => router.push('/(auth)/login' as never)} />
          <AppButton title="Create Account" variant="secondary" onPress={() => router.push('/(auth)/signup' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

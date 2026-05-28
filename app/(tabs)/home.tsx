import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppCard from '../../src/components/AppCard';
import AppHeader from '../../src/components/AppHeader';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Home" subtitle="Expo Router dashboard shell for production wiring." />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textMuted }}>Navigate into travel booking, settings, and support flows.</Text>
        </AppCard>
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Open Travel" onPress={() => router.push('/(tabs)/travel' as never)} />
          <AppButton title="Booking History" variant="secondary" onPress={() => router.push('/(tabs)/travel/booking-history' as never)} />
          <AppButton title="Settings" variant="secondary" onPress={() => router.push('/settings' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

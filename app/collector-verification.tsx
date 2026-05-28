import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../src/components/AppButton';
import AppCard from '../src/components/AppCard';
import AppHeader from '../src/components/AppHeader';
import ScreenContainer from '../src/components/ScreenContainer';
import { theme } from '../src/constants/theme';

export default function CollectorVerificationRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Collector Verification" subtitle="Review placeholder for payment and document checks." />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text }}>Traveler: Demo User</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Booking: BK-000245</Text>
        </AppCard>
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Approve" onPress={() => router.back()} />
          <AppButton title="Reject" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </ScreenContainer>
  );
}
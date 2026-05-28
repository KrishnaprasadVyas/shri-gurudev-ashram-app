import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppButton from '../../../../src/components/AppButton';
import AppCard from '../../../../src/components/AppCard';
import AppHeader from '../../../../src/components/AppHeader';
import ScreenContainer from '../../../../src/components/ScreenContainer';
import { theme } from '../../../../src/constants/theme';

export default function BookingStatusRoute() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Booking Status" subtitle={`Booking ${bookingId}`} />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textMuted }}>{'Pending -> Verified -> Confirmed'}</Text>
        </AppCard>
        <AppButton title="Back to Details" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

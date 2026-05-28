import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppButton from '../../../../src/components/AppButton';
import AppCard from '../../../../src/components/AppCard';
import AppHeader from '../../../../src/components/AppHeader';
import ScreenContainer from '../../../../src/components/ScreenContainer';
import { theme } from '../../../../src/constants/theme';
import { bookingHistory } from '../../../../src/services/mockData';

export default function BookingDetailsRoute() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = bookingHistory.find((item) => item.bookingId === bookingId) ?? bookingHistory[0];

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Booking Details" subtitle="Detailed booking placeholder." />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text }}>Booking: {booking.bookingId}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Package: {booking.packageName}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Amount: {booking.amount}</Text>
          <Text style={{ color: theme.colors.primary, marginTop: theme.spacing.sm }}>Status: {booking.status}</Text>
        </AppCard>
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="View Status" onPress={() => router.push(`/(tabs)/travel/booking-status/${booking.bookingId}` as never)} />
          <AppButton title="Upload Documents" variant="secondary" onPress={() => router.push(`/(tabs)/travel/upload-documents/${booking.bookingId}` as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

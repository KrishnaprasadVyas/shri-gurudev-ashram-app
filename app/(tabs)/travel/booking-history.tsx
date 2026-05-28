import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppCard from '../../../src/components/AppCard';
import AppHeader from '../../../src/components/AppHeader';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { bookingHistory } from '../../../src/services/mockData';

export default function BookingHistoryRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Booking History" subtitle="Placeholder booking timeline." />
        <FlatList
          data={bookingHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing.md }}
          renderItem={({ item }) => (
            <AppCard onPress={() => router.push(`/(tabs)/travel/booking/${item.bookingId}` as never)}>
              <Text style={{ color: theme.colors.text, fontWeight: theme.typography.weights.bold }}>{item.packageName}</Text>
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textMuted }}>Booking: {item.bookingId}</Text>
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textMuted }}>Travel: {item.travelDate}</Text>
              <Text style={{ marginTop: theme.spacing.sm, color: theme.colors.primary }}>{item.status}</Text>
            </AppCard>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

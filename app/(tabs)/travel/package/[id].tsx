import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AppButton from '../../../../src/components/AppButton';
import AppCard from '../../../../src/components/AppCard';
import AppHeader from '../../../../src/components/AppHeader';
import ScreenContainer from '../../../../src/components/ScreenContainer';
import { theme } from '../../../../src/constants/theme';
import { fetchPackages } from '../../../../src/services/packages';
import { useBookingDraftStore } from '../../../../src/store/useBookingDraftStore';

export default function PackageDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const setSelectedPackage = useBookingDraftStore((state) => state.setSelectedPackage);
  const { data = [] } = useQuery({ queryKey: ['travelPackages'], queryFn: fetchPackages });
  const packageItem = data.find((item) => item.id === id);

  if (!packageItem) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, padding: theme.spacing.lg }}>
          <AppHeader title="Package" subtitle="Package details are unavailable." />
          <AppButton title="Back to Travel" onPress={() => router.replace('/(tabs)/travel' as never)} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title={packageItem.title} subtitle={packageItem.duration} />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textMuted }}>{packageItem.description}</Text>
          <Text style={{ marginTop: theme.spacing.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.bold }}>
            {packageItem.price}
          </Text>
        </AppCard>
        <AppButton
          title="Start Booking"
          onPress={() => {
            setSelectedPackage(packageItem);
            router.push('/(tabs)/travel/booking-form' as never);
          }}
        />
      </View>
    </ScreenContainer>
  );
}

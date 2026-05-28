import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AppCard from '../../../src/components/AppCard';
import AppHeader from '../../../src/components/AppHeader';
import EmptyState from '../../../src/components/EmptyState';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { fetchPackages } from '../../../src/services/packages';
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore';

export default function TravelListRoute() {
  const router = useRouter();
  const setSelectedPackage = useBookingDraftStore((state) => state.setSelectedPackage);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['travelPackages'],
    queryFn: fetchPackages,
  });

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Travel" subtitle="Live package list from Supabase." />

        {isError ? (
          <EmptyState title="Could not load packages" message="Please try again." actionLabel="Retry" onAction={() => void refetch()} />
        ) : null}

        {!isError && !isLoading && data.length === 0 ? (
          <EmptyState title="No active packages" message="No travel package is active right now." />
        ) : null}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.xl }}
          renderItem={({ item }) => (
            <AppCard
              onPress={() => {
                setSelectedPackage(item);
                router.push(`/(tabs)/travel/package/${item.id}` as never);
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.md }}>
                {item.title}
              </Text>
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textMuted }}>{item.duration}</Text>
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textMuted }}>{item.description}</Text>
              <Text style={{ marginTop: theme.spacing.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.bold }}>{item.price}</Text>
            </AppCard>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../src/components/AppButton';
import AppCard from '../src/components/AppCard';
import AppHeader from '../src/components/AppHeader';
import ScreenContainer from '../src/components/ScreenContainer';
import { theme } from '../src/constants/theme';
import { collectorTasks } from '../src/services/mockData';

export default function CollectorDashboardRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Collector Dashboard" subtitle="Verification queue placeholder." />
        <FlatList
          data={collectorTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing.md, marginBottom: theme.spacing.lg }}
          renderItem={({ item }) => (
            <AppCard>
              <Text style={{ color: theme.colors.text, fontWeight: theme.typography.weights.bold }}>{item.title}</Text>
              <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{item.description}</Text>
              <Text style={{ color: theme.colors.primary, marginTop: theme.spacing.sm }}>{item.status}</Text>
            </AppCard>
          )}
        />
        <AppButton title="Open Verification" onPress={() => router.push('/collector-verification' as never)} />
      </View>
    </ScreenContainer>
  );
}

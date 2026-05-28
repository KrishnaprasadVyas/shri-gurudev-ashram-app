import React from 'react';
import { FlatList, Text, View } from 'react-native';
import AppCard from '../../src/components/AppCard';
import AppHeader from '../../src/components/AppHeader';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';
import { notifications } from '../../src/services/mockData';

export default function NotificationsRoute() {
  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Notifications" subtitle="Dummy feed until push and inbox are integrated." />
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing.md }}
          renderItem={({ item }) => (
            <AppCard>
              <Text style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.text }}>{item.title}</Text>
              <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textMuted }}>{item.message}</Text>
              <Text style={{ marginTop: theme.spacing.sm, color: theme.colors.primary }}>{item.time}</Text>
            </AppCard>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

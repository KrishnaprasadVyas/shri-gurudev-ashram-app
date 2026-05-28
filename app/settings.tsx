import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../src/components/AppButton';
import AppHeader from '../src/components/AppHeader';
import ScreenContainer from '../src/components/ScreenContainer';
import { theme } from '../src/constants/theme';

export default function SettingsRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Settings" subtitle="App-level settings placeholder." />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Help and Support" onPress={() => router.push('/help-support' as never)} />
          <AppButton title="Collector Dashboard" variant="secondary" onPress={() => router.push('/collector-dashboard' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

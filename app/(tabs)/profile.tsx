import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppHeader from '../../src/components/AppHeader';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ProfileRoute() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Profile" subtitle="Account shell and quick links." />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Settings" onPress={() => router.push('/settings' as never)} />
          <AppButton title="Help and Support" variant="secondary" onPress={() => router.push('/help-support' as never)} />
          <AppButton title="Collector Dashboard" variant="secondary" onPress={() => router.push('/collector-dashboard' as never)} />
          <AppButton
            title="Logout"
            variant="secondary"
            onPress={() => {
              logout();
              router.replace('/(auth)/splash' as never);
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
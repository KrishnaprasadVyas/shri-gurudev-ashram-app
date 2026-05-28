import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../../src/components/AppButton';
import AppHeader from '../../../src/components/AppHeader';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore';

export default function SuccessRoute() {
  const router = useRouter();
  const resetDraft = useBookingDraftStore((state) => state.resetDraft);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Booking Submitted" subtitle="Your payment proof was saved in draft state." />
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.lg }}>
          Collector verification and live status updates can be wired next.
        </Text>
        <AppButton
          title="Back to Home"
          onPress={() => {
            resetDraft();
            router.replace('/(tabs)/home' as never);
          }}
        />
      </View>
    </ScreenContainer>
  );
}

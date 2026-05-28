import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../../src/components/AppButton';
import AppHeader from '../../../src/components/AppHeader';
import AppInput from '../../../src/components/AppInput';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore';

export default function PaymentRoute() {
  const router = useRouter();
  const utr = useBookingDraftStore((state) => state.utr);
  const proofLabel = useBookingDraftStore((state) => state.proofLabel);
  const updateField = useBookingDraftStore((state) => state.updateField);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Payment" subtitle="UPI proof placeholder wired to booking draft state." />
        <AppInput label="UTR Number" value={utr} onChangeText={(value) => updateField('utr', value)} placeholder="Enter UTR" />
        <AppInput label="Proof Label" value={proofLabel} onChangeText={(value) => updateField('proofLabel', value)} placeholder="Screenshot file name" />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Submit Booking" onPress={() => router.replace('/(tabs)/travel/success' as never)} />
          <AppButton title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </ScreenContainer>
  );
}

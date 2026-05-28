import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../../src/components/AppButton';
import AppHeader from '../../../src/components/AppHeader';
import AppInput from '../../../src/components/AppInput';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore';

export default function BookingFormRoute() {
  const router = useRouter();
  const selectedPackage = useBookingDraftStore((state) => state.selectedPackage);
  const fullName = useBookingDraftStore((state) => state.fullName);
  const phoneNumber = useBookingDraftStore((state) => state.phoneNumber);
  const updateField = useBookingDraftStore((state) => state.updateField);

  if (!selectedPackage) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, padding: theme.spacing.lg }}>
          <AppHeader title="Booking" subtitle="Select a package first." />
          <AppButton title="Back to Travel" onPress={() => router.replace('/(tabs)/travel' as never)} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Booking Form" subtitle={selectedPackage.title} />
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>Package amount: {selectedPackage.price}</Text>
        <AppInput label="Full Name" value={fullName} onChangeText={(value) => updateField('fullName', value)} placeholder="Traveler name" />
        <AppInput label="Phone Number" value={phoneNumber} onChangeText={(value) => updateField('phoneNumber', value)} placeholder="Primary contact" keyboardType="phone-pad" />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Continue to Payment" onPress={() => router.push('/(tabs)/travel/payment' as never)} />
          <AppButton title="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </ScreenContainer>
  );
}

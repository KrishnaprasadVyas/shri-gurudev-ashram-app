import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppHeader from '../../src/components/AppHeader';
import AppInput from '../../src/components/AppInput';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Forgot Password" subtitle="Reset flow placeholder for backend implementation." />
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="name@example.com" />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Send Reset Link" onPress={() => router.back()} />
          <AppButton title="Back to Login" variant="secondary" onPress={() => router.replace('/(auth)/login' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

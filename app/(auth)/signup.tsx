import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppHeader from '../../src/components/AppHeader';
import AppInput from '../../src/components/AppInput';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SignupRoute() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignup = () => {
    setUser({ id: 'u-2', name: name || email || 'New User', email, role: 'member' });
    router.replace('/(tabs)/home' as never);
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Create Account" subtitle="Signup placeholder for later Supabase auth wiring." />
        <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="name@example.com" />
        <View style={{ gap: theme.spacing.md }}>
          <AppButton title="Create Account" onPress={handleSignup} />
          <AppButton title="Back to Splash" variant="secondary" onPress={() => router.replace('/(auth)/splash' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

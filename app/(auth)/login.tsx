import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AppButton from '../../src/components/AppButton';
import AppHeader from '../../src/components/AppHeader';
import AppInput from '../../src/components/AppInput';
import ScreenContainer from '../../src/components/ScreenContainer';
import { theme } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function LoginRoute() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    setUser({ id: 'u-1', name: email || 'Guest User', email, role: 'member' });
    router.replace('/(tabs)/home' as never);
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Login" subtitle="Sign in placeholder while backend auth is integrated." />
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="name@example.com" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter password" />
        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
          <AppButton title="Login" onPress={handleLogin} />
          <AppButton title="Forgot Password" variant="secondary" onPress={() => router.push('/(auth)/forgot-password' as never)} />
          <AppButton title="Back to Splash" variant="secondary" onPress={() => router.replace('/(auth)/splash' as never)} />
        </View>
      </View>
    </ScreenContainer>
  );
}

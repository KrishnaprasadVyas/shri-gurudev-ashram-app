import React from 'react';
import { Text, View } from 'react-native';
import ScreenContainer from '../src/components/ScreenContainer';
import AppCard from '../src/components/AppCard';
import AppHeader from '../src/components/AppHeader';
import { theme } from '../src/constants/theme';

export default function HelpSupportRoute() {
  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg }}>
        <AppHeader title="Help and Support" subtitle="Support placeholder content." />
        <AppCard>
          <Text style={{ color: theme.colors.text }}>Email: support@ashram.app</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Phone: +91 90000 00000</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

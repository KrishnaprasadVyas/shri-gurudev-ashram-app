import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'
import { SafeAreaView } from 'react-native-safe-area-context'

type SuccessNav = NativeStackNavigationProp<TravelStackParamList, 'Success'>;

const COLORS = {
  background: '#fbf9f4',
  primary: '#8d4b00',
  secondary: '#665d4e',
  surface: '#ffffff',
  border: '#dbc2b0',
  text: '#1b1c19',
  muted: '#554336',
  chip: '#eee1cd',
}

export default function SuccessScreen() {
  const navigation = useNavigation<SuccessNav>()
  const resetDraft = useBookingDraftStore((state) => state.resetDraft)

  const handleBackHome = () => {
    resetDraft()
    navigation.getParent()?.navigate('Home' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}><Text style={styles.iconText}>✓</Text></View>
          <Text style={styles.title}>Booking Submitted Successfully</Text>
          <Text style={styles.bookingId}>Booking ID: BK-000245</Text>
          <Text style={styles.message}>Your booking is submitted. Admin will verify payment and confirm your reservation soon.</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>Payment under review</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>Temple verification</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleBackHome}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20, justifyContent: 'center', gap: 18 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  iconCircle: { width: 78, height: 78, borderRadius: 39, backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  iconText: { color: COLORS.primary, fontSize: 34, fontWeight: '700', lineHeight: 34 },
  title: { textAlign: 'center', color: COLORS.text, fontSize: 22, fontWeight: '700' },
  bookingId: { marginTop: 8, color: COLORS.secondary, fontSize: 13, fontWeight: '700' },
  message: { marginTop: 12, textAlign: 'center', color: COLORS.muted, fontSize: 14, lineHeight: 22 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' },
  infoChip: { backgroundColor: '#fff7eb', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  infoChipText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

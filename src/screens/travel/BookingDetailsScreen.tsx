import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { bookingHistory } from '../../services/mockData'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type BookingDetailsRoute = RouteProp<TravelStackParamList, 'BookingDetails'>;
type BookingDetailsNav = NativeStackNavigationProp<TravelStackParamList, 'BookingDetails'>;

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

export default function BookingDetailsScreen() {
  const route = useRoute<BookingDetailsRoute>()
  const navigation = useNavigation<BookingDetailsNav>()
  const booking = bookingHistory.find((item) => item.bookingId === route.params.bookingId) ?? bookingHistory[0]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Booking Details</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Text style={styles.heroIconText}>✦</Text></View>
          <Text style={styles.label}>Booking ID</Text>
          <Text style={styles.value}>{booking.bookingId}</Text>
          <Text style={styles.label}>Package</Text>
          <Text style={styles.value}>{booking.packageName}</Text>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>{booking.amount}</Text>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusPill}><Text style={styles.statusText}>{booking.status}</Text></View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Next steps</Text>
          <Text style={styles.infoText}>• View live status updates</Text>
          <Text style={styles.infoText}>• Upload documents for verification</Text>
          <Text style={styles.infoText}>• Keep your payment reference ready</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('BookingStatus', { bookingId: booking.bookingId })}>
            <Text style={styles.primaryButtonText}>View Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('UploadDocuments', { bookingId: booking.bookingId })}>
            <Text style={styles.secondaryButtonText}>Upload Documents</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  backButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  topTitle: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chip },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  heroIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroIconText: { color: COLORS.primary, fontSize: 24, fontWeight: '700' },
  label: { color: COLORS.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 12 },
  value: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 6 },
  statusPill: { alignSelf: 'flex-start', backgroundColor: '#fff0d9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  statusText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  infoText: { color: COLORS.muted, fontSize: 14, lineHeight: 22 },
  actions: { gap: 12, marginTop: 'auto', paddingBottom: 8 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: COLORS.surface, borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  secondaryButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
})

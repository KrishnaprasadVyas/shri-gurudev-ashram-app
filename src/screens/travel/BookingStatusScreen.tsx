import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type BookingStatusRoute = RouteProp<TravelStackParamList, 'BookingStatus'>;
type BookingStatusNav = NativeStackNavigationProp<TravelStackParamList, 'BookingStatus'>;

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

export default function BookingStatusScreen() {
  const route = useRoute<BookingStatusRoute>()
  const navigation = useNavigation<BookingStatusNav>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Booking Status</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Booking ID: {route.params.bookingId}</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineStep}><View style={[styles.timelineDot, styles.timelineDotActive]} /><Text style={styles.timelineLabelActive}>Pending</Text></View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}><View style={[styles.timelineDot, styles.timelineDotActive]} /><Text style={styles.timelineLabelActive}>Verified</Text></View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}><View style={styles.timelineDot} /><Text style={styles.timelineLabel}>Confirmed</Text></View>
          </View>
          <Text style={styles.text}>This flow can later show live progress from the backend.</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Back to Details</Text>
        </TouchableOpacity>
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
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  timeline: { gap: 10, marginBottom: 12 },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.border },
  timelineDotActive: { backgroundColor: COLORS.primary },
  timelineLabel: { color: COLORS.secondary, fontSize: 14, fontWeight: '600' },
  timelineLabelActive: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  timelineLine: { width: 2, height: 14, backgroundColor: COLORS.border, marginLeft: 6 },
  text: { color: COLORS.muted, lineHeight: 22, marginTop: 4 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

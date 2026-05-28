import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const steps = [
  { title: 'Booking submitted', detail: 'Your yatra request has reached the ashram desk.', done: true },
  { title: 'Documents review', detail: 'Identity and travel documents are checked by the team.', done: false },
  { title: 'Payment verification', detail: 'Payment proof is matched with the booking reference.', done: false },
  { title: 'Journey confirmed', detail: 'Final itinerary and reporting details are shared.', done: false },
]

export default function BookingStatusRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Booking status</Text>
            <Text style={styles.title}>{bookingId}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.timelineLine} />
          {steps.map((step, index) => (
            <View key={step.title} style={styles.timelineRow}>
              <View style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
                {step.done ? <MaterialIcons name="check" size={13} color="#fff" /> : <Text style={styles.timelineDotText}>{index + 1}</Text>}
              </View>
              <View style={styles.timelineCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F3EA' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  kicker: { color: '#8B5A00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2C1D10', fontSize: 28, fontWeight: '900', marginTop: 2 },
  timelineCard: {
    borderRadius: 30,
    backgroundColor: '#fff',
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2D1A0C',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  timelineLine: { position: 'absolute', left: 37, top: 40, bottom: 42, width: 2, backgroundColor: '#F0E7DD' },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 22 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0D9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#F0E7DD',
  },
  timelineDotDone: { backgroundColor: '#E65C00', borderColor: '#E65C00' },
  timelineDotText: { color: '#8B5A00', fontSize: 12, fontWeight: '900' },
  timelineCopy: { flex: 1 },
  stepTitle: { color: '#2C1D10', fontSize: 17, fontWeight: '900' },
  stepDetail: { color: '#7E7162', fontSize: 13, lineHeight: 20, marginTop: 4 },
})

import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { bookingHistory } from '../../../src/services/mockData'

export default function BookingHistoryRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookingHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
            </Pressable>
            <View>
              <Text style={styles.kicker}>Yatra records</Text>
              <Text style={styles.title}>Booking History</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(tabs)/travel/booking/${item.bookingId}` as never)}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="event-note" size={22} color="#8B5A00" />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{item.packageName}</Text>
                <Text style={styles.cardMeta}>{item.travelDate}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardBottom}>
              <Text style={styles.bookingId}>{item.bookingId}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F3EA' },
  content: { paddingHorizontal: 18, paddingBottom: 120, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2D1A0C',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F7EFE4', alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#2C1D10', fontSize: 16, fontWeight: '900' },
  cardMeta: { color: '#7E7162', fontSize: 13, marginTop: 4, fontWeight: '600' },
  statusPill: { borderRadius: 999, backgroundColor: '#FFF0D9', paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { color: '#8B5A00', fontSize: 11, fontWeight: '900' },
  divider: { height: 1, backgroundColor: 'rgba(139,90,0,0.08)', marginVertical: 14 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { color: '#7E7162', fontSize: 13, fontWeight: '800' },
  amount: { color: '#8B5A00', fontSize: 18, fontWeight: '900' },
})

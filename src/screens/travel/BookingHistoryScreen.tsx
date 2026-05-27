import React from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { bookingHistory } from '../../services/mockData'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type BookingHistoryNav = NativeStackNavigationProp<TravelStackParamList, 'BookingHistory'>;

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

export default function BookingHistoryScreen() {
  const navigation = useNavigation<BookingHistoryNav>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Booking History</Text>
          <View style={styles.avatar} />
        </View>

        <Text style={styles.subtitle}>A warm archive of your previous pilgrimage bookings.</Text>

        <FlatList
          data={bookingHistory}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetails', { bookingId: item.bookingId })}>
              <View style={styles.cardTopRow}>
                <Text style={styles.bookingId}>{item.bookingId}</Text>
                <View style={styles.statusPill}><Text style={styles.statusText}>{item.status}</Text></View>
              </View>
              <Text style={styles.title}>{item.packageName}</Text>
              <Text style={styles.text}>{item.travelDate}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20, paddingBottom: 28 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: COLORS.primary, fontSize: 24, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chip },
  subtitle: { color: COLORS.secondary, fontSize: 14, lineHeight: 22, marginTop: 10, marginBottom: 16 },
  listContent: { paddingBottom: 16 },
  separator: { height: 14 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingId: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  statusPill: { backgroundColor: '#fff0d9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  text: { color: COLORS.secondary, fontSize: 13, marginBottom: 10 },
  amount: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
})

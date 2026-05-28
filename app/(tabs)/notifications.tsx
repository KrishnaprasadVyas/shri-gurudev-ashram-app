import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { notifications } from '../../src/services/mockData'

export default function NotificationsRoute() {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Ashram updates</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="campaign" size={22} color="#8B5A00" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 120, gap: 14 },
  header: { marginBottom: 6 },
  kicker: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.3 },
  title: { color: '#2B231B', fontSize: 32, fontWeight: '900', marginTop: 4 },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E7DD',
    shadowColor: '#5B4636',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  cardTitle: { color: '#2B231B', fontSize: 16, fontWeight: '900' },
  message: { color: '#7E7162', fontSize: 13, lineHeight: 20, marginTop: 5 },
  time: { color: '#E65C00', fontSize: 12, fontWeight: '800', marginTop: 8 },
})

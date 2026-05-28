import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { collectorTasks } from '../src/services/mockData'

const stats = [
  { label: 'Assigned yatris', value: '128', icon: 'groups' },
  { label: 'Pending payments', value: '42', icon: 'hourglass-empty' },
  { label: 'Collected this month', value: 'INR 1.84L', icon: 'account-balance-wallet' },
  { label: 'Upcoming dues', value: '18', icon: 'event-note' },
]

export default function CollectorDashboardRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={collectorTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
            <BlurView intensity={25} tint="light" style={styles.headerGlass}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.kicker}>Namaste, Collector</Text>
                  <Text style={styles.title}>Premium spiritual operations</Text>
                  <Text style={styles.subtitle}>Manage collections, verification, and follow-ups with calm precision.</Text>
                </View>
                <Pressable style={styles.analyticsButton}>
                  <MaterialIcons name="timeline" size={20} color="#8B5A00" />
                </Pressable>
              </View>

              <View style={styles.quickStatsGrid}>
                {stats.map((stat) => (
                  <View key={stat.label} style={styles.statCard}>
                    <LinearGradient colors={['#7A4B00', '#B97712']} style={styles.statIcon}>
                      <MaterialIcons name={stat.icon as any} size={18} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View>
                    <Text style={styles.summaryLabel}>Daily collection summary</Text>
                    <Text style={styles.summaryValue}>INR 65,400 recovery pending</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>74% complete</Text>
                  </View>
                </View>
                <View style={styles.summaryBarTrack}>
                  <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} style={styles.summaryBarFill} />
                </View>
              </View>
            </BlurView>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Verification queue</Text>
              <Pressable onPress={() => router.push('/collector-verification' as never)}>
                <Text style={styles.seeAll}>Open review</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.taskCard} onPress={() => router.push('/collector-verification' as never)}>
            <View style={styles.taskIcon}>
              <MaterialIcons name="verified-user" size={22} color="#8B5A00" />
            </View>
            <View style={styles.taskCopy}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              <Text style={styles.taskStatus}>{item.status}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F3EA' },
  listContent: { paddingBottom: 110 },
  headerBlock: { paddingHorizontal: 18, paddingBottom: 8 },
  headerGlass: {
    borderRadius: 34,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  headerCopy: { flex: 1 },
  kicker: { color: '#8B5A00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { color: '#2C1D10', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  subtitle: { color: '#6B5A4A', fontSize: 13, lineHeight: 20, marginTop: 8 },
  analyticsButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderRadius: 22, backgroundColor: '#fff', padding: 14, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  statIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#2C1D10', fontSize: 20, fontWeight: '900', marginTop: 10 },
  statLabel: { color: '#6B5A4A', fontSize: 11, fontWeight: '800', marginTop: 3 },
  summaryCard: { marginTop: 14, borderRadius: 24, backgroundColor: '#FFF9F0', padding: 16, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { color: '#8B5A00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  summaryValue: { color: '#2C1D10', fontSize: 17, fontWeight: '900', marginTop: 5 },
  summaryPill: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 7 },
  summaryPillText: { color: '#8B5A00', fontSize: 11, fontWeight: '900' },
  summaryBarTrack: { height: 8, backgroundColor: '#F0E7DD', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  summaryBarFill: { width: '74%', height: '100%' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 8 },
  sectionTitle: { color: '#2C1D10', fontSize: 20, fontWeight: '900' },
  seeAll: { color: '#8B5A00', fontSize: 13, fontWeight: '900' },
  taskCard: { marginHorizontal: 18, marginBottom: 12, flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  taskIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1 },
  taskTitle: { color: '#2C1D10', fontSize: 16, fontWeight: '900' },
  taskDescription: { color: '#6B5A4A', fontSize: 13, lineHeight: 20, marginTop: 4 },
  taskStatus: { color: '#8B5A00', fontSize: 12, fontWeight: '900', marginTop: 8 },
})

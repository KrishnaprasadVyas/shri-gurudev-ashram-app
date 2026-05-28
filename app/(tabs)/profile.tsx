import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { donationCategoriesMock, profileData, savedEventsMock, upcomingYatrasMock } from '../../src/services/profileMockData'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function ProfileRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isCollector = user?.role === 'collector'

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'D'}</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>Jai Gurudev</Text>
            <Text style={styles.name}>{user?.name || 'Devotee'}</Text>
          </View>
          <Pressable style={styles.bellIcon} onPress={() => router.push('/(tabs)/notifications' as never)}>
            <Ionicons name="notifications-outline" size={24} color="#2B231B" />
            <View style={styles.bellBadge} />
          </Pressable>
        </View>

        <LinearGradient colors={['#ffffff', '#FCFAF6']} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.memberId}>ID: SD-99281</Text>
              <Text style={styles.memberSince}>Member since {profileData.memberSince}</Text>
            </View>
            <View style={styles.heroBadge}>
              <MaterialIcons name="verified" size={16} color="#B97512" />
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{profileData.completedYatras}</Text>
              <Text style={styles.heroStatLabel}>Completed Yatras</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{profileData.upcomingYatras}</Text>
              <Text style={styles.heroStatLabel}>Upcoming Yatras</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActionsRow}>
          <QuickActionCard icon="event-note" label="My Bookings" onPress={() => router.push('/(tabs)/travel/booking-history' as never)} />
          <QuickActionCard icon="volunteer-activism" label="Donations" onPress={() => undefined} />
          <QuickActionCard icon="map" label="Routes" onPress={() => router.push('/(tabs)/travel' as never)} />
          <QuickActionCard icon="headset-mic" label="Support" onPress={() => router.push('/help-support' as never)} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Yatras</Text>
            <Pressable onPress={() => router.push('/(tabs)/travel/booking-history' as never)}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {upcomingYatrasMock.map((yatra) => (
            <View key={yatra.id} style={styles.yatraCard}>
              <Image source={{ uri: yatra.image }} style={styles.yatraImage} contentFit="cover" />
              <View style={styles.yatraDetails}>
                <View style={styles.yatraStatusBadge}>
                  <Text style={styles.yatraStatusText}>{yatra.status}</Text>
                </View>
                <Text style={styles.yatraDestination}>{yatra.destination}</Text>
                <Text style={styles.yatraDate}>{yatra.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spiritual Contributions</Text>
          <View style={styles.donationsGrid}>
            <View style={styles.donationBox}>
              <MaterialIcons name="volunteer-activism" size={20} color="#E65C00" style={{ marginBottom: 8 }} />
              <Text style={styles.donationAmount}>{profileData.totalDonations}</Text>
              <Text style={styles.donationLabel}>Total Donated</Text>
            </View>
            <View style={styles.donationBoxList}>
              {donationCategoriesMock.map((cat) => (
                <View key={cat.id} style={styles.donationCatRow}>
                  <Text style={styles.donationCatTitle}>{cat.title}</Text>
                  <Text style={styles.donationCatAmount}>{cat.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Events</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsScroll}>
            {savedEventsMock.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Image source={{ uri: event.image }} style={styles.eventImage} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.eventGradient}>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {isCollector ? (
          <Pressable onPress={() => router.push('/collector-dashboard' as never)} style={styles.collectorCard}>
            <LinearGradient colors={['#993D00', '#E65C00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.collectorGradient}>
              <MaterialIcons name="admin-panel-settings" size={28} color="#fff" />
              <View style={styles.collectorCopy}>
                <Text style={styles.collectorTitle}>Collector Portal</Text>
                <Text style={styles.collectorText}>Open verification and collection dashboard.</Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : null}

        <View style={styles.settingsCard}>
          <SettingsRow icon="settings-outline" label="Settings" onPress={() => router.push('/settings' as never)} />
          <SettingsRow icon="help-circle-outline" label="Help and Support" onPress={() => router.push('/help-support' as never)} />
          <SettingsRow
            icon="log-out-outline"
            label="Logout"
            onPress={() => {
              logout()
              router.replace('/(auth)/splash' as never)
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function QuickActionCard({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickActionCard}>
      <View style={styles.quickActionIcon}>
        <MaterialIcons name={icon as any} size={24} color="#993D00" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  )
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.settingsRow}>
      <View style={styles.settingsRowLeft}>
        <Ionicons name={icon as any} size={22} color="#7E7162" />
        <Text style={styles.settingsRowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D7C7B8" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 120, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#993D00', fontSize: 22, fontWeight: '900' },
  headerCopy: { flex: 1 },
  greeting: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  name: { color: '#2B231B', fontSize: 22, fontWeight: '900', marginTop: 2 },
  bellIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E65C00' },
  heroCard: { borderRadius: 30, padding: 20, borderWidth: 1, borderColor: '#F0E7DD' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberId: { color: '#993D00', fontSize: 13, fontWeight: '900' },
  memberSince: { color: '#7E7162', fontSize: 12, marginTop: 4, fontWeight: '700' },
  heroBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#2B231B', fontSize: 28, fontWeight: '900' },
  heroStatLabel: { color: '#7E7162', fontSize: 12, fontWeight: '700', marginTop: 4 },
  heroDivider: { width: 1, height: 44, backgroundColor: '#F0E7DD' },
  quickActionsRow: { flexDirection: 'row', gap: 10 },
  quickActionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 22, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F0E7DD' },
  quickActionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { color: '#2B231B', fontSize: 11, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#2B231B', fontSize: 20, fontWeight: '900' },
  seeAll: { color: '#E65C00', fontSize: 13, fontWeight: '900' },
  yatraCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 12, gap: 12, borderWidth: 1, borderColor: '#F0E7DD' },
  yatraImage: { width: 88, height: 88, borderRadius: 18 },
  yatraDetails: { flex: 1, justifyContent: 'center' },
  yatraStatusBadge: { alignSelf: 'flex-start', backgroundColor: '#FFF0D9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  yatraStatusText: { color: '#993D00', fontSize: 11, fontWeight: '900' },
  yatraDestination: { color: '#2B231B', fontSize: 16, fontWeight: '900', marginTop: 8 },
  yatraDate: { color: '#7E7162', fontSize: 13, marginTop: 4 },
  donationsGrid: { flexDirection: 'row', gap: 12 },
  donationBox: { flex: 1, backgroundColor: '#FFF9F0', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#F0E7DD' },
  donationAmount: { color: '#2B231B', fontSize: 20, fontWeight: '900' },
  donationLabel: { color: '#7E7162', fontSize: 12, marginTop: 4, fontWeight: '700' },
  donationBoxList: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 14, gap: 10, borderWidth: 1, borderColor: '#F0E7DD' },
  donationCatRow: { gap: 2 },
  donationCatTitle: { color: '#7E7162', fontSize: 12, fontWeight: '800' },
  donationCatAmount: { color: '#993D00', fontSize: 14, fontWeight: '900' },
  eventsScroll: { gap: 12, paddingRight: 18 },
  eventCard: { width: 210, height: 150, borderRadius: 24, overflow: 'hidden', backgroundColor: '#2B231B' },
  eventImage: { ...StyleSheet.absoluteFill },
  eventGradient: { flex: 1, justifyContent: 'flex-end', padding: 14 },
  eventDate: { color: '#FFF0D9', fontSize: 11, fontWeight: '900' },
  eventTitle: { color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 4 },
  collectorCard: { borderRadius: 24, overflow: 'hidden' },
  collectorGradient: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  collectorCopy: { flex: 1 },
  collectorTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
  collectorText: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 4 },
  settingsCard: { backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F0E7DD' },
  settingsRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F5EDE4' },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsRowLabel: { color: '#2B231B', fontSize: 15, fontWeight: '800' },
})

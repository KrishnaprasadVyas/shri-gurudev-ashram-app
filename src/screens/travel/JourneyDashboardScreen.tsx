import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

const COLORS = {
  background: '#fbf9f4',
  primary: '#8d4b00',
  secondary: '#665d4e',
  surface: '#ffffff',
  border: '#dbc2b0',
  text: '#1b1c19',
  muted: '#554336',
  chip: '#eee1cd',
  chipInactive: '#e4e2de',
  saffron: '#F59E0B',
  white: '#ffffff',
}

const trips = [
  {
    title: 'Haridwar',
    date: 'OCT 12 - OCT 18',
    description:
      'The Gateway to God. Experience the divine energy of the evening Aarti and sacred dips in the purifying waters of the Ganges.',
    image:
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Kedarnath',
    date: 'NOV 05 - NOV 12',
    description:
      'A trek to the soul. High in the Himalayas, find solitude and inner strength in one of the holiest shrines of Lord Shiva.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Dwarka',
    date: 'DEC 01 - DEC 07',
    description:
      'The Kingdom of Krishna. Walk the shores where mythology meets the ocean.',
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Rishikesh',
    date: 'JAN 15 - JAN 22',
    description:
      'Yoga Capital of the World. Find balance through meditation and mindfulness.',
    image:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200&auto=format&fit=crop',
  },
]

export default function JourneyDashboardScreen() {
  const navigation = useNavigation<any>()
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.65,
      duration: 900,
      useNativeDriver: false,
    }).start()
  }, [progress])

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileFrame}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2XlBJUBZ0JV2mp1iVAfaOK2O0e4W3ec1lRlpqJE9qWDKwGmZLDC7yNN3TWhAYR9v9UufpAXWGLyTypLuh-KbOhF3J7fWDNTMMgGm9BpU0e98eHXT-8TFcWjvIGDaggynq0s8obxbnNXzntovtDwo3JBa2IpqEsgbcLpxi1AzyOCJBFpoijH6MhhNFC0AqU31q7TcXHoL1seWk8VvNeYuRKMB1PfCEv1El_8bmcuJA-8GgnA1WWYVHEqrD0icsgkY_uAgWs7mwWMI',
                }}
                style={styles.profileImage}
              />
            </View>

            <Text style={styles.logo}>Ashram</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.notification}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Namaste, Aryan</Text>
          <Text style={styles.welcomeText}>
            Your spiritual journey continues. Review your upcoming yatras and payment schedules.
          </Text>
        </View>

        <View style={styles.stackLayout}>
          <View style={styles.glassCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.kicker}>Payment Tracker</Text>
                <Text style={styles.cardHeading}>Kailash Mansarovar Yatra</Text>
              </View>

              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>Next: Oct 15, 2023</Text>
              </View>
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.progressLabel}><Text style={styles.progressBold}>65%</Text> Completed</Text>
              <Text style={styles.progressAmount}>₹1,95,000 / ₹3,00,000</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Amount</Text>
                <Text style={styles.statValue}>₹3,00,000</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Paid Amount</Text>
                <Text style={[styles.statValue, { color: COLORS.primary }]}>₹1,95,000</Text>
              </View>
            </View>

            <View style={[styles.statCard, styles.statCardHighlight, styles.installmentCard]}>
              <Text style={[styles.statLabel, { color: COLORS.primary }]}>Next Installment</Text>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>₹35,000</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Trips</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tripList}>
            {trips.map((trip, index) => (
              <View key={index} style={styles.tripCard}>
                <View style={styles.tripImageWrap}>
                  <Image source={{ uri: trip.image }} style={styles.tripImage} />
                  <View style={styles.tripStatusPill}>
                    <Text style={styles.tripStatusText}>{index === 0 ? 'CONFIRMED' : index === 1 ? 'PAST TRIP' : 'PLANNED'}</Text>
                  </View>
                </View>

                <View style={styles.tripBody}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <View style={styles.tripMetaRow}>
                    <MaterialIcons name="calendar-today" size={14} color={COLORS.secondary} />
                    <Text style={styles.tripMeta}>{trip.date}</Text>
                  </View>
                  <View style={styles.tripMetaRow}>
                    <MaterialIcons name="group" size={14} color={COLORS.secondary} />
                    <Text style={styles.tripMeta}>{index === 0 ? 'Group of 12' : index === 1 ? 'Completed' : 'Open slots'}</Text>
                  </View>
                  <Text style={styles.tripDescription}>{trip.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.recentCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityIconWrap}>
                  <MaterialIcons name="volunteer-activism" size={18} color={COLORS.saffron} />
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityText}>Donation of <Text style={styles.activityStrong}>₹5,001</Text> to Temple Restoration Fund</Text>
                  <Text style={styles.activityMeta}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIconWrapAlt}>
                  <MaterialIcons name="payments" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityText}>Payment received for <Text style={styles.activityStrong}>Kailash Yatra</Text></Text>
                  <Text style={styles.activityMeta}>Yesterday, 4:30 PM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIconWrapTertiary}>
                  <MaterialIcons name="notifications" size={18} color={COLORS.secondary} />
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityText}>Packing list updated for <Text style={styles.activityStrong}>Varanasi Walk</Text></Text>
                  <Text style={styles.activityMeta}>3 days ago</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIconWrapSecondary}>
                  <MaterialIcons name="assignment-ind" size={18} color={COLORS.secondary} />
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityText}>Medical certificate verified</Text>
                  <Text style={styles.activityMeta}>1 week ago</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.historyButton}>
              <Text style={styles.historyButtonText}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsCard}>
            <View style={styles.quickActionsInner}>
              <Text style={styles.quickTitle}>Plan your next journey?</Text>
              <Text style={styles.quickText}>Explore upcoming winter retreats and pilgrimages.</Text>
              <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.getParent()?.navigate('Travel' as never)}>
                <Text style={styles.exploreButtonText}>Explore</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickGlow} />
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 130 },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.chip,
  },
  profileImage: { width: '100%', height: '100%' },
  logo: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  notification: { fontSize: 24 },
  welcomeSection: { paddingHorizontal: 22, marginTop: 10, marginBottom: 20 },
  welcomeTitle: { fontSize: 34, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  welcomeText: { fontSize: 16, lineHeight: 24, color: COLORS.secondary },
  stackLayout: { paddingHorizontal: 22, gap: 18 },
  glassCard: {
    backgroundColor: 'rgba(255, 253, 248, 0.82)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(219,194,176,0.5)',
    shadowColor: '#5b4636',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  headerTextBlock: { flex: 1, paddingRight: 10 },
  kicker: { color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, fontWeight: '700' },
  cardHeading: { marginTop: 4, color: COLORS.text, fontSize: 20, fontWeight: '700' },
  nextBadge: { backgroundColor: 'rgba(181, 95, 0, 0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  nextBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { color: COLORS.text, fontSize: 16 },
  progressBold: { fontWeight: '700' },
  progressAmount: { color: COLORS.secondary, fontSize: 13 },
  progressTrack: { width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#e4e2de', marginBottom: 18 },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: COLORS.saffron },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(219,194,176,0.35)' },
  statCardHighlight: { backgroundColor: 'rgba(181, 95, 0, 0.04)', borderColor: 'rgba(181, 95, 0, 0.12)' },
  installmentCard: { marginTop: 12 },
  statLabel: { color: COLORS.secondary, fontSize: 12, marginBottom: 6, fontWeight: '700' },
  statValue: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  viewAll: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  tripList: { gap: 14 },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(219,194,176,0.4)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  tripImageWrap: { height: 155, position: 'relative', overflow: 'hidden' },
  tripImage: { width: '100%', height: '100%' },
  tripStatusPill: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tripStatusText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  tripBody: { padding: 14 },
  tripTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  tripMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tripMeta: { color: COLORS.secondary, fontSize: 12 },
  tripDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  recentCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(219,194,176,0.4)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  activityList: { gap: 16, marginTop: 8 },
  activityItem: { flexDirection: 'row', gap: 12 },
  activityIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245, 158, 11, 0.12)', alignItems: 'center', justifyContent: 'center' },
  activityIconWrapAlt: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(181, 95, 0, 0.08)', alignItems: 'center', justifyContent: 'center' },
  activityIconWrapTertiary: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(110, 87, 71, 0.08)', alignItems: 'center', justifyContent: 'center' },
  activityIconWrapSecondary: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(136, 115, 100, 0.1)', alignItems: 'center', justifyContent: 'center' },
  activityBody: { flex: 1 },
  activityText: { color: COLORS.text, fontSize: 14, lineHeight: 21 },
  activityStrong: { fontWeight: '700' },
  activityMeta: { color: COLORS.secondary, fontSize: 12, marginTop: 4 },
  historyButton: { marginTop: 18, borderWidth: 1, borderColor: 'rgba(110,87,71,0.2)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(110,87,71,0.03)' },
  historyButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  quickActionsCard: { backgroundColor: COLORS.primary, borderRadius: 18, overflow: 'hidden', minHeight: 170, justifyContent: 'flex-end' },
  quickActionsInner: { padding: 18, zIndex: 2 },
  quickTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  quickText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  exploreButton: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  exploreButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  quickGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, right: -18, bottom: -24, backgroundColor: 'rgba(245, 158, 11, 0.18)' },
})
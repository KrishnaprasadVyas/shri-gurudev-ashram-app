import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'

type DetailsRoute = RouteProp<TravelStackParamList, 'PackageDetails'>;
type DetailsNav = NativeStackNavigationProp<TravelStackParamList, 'PackageDetails'>;

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

export default function PackageDetailsScreen() {
  const route = useRoute<DetailsRoute>()
  const navigation = useNavigation<DetailsNav>()
  const setSelectedPackage = useBookingDraftStore((state) => state.setSelectedPackage)
  const { packageItem } = route.params

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Package Details</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroImage}>
            <Text style={styles.heroImageText}>Sacred Journey</Text>
          </View>
          <View style={styles.heroBody}>
            <View style={styles.badge}><Text style={styles.badgeText}>{packageItem.duration}</Text></View>
            <Text style={styles.title}>{packageItem.title}</Text>
            <Text style={styles.price}>{packageItem.price}</Text>
            <Text style={styles.description}>{packageItem.description}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>What is included</Text>
          <Text style={styles.bullet}>• Premium stay and temple transfers</Text>
          <Text style={styles.bullet}>• Guided darshan and support staff</Text>
          <Text style={styles.bullet}>• Meals and pilgrimage essentials</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setSelectedPackage(packageItem)
            navigation.navigate('BookingForm', { packageItem })
          }}
        >
          <Text style={styles.primaryButtonText}>Proceed to Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40, gap: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  backButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  topTitle: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chip },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 18, elevation: 3 },
  heroImage: { height: 210, backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center' },
  heroImageText: { color: COLORS.primary, fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  heroBody: { padding: 18 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#ffedd5', marginBottom: 12 },
  badgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  bullet: { color: COLORS.muted, fontSize: 14, lineHeight: 22, marginBottom: 6 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

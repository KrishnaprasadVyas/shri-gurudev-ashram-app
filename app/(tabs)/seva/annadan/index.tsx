import React, { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSevaStore } from '../../../../src/store/useSevaStore'
import { fetchSevaPricing } from '../../../../src/services/seva'
import { PURPOSE_OPTIONS, type PurposeOption } from '../../../../src/features/annadan/constants'
import type { AnnadanBookingPurpose } from '../../../../src/types/seva'
import { useTabBarBottomPadding } from '../../../../src/hooks/useTabBarBottomPadding'

// ─── What Annadan means ───────────────────────────────────────────────────────
const ANNADAN_STEPS_INFO = [
  { icon: 'restaurant', title: 'Mahaprasad is prepared', body: 'The Ashram kitchen prepares a full Mahaprasad meal for every devotee who visits that day — hundreds of plates.' },
  { icon: 'favorite', title: 'Your name is honoured', body: 'The Annadan is announced in your name (or your family\'s name) during the day\'s aarti.' },
  { icon: 'volunteer-activism', title: 'Every visitor is fed', body: 'No devotee goes hungry. Your donation ensures everyone receives prasad with Guruji\'s blessings.' },
]

function PurposeCard({ opt, onSelect, delay }: { opt: PurposeOption, onSelect: () => void, delay: number }) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={animatedStyle}>
      <Pressable
        onPressIn={() => scale.value = withSpring(0.96, { damping: 15, stiffness: 300 })}
        onPressOut={() => scale.value = withSpring(1, { damping: 15, stiffness: 300 })}
        onPress={onSelect}
        style={({ pressed }) => [styles.purposeCard, pressed && styles.purposeCardPressed]}
      >
        <View style={styles.purposeIcon}>
          <MaterialIcons name={opt.icon as any} size={24} color="#8B5A00" />
        </View>
        <View style={styles.purposeTextWrap}>
          <Text style={styles.purposeTitle}>{opt.title}</Text>
          <Text style={styles.purposeDescription}>{opt.description}</Text>
        </View>
        <View style={styles.chevronWrap}>
          <MaterialIcons name="chevron-right" size={24} color="#B9B1A9" />
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnnadanPurposeRoute() {
  const router = useRouter()
  const bottomPadding = useTabBarBottomPadding()
  const setSevaType = useSevaStore((s) => s.setSevaType)
  const setBookingPurpose = useSevaStore((s) => s.setBookingPurpose)
  const resetSeva = useSevaStore((s) => s.resetSeva)

  const [annadanPrice, setAnnadanPrice] = useState<number>(2100)

  useEffect(() => {
    fetchSevaPricing().then((p) => { if (p?.annadan) setAnnadanPrice(p.annadan) }).catch(() => {})
    resetSeva()
    setSevaType('annadan')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onSelectPurpose = (purpose: AnnadanBookingPurpose) => {
    setBookingPurpose(purpose)
    router.push('/(tabs)/seva/annadan/details' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Sponsor a Day</Text>
            <Text style={styles.title}>Annadan Seva</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroIconRing}>
              <MaterialIcons name="restaurant" size={32} color="#8B5A00" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroBannerTitle}>Mahaprasad Seva</Text>
              <Text style={styles.heroBannerBody}>
                Sponsor one full day's Mahaprasad for all devotees visiting Shri Gurudev Ashram.
              </Text>
              <View style={styles.heroPricePill}>
                <Text style={styles.heroPriceText}>₹{annadanPrice.toLocaleString('en-IN')} · Full Day Sponsorship</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Purpose Selection */}
        <Animated.View entering={FadeInDown.delay(60).duration(500)} style={styles.purposeHeaderBlock}>
          <Text style={styles.purposeHeading}>Select the Purpose of Annadan</Text>
          <Text style={styles.purposeSubheading}>
            Choose the occasion for offering your Annadan Seva.
          </Text>
        </Animated.View>

        {PURPOSE_OPTIONS.map((opt, i) => (
          <PurposeCard key={opt.key} opt={opt} onSelect={() => onSelectPurpose(opt.key)} delay={120 + i * 60} />
        ))}

        {/* What is Annadan? */}
        <Animated.View entering={FadeInDown.delay(380).duration(500)} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What is Annadan?</Text>
          <Text style={styles.sectionBody}>
            <Text style={styles.sectionBold}>Annadan</Text> means the gift of food. Every day at Shri Gurudev Ashram, hundreds of devotees receive Mahaprasad — food prepared with devotion and offered to the Lord before being served.
          </Text>
          <Text style={styles.sectionBody}>
            When you sponsor a day's Annadan, you become the <Text style={styles.sectionBold}>sole patron</Text> of that day's Mahaprasad. The seva is performed in your name or your family's name.
          </Text>
        </Animated.View>

        {/* What happens on your day */}
        <Animated.View entering={FadeInDown.delay(420).duration(500)}>
          <Text style={styles.stepsHeading}>On Your Sponsored Day</Text>
          {ANNADAN_STEPS_INFO.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <MaterialIcons name={step.icon as any} size={20} color="#8B5A00" />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Gurudev quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Annadan is the highest dana. He who feeds the hungry earns the merit of all other danas combined."
          </Text>
          <Text style={styles.quoteSource}>— Shrimad Bhagavatam</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 56, gap: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F0E7DD',
  },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 26, fontWeight: '900', marginTop: 2 },

  // Hero banner
  heroBanner: {
    borderRadius: 24, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroIconRing: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.90)', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  heroTextWrap: { flex: 1, gap: 6 },
  heroBannerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', lineHeight: 24 },
  heroBannerBody: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 20 },
  heroPricePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  heroPriceText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Purpose selection
  purposeHeaderBlock: {
    marginTop: 14,
    marginBottom: 8,
    gap: 6,
  },
  purposeHeading: { color: '#2B231B', fontSize: 24, fontWeight: '800', lineHeight: 32 },
  purposeSubheading: { color: '#7E7162', fontSize: 15, lineHeight: 22, marginTop: 4 },

  purposeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 24, padding: 18,
    borderWidth: 1.5, borderColor: '#F0E7DD',
    shadowColor: '#5B4636', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  purposeCardPressed: { backgroundColor: '#FFF9F0', borderColor: '#E8D5BE' },
  purposeIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  purposeTextWrap: { flex: 1, gap: 3 },
  purposeTitle: { color: '#2B231B', fontSize: 16, fontWeight: '900' },
  purposeDescription: { color: '#7E7162', fontSize: 13, lineHeight: 18 },
  chevronWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FAF6F0', alignItems: 'center', justifyContent: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 10,
  },
  sectionTitle: { color: '#2B231B', fontSize: 17, fontWeight: '900' },
  sectionBody: { color: '#4F4337', fontSize: 14, lineHeight: 22 },
  sectionBold: { fontWeight: '900', color: '#8B5A00' },

  // Steps
  stepsHeading: { color: '#2B231B', fontSize: 17, fontWeight: '900', marginLeft: 2 },
  stepRow: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#F0E7DD',
  },
  stepIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepText: { flex: 1, gap: 3 },
  stepTitle: { color: '#2B231B', fontSize: 14, fontWeight: '800' },
  stepBody: { color: '#7E7162', fontSize: 13, lineHeight: 20 },

  // Quote
  quoteCard: {
    backgroundColor: 'rgba(216,155,29,0.08)', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(216,155,29,0.18)', gap: 6,
  },
  quoteText: { color: '#5A4A42', fontSize: 14, lineHeight: 22, fontStyle: 'italic', textAlign: 'center' },
  quoteSource: { color: '#9E9080', fontSize: 12, fontWeight: '700', textAlign: 'center' },
})

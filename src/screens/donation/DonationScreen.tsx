import React, { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Reanimated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

/* ─── Design tokens ─── */
const C = {
  bg: '#FAF6F0',
  card: '#FFFFFF',
  cardBorder: '#F0E7DD',
  saffron: '#B8860B',
  saffronDark: '#8B6914',
  saffronLight: '#FFF5E1',
  saffronGlow: '#D4A017',
  orange: '#E65C00',
  text: '#2B231B',
  textSoft: '#7E7162',
  textMuted: '#9E9080',
  accent: '#993D00',
  ivory: '#FFF9F0',
  trustGreen: '#3D7A4A',
  shadow: '#5b4636',
}

const { width: SCREEN_W } = Dimensions.get('window')

/* ─── Donation Categories (from shrigurudevashram.org/donate) ─── */
export type SevaCategory = {
  id: string
  title: string
  icon: keyof typeof MaterialIcons.glyphMap
  description: string
}

export const SEVA_CATEGORIES: SevaCategory[] = [
  {
    id: 'annadan',
    title: 'Annadan Seva',
    icon: 'restaurant',
    description: 'Provide meals to devotees and visitors at the ashram.',
  },
  {
    id: 'education',
    title: 'Education',
    icon: 'school',
    description: 'Support learning, scholarships, and student welfare.',
  },
  {
    id: 'medical',
    title: 'Medical Seva',
    icon: 'local-hospital',
    description: 'Support healthcare and medical assistance initiatives.',
  },
  {
    id: 'nirman',
    title: 'Ashram Nirman',
    icon: 'domain',
    description: 'Contribute to ashram construction and development.',
  },
  {
    id: 'ashram-seva',
    title: 'Ashram Seva',
    icon: 'spa',
    description: 'Support daily spiritual activities and ashram operations.',
  },
  {
    id: 'goushala',
    title: 'Goushala Seva',
    icon: 'pets',
    description: 'Help care for cows at the ashram goushala.',
  },
  {
    id: 'anath',
    title: 'Anath Seva',
    icon: 'favorite',
    description: 'Support orphan welfare and child care programmes.',
  },
  {
    id: 'general',
    title: 'General Seva',
    icon: 'volunteer-activism',
    description: 'General contribution towards ashram welfare activities.',
  },
]

/* ─── Preset Amounts ─── */
const PRESET_AMOUNTS = [501, 1100, 2100, 5100, 11000]

/* ─── Impact items ─── */
const IMPACT_ITEMS = [
  {
    icon: 'restaurant' as const,
    title: 'Annadan Seva',
    desc: 'Help provide meals to devotees and visitors.',
  },
  {
    icon: 'school' as const,
    title: 'Education',
    desc: 'Support learning and student welfare.',
  },
  {
    icon: 'local-hospital' as const,
    title: 'Medical Seva',
    desc: 'Support healthcare initiatives for the needy.',
  },
]

/* ─── Trust badges ─── */
const TRUST_BADGES = [
  { icon: 'receipt-long' as const, label: '80G Tax Benefit Available' },
  { icon: 'lock' as const, label: 'Secure Donations' },
  { icon: 'verified' as const, label: 'Trusted Ashram Support' },
]

/* ─── Donation State (Future-ready for Razorpay) ─── */
export type DonationState = {
  categoryId: string | null
  amount: number | null
  customAmount: string
  fullName: string
  mobile: string
  email: string
}

const initialDonationState: DonationState = {
  categoryId: null,
  amount: null,
  customAmount: '',
  fullName: '',
  mobile: '',
  email: '',
}

/* ────────────────────────────────────────────────────────────── */
/*  Animated Card Wrapper                                        */
/* ────────────────────────────────────────────────────────────── */
function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <Reanimated.View entering={FadeInDown.delay(delay).duration(500).springify()}>
      {children}
    </Reanimated.View>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  CategoryCard                                                 */
/* ────────────────────────────────────────────────────────────── */
function CategoryCard({
  item,
  selected,
  onPress,
}: {
  item: SevaCategory
  selected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 })
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 })
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Reanimated.View
        style={[
          styles.categoryCard,
          selected && styles.categoryCardSelected,
          animStyle,
        ]}
      >
        <View
          style={[
            styles.categoryIconWrap,
            selected && styles.categoryIconWrapSelected,
          ]}
        >
          <MaterialIcons
            name={item.icon}
            size={22}
            color={selected ? '#fff' : C.saffron}
          />
        </View>
        <Text
          style={[
            styles.categoryTitle,
            selected && styles.categoryTitleSelected,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.categoryDesc} numberOfLines={2}>
          {item.description}
        </Text>
        {selected && (
          <View style={styles.categoryCheck}>
            <MaterialIcons name="check-circle" size={18} color={C.saffron} />
          </View>
        )}
      </Reanimated.View>
    </Pressable>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  AmountChip                                                   */
/* ────────────────────────────────────────────────────────────── */
function AmountChip({
  value,
  selected,
  onPress,
}: {
  value: number
  selected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 })
      }}
    >
      <Reanimated.View
        style={[
          styles.amountChip,
          selected && styles.amountChipSelected,
          animStyle,
        ]}
      >
        <Text
          style={[
            styles.amountChipText,
            selected && styles.amountChipTextSelected,
          ]}
        >
          ₹{value.toLocaleString('en-IN')}
        </Text>
      </Reanimated.View>
    </Pressable>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  DonationScreen                                               */
/* ────────────────────────────────────────────────────────────── */
export default function DonationScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)

  const [state, setState] = useState<DonationState>(initialDonationState)

  // Button press animation
  const btnScale = useSharedValue(1)
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }))

  /* ─── Handlers ─── */
  const selectCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categoryId: prev.categoryId === id ? null : id,
    }))
  }, [])

  const selectAmount = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      amount: prev.amount === amount ? null : amount,
      customAmount: '',
    }))
  }, [])

  const setCustomAmount = useCallback((text: string) => {
    // Allow only digits
    const cleaned = text.replace(/[^0-9]/g, '')
    setState((prev) => ({
      ...prev,
      customAmount: cleaned,
      amount: null,
    }))
  }, [])

  const updateField = useCallback(
    (field: 'fullName' | 'mobile' | 'email', value: string) => {
      setState((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleDonate = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Donation payments will be enabled soon. Thank you for your seva bhavna. 🙏',
    )
  }, [])

  const effectiveAmount =
    state.amount ?? (state.customAmount ? parseInt(state.customAmount, 10) : 0)

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <Reanimated.View
        entering={FadeInUp.duration(400)}
        style={styles.header}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialIcons name="arrow-back" size={22} color={C.saffron} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Donate</Text>
          <Text style={styles.headerSubtitle}>
            Support seva, devotion, and spiritual upliftment.
          </Text>
        </View>
        <View style={styles.lotusWrap}>
          <MaterialIcons name="self-improvement" size={26} color={C.saffron} />
        </View>
      </Reanimated.View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Hero Card ─── */}
        <AnimatedSection delay={80}>
          <LinearGradient
            colors={['#FFF5E1', '#FAF6F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroIconRow}>
              <MaterialIcons name="auto-awesome" size={20} color={C.saffronGlow} />
              <Text style={styles.heroQuote}>
                "Every contribution becomes seva."
              </Text>
              <MaterialIcons name="auto-awesome" size={20} color={C.saffronGlow} />
            </View>
            <Text style={styles.heroBody}>
              Your support helps sustain spiritual activities, food seva,
              education, medical assistance, and ashram development.
            </Text>
          </LinearGradient>
        </AnimatedSection>

        {/* ─── Categories ─── */}
        <AnimatedSection delay={160}>
          <Text style={styles.sectionLabel}>Choose a Seva</Text>
          <View style={styles.categoryGrid}>
            {SEVA_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                selected={state.categoryId === cat.id}
                onPress={() => selectCategory(cat.id)}
              />
            ))}
          </View>
        </AnimatedSection>

        {/* ─── Amount Selection ─── */}
        <AnimatedSection delay={240}>
          <Text style={styles.sectionLabel}>Choose Contribution</Text>
          <View style={styles.amountRow}>
            {PRESET_AMOUNTS.map((amt) => (
              <AmountChip
                key={amt}
                value={amt}
                selected={state.amount === amt}
                onPress={() => selectAmount(amt)}
              />
            ))}
          </View>

          <View style={styles.customAmountWrap}>
            <Text style={styles.customAmountLabel}>Or enter custom amount</Text>
            <View style={styles.customInputRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.customInput}
                value={state.customAmount}
                onChangeText={setCustomAmount}
                placeholder="Enter amount"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={7}
              />
            </View>
          </View>
        </AnimatedSection>

        {/* ─── Donor Details ─── */}
        <AnimatedSection delay={320}>
          <Text style={styles.sectionLabel}>Donor Details</Text>
          <View style={styles.formCard}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={state.fullName}
                onChangeText={(v) => updateField('fullName', v)}
                placeholder="Your full name"
                placeholderTextColor={C.textMuted}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.formDivider} />
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={styles.fieldInput}
                value={state.mobile}
                onChangeText={(v) => updateField('mobile', v)}
                placeholder="10-digit mobile number"
                placeholderTextColor={C.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <View style={styles.formDivider} />
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                Email{' '}
                <Text style={styles.optionalBadge}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={state.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="your@email.com"
                placeholderTextColor={C.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </AnimatedSection>

        {/* ─── Impact Section ─── */}
        <AnimatedSection delay={400}>
          <Text style={styles.sectionLabel}>Your Impact</Text>
          {IMPACT_ITEMS.map((item) => (
            <View key={item.title} style={styles.impactCard}>
              <View style={styles.impactIconWrap}>
                <MaterialIcons name={item.icon} size={20} color={C.saffron} />
              </View>
              <View style={styles.impactContent}>
                <Text style={styles.impactTitle}>{item.title}</Text>
                <Text style={styles.impactDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </AnimatedSection>

        {/* ─── Trust Section ─── */}
        <AnimatedSection delay={480}>
          <View style={styles.trustCard}>
            {TRUST_BADGES.map((badge, i) => (
              <View
                key={badge.label}
                style={[
                  styles.trustRow,
                  i < TRUST_BADGES.length - 1 && styles.trustRowBorder,
                ]}
              >
                <MaterialIcons
                  name={badge.icon}
                  size={18}
                  color={C.trustGreen}
                />
                <Text style={styles.trustLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedSection>

        {/* Bottom spacer for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Sticky Donate Button ─── */}
      <Reanimated.View
        style={[
          styles.stickyFooter,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Pressable
          onPressIn={() => {
            btnScale.value = withSpring(0.96, { damping: 15 })
          }}
          onPressOut={() => {
            btnScale.value = withSpring(1, { damping: 15 })
          }}
          onPress={handleDonate}
        >
          <Reanimated.View style={btnStyle}>
            <LinearGradient
              colors={['#8B6914', '#B8860B', '#D4A017']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.donateBtn}
            >
              <MaterialIcons name="favorite" size={18} color="#fff" />
              <Text style={styles.donateBtnText}>
                {effectiveAmount > 0
                  ? `Donate ₹${effectiveAmount.toLocaleString('en-IN')}`
                  : 'Donate Now'}
              </Text>
            </LinearGradient>
          </Reanimated.View>
        </Pressable>
      </Reanimated.View>
    </View>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                       */
/* ────────────────────────────────────────────────────────────── */
const CARD_RADIUS = 24
const CARD_BORDER = { borderWidth: 1, borderColor: C.cardBorder }

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...CARD_BORDER,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSoft,
    fontWeight: '600',
    marginTop: 2,
  },
  lotusWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.saffronLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Scroll ── */
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 22,
  },

  /* ── Hero ── */
  heroCard: {
    borderRadius: CARD_RADIUS,
    padding: 22,
    ...CARD_BORDER,
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroQuote: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    color: C.saffronDark,
    textAlign: 'center',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 22,
    color: C.textSoft,
    fontWeight: '500',
  },

  /* ── Section Label ── */
  sectionLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  /* ── Category Grid ── */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  categoryCard: {
    width: (SCREEN_W - 36 - 10) / 2, // 2 columns
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 14,
    ...CARD_BORDER,
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: C.saffron,
    borderWidth: 1.5,
    backgroundColor: C.saffronLight,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.saffronLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconWrapSelected: {
    backgroundColor: C.saffron,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    marginBottom: 3,
  },
  categoryTitleSelected: {
    color: C.saffronDark,
  },
  categoryDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: C.textMuted,
    fontWeight: '500',
  },
  categoryCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  /* ── Amounts ── */
  amountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  amountChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: C.card,
    ...CARD_BORDER,
  },
  amountChipSelected: {
    backgroundColor: C.saffron,
    borderColor: C.saffron,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  amountChipTextSelected: {
    color: '#fff',
  },
  customAmountWrap: {
    marginTop: 14,
  },
  customAmountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
    ...CARD_BORDER,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: C.saffron,
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },

  /* ── Donor Form ── */
  formCard: {
    backgroundColor: C.card,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 18,
    ...CARD_BORDER,
  },
  formField: {
    paddingVertical: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    padding: 0,
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  formDivider: {
    height: 1,
    backgroundColor: C.cardBorder,
  },

  /* ── Impact ── */
  impactCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    ...CARD_BORDER,
  },
  impactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.saffronLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactContent: {
    flex: 1,
    justifyContent: 'center',
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  impactDesc: {
    fontSize: 12,
    color: C.textSoft,
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* ── Trust ── */
  trustCard: {
    backgroundColor: C.card,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 18,
    ...CARD_BORDER,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  trustRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  trustLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSoft,
  },

  /* ── Sticky Donate ── */
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: 'rgba(250,246,240,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(184,134,11,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 27,
  },
  donateBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.4,
  },
})

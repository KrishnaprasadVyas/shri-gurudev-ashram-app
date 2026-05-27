import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  PanResponder,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const COLORS = {
  background: '#F8F6F2',
  primary: '#8B5A00',
  secondaryText: '#6B6B6B',
  white: '#FFFFFF',
  gold: '#D89B1D',
  shadow: '#000',
}

const services = [
  {
    title: 'Book Travel',
    icon: 'flight',
    route: 'Travel' as const,
  },
  {
    title: 'Donations',
    icon: 'volunteer-activism',
    route: 'Profile' as const,
  },
  {
    title: 'Verify Collector',
    icon: 'verified-user',
    route: 'Notifications' as const,
  },
  {
    title: 'Announcements',
    icon: 'campaign',
    route: 'Notifications' as const,
  },
]

const infoSections = [
  {
    title: 'AARTIS AND DISCOURSES',
    items: [
      'Kakda Aarti – 4:00 AM',
      'Daily Morning Aarti – 6:00 AM',
      'Breakfast',
      'Lunch',
      'Haripath – 6:00 PM',
      'Dinner',
      'Gita Path – 8:00 PM',
    ],
  },
  {
    title: 'Darshan Timings',
    items: [
      '04:30 am to 01:00 pm',
      '04:30 pm to 09:00 pm',
      'Temple timings may be changed on special occasions.',
    ],
  },
  {
    title: 'Shri Gurudev Ashram',
    items: [
      'Shri Gurudev Ashram, Palaskhed Sapkal, Tehsil Chikhli, District Buldhana, Maharashtra - 443001',
      'Swami Harichaitanya Shanti Ashram Trust, Datala, Tehsil Malkapur, District Buldhana - 443102',
    ],
  },
  {
    title: 'FOLLOW US',
    items: [
      '@swamiharichaitanyanands',
      'Phone: 9158740007, 9834151577',
      'Website: www.shrigurudevashram.org',
      'Email: info@shrigurudevashram.org',
      'Email: info@shantiashramtrust.org',
    ],
  },
  {
    title: 'Ashram Branches',
    items: [
      'Shri Vaishnavi Gita Ashram, Malvihir, District Buldhana',
      'Shri Harichaitanya Shanti Ashram, Datala, Tehsil Malkapur, District Buldhana',
      'Shri Gurudev Ashram, Muktainagar, District Jalgaon',
      'Shri Gurudev Ashram, Kothala, Tehsil Manwat, District Parbhani',
      'Shri Harichaitanya Godham, Shindi Harali, Chikhli, District Buldhana',
      'Shri Balmukund Ashram, Belgaum, Karnataka',
    ],
  },
  {
    title: 'Bank Account Details',
    items: [
      'Shri Gurudev Ashram',
      'State Bank of India',
      'A/c No: 32035015646',
      'IFSC: SBIN0008409',
      'Branch: Shelsur',
      'Swami Hari Chaitanya Shanti Ashram Trust',
      'HDFC Bank',
      'A/c: 50200089955981',
      'IFSC: HDFC0002489',
      'Branch: Buldhana',
    ],
  },
]

const dedicationText = 'Dedicated to Param Pujya Shri Swami Harichaitanyanand Saraswatiji Maharaj'

type InfoSection = (typeof infoSections)[number]

function InfoAccordionCard({
  section,
  expanded,
  onToggle,
}: {
  section: InfoSection
  expanded: boolean
  onToggle: () => void
}) {
  const arrowAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(arrowAnim, {
      toValue: expanded ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start()
  }, [arrowAnim, expanded])

  const rotation = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const visibleItems = expanded ? section.items : section.items.slice(0, Math.min(2, section.items.length))

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{section.title}</Text>
      <View style={styles.divider} />

      {visibleItems.map((item, itemIndex) => (
        <View key={`${section.title}-${itemIndex}`}>
          <Text style={[styles.infoText, itemIndex === 0 && styles.infoTextFirst]}>{item}</Text>
          {itemIndex < visibleItems.length - 1 && <View style={styles.subDivider} />}
        </View>
      ))}

      {section.items.length > visibleItems.length ? (
        <Text style={styles.previewHint}>Tap the arrow to view more</Text>
      ) : null}

      <TouchableOpacity onPress={onToggle} style={styles.expandButton} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={30} color={COLORS.primary} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const drawerAnim = useRef(new Animated.Value(0)).current
  const heroFade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }, [])

  useEffect(() => {
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: drawerOpen ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start()
  }, [drawerAnim, drawerOpen, heroFade])

  const drawerTranslateX = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-320, 0],
  })

  const overlayOpacity = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.38],
  })

  const drawerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dy) < 18,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            drawerAnim.setValue(Math.max(0, 1 + gestureState.dx / 240))
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -60) {
            setDrawerOpen(false)
          } else {
            setDrawerOpen(true)
          }
        },
      }),
    [drawerAnim],
  )

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  const toggleSection = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedSections((current) => ({
      ...current,
      [title]: !current[title],
    }))
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 6 }] }>
          <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
              <MaterialIcons name="menu" size={30} color={COLORS.primary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>ASHRAM APP</Text>

            <TouchableOpacity>
              <MaterialIcons name="notifications-none" size={30} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.heroFadeWrap, { opacity: heroFade }] }>
            <View style={styles.heroCard}>
              <View style={styles.heroTitleBlock}>
                <Text style={styles.heroAppTitle}>ASHRAM APP</Text>

                <View style={styles.radheRow}>
                  <MaterialIcons name="music-note" size={22} color={COLORS.gold} />
                  <Text style={styles.radheText}>राधे राधे</Text>
                  <MaterialIcons name="music-note" size={22} color={COLORS.gold} />
                </View>
              </View>

              <View style={styles.gurudevImageWrap}>
                <Image source={require('../../../assets/gurudev.jpeg')} style={styles.gurudevImage} />
              </View>

              <Text style={styles.gurudevCopy}>
                Param Pujya Shri Swami Harichaitanyanand Saraswatiji Maharaj's seva kshetra for bhakti, gyan and nishkam seva
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>Essential Services</Text>

          <View style={styles.grid}>
            {services.map((item, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                <MaterialIcons name={item.icon as any} size={42} color={COLORS.primary} />

                <Text style={styles.cardText}>{item.title}</Text>

                <View style={styles.circleDecoration} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoSection}>
            {infoSections.map((section) => (
              <InfoAccordionCard
                key={section.title}
                section={section}
                expanded={!!expandedSections[section.title]}
                onToggle={() => toggleSection(section.title)}
              />
            ))}

            <View style={styles.dedicationCard}>
              <Text style={styles.dedicationText}>{dedicationText}</Text>
              <View style={styles.divider} />
              <Text style={styles.footerNoteText}>Donations are tax-exempt under Section 80G of the Income Tax Act, 1961.</Text>
            </View>
          </View>
        </ScrollView>

        {drawerOpen ? (
          <Pressable style={styles.backdrop} onPress={closeDrawer} />
        ) : null}

        <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerTranslateX }] }]} {...drawerPanResponder.panHandlers}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>ASHRAM APP</Text>
            <TouchableOpacity onPress={closeDrawer}>
              <MaterialIcons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {['About', 'Gurudev', 'Activities', 'Events', 'Gallery', 'Shop (Coming Soon)', 'Testimonials', 'Contact'].map((item) => (
            <TouchableOpacity key={item} style={styles.drawerItem} onPress={closeDrawer}>
              <Text style={styles.drawerItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.10)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  heroFadeWrap: {
    paddingHorizontal: 22,
  },
  heroCard: {
    marginTop: 6,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,155,29,0.10)',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTitleBlock: {
    alignItems: 'center',
    marginBottom: 14,
  },
  heroAppTitle: {
    fontSize: 24,
    letterSpacing: 2,
    color: COLORS.primary,
    fontWeight: '800',
  },
  radheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  radheText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  gurudevImageWrap: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#f6efe5',
  },
  gurudevImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ translateX: -27 }],
  },
  gurudevCopy: {
    color: COLORS.secondaryText,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 34,
    marginBottom: 24,
    marginHorizontal: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 34,
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A4A42',
    marginTop: 16,
  },
  circleDecoration: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.03)',
    bottom: -40,
    right: -40,
  },
  infoSection: {
    paddingHorizontal: 22,
    gap: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(216,155,29,0.10)',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,90,0,0.10)',
    marginBottom: 8,
  },
  subDivider: {
    height: 1,
    backgroundColor: 'rgba(139,90,0,0.08)',
    marginVertical: 8,
  },
  previewHint: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  expandButton: {
    marginTop: 14,
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,155,29,0.12)',
  },
  infoText: {
    color: '#4F4337',
    fontSize: 14,
    lineHeight: 22,
  },
  infoTextFirst: {
    marginTop: 4,
  },
  dedicationCard: {
    backgroundColor: 'rgba(216,155,29,0.10)',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(216,155,29,0.18)',
  },
  dedicationText: {
    color: COLORS.primary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '700',
  },
  footerNoteText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(32, 19, 9, 0.34)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: 'rgba(255, 252, 246, 0.96)',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(216,155,29,0.12)',
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 8, height: 0 },
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  drawerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,90,0,0.08)',
  },
  drawerItemText: {
    fontSize: 15,
    color: '#45382d',
    fontWeight: '600',
  },
})

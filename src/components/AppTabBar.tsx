import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const COLORS = {
  primary: '#B8860B',
  inactive: '#9CA3AF',
  barBg: '#FAF6F0',
  centerBtn: '#8B6914',
  centerBtnShadow: '#5b4636',
}

// Tab bar base height (without safe area)
const TAB_BAR_HEIGHT = 60
// Center elevated button dimensions
const CENTER_SIZE = 56
const CENTER_BORDER = 4
const CENTER_TOTAL = CENTER_SIZE + CENTER_BORDER * 2 // 64
// How much the button protrudes above the tab bar
const CENTER_OVERFLOW = CENTER_TOTAL / 2 + 4

const LEFT_TABS = [
  { name: 'home', label: 'Home', icon: 'home' as const },
  { name: 'travel', label: 'Travel', icon: 'explore' as const },
]

const RIGHT_TABS = [
  { name: 'notifications', label: 'Alerts', icon: 'notifications-none' as const },
  { name: 'profile', label: 'Profile', icon: 'person-outline' as const },
]

type AppTabBarProps = {
  state: {
    index: number
    routes: Array<{ name: string }>
  }
  navigation: {
    navigate: (name: string) => void
  }
}

export default function AppTabBar({ state, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const bottomPadding = Math.max(insets.bottom, 8)

  const renderTab = (item: { name: string; label: string; icon: string }) => {
    const routeIndex = state.routes.findIndex((r) => r.name === item.name)
    const focused = state.index === routeIndex
    const color = focused ? COLORS.primary : COLORS.inactive

    return (
      <Pressable
        key={item.name}
        onPress={() => navigation.navigate(item.name)}
        style={styles.tabButton}
      >
        <MaterialIcons name={item.icon as any} size={24} color={color} />
        <Text style={[styles.label, { color }]}>{item.label}</Text>
      </Pressable>
    )
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {/* The bar itself */}
      <View style={styles.barContainer}>
        <View style={[styles.bar, { height: TAB_BAR_HEIGHT }]}>
          {/* Left tabs */}
          {LEFT_TABS.map(renderTab)}

          {/* Center spacer — same width as elevated button so tabs spread evenly */}
          <View style={styles.centerSpacer} />

          {/* Right tabs */}
          {RIGHT_TABS.map(renderTab)}
        </View>

        {/* Center elevated button */}
        <View style={styles.centerAnchor}>
          <View style={styles.centerBtnOuter}>
            <Pressable
              style={styles.centerBtn}
              onPress={() => router.push('/donation' as never)}
            >
              <MaterialIcons name="volunteer-activism" size={26} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.barBg,
  },
  barContainer: {
    position: 'relative',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.barBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(184,134,11,0.08)',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Spacer in the row — matches center button width so tabs don't crowd
  centerSpacer: {
    width: CENTER_TOTAL + 12,
  },
  // Anchor container centers the button horizontally over the bar
  centerAnchor: {
    position: 'absolute',
    top: -CENTER_OVERFLOW,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  centerBtnOuter: {
    width: CENTER_TOTAL,
    height: CENTER_TOTAL,
    borderRadius: CENTER_TOTAL / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.centerBtnShadow,
        shadowOpacity: 0.22,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: COLORS.centerBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
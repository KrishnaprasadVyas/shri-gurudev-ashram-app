import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const COLORS = {
  primary: '#8B5A00',
  inactive: '#999999',
  surface: '#ffffff',
  border: '#e8ddd2',
  shadow: '#5b4636',
}

const TAB_ITEMS = [
  { name: 'Home', label: 'Home', icon: 'home' as const },
  { name: 'Travel', label: 'Travel', icon: 'explore' as const },
  { name: 'Notifications', label: 'Alerts', icon: 'notifications-none' as const },
  { name: 'Profile', label: 'Profile', icon: 'person-outline' as const },
]

export default function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView edges={[ 'bottom' ]} style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }] }>
      <View style={styles.container}>
        <View style={styles.row}>
          {TAB_ITEMS.slice(0, 2).map((item) => {
            const route = state.routes.find((routeItem) => routeItem.name === item.name)
            const routeIndex = state.routes.findIndex((routeItem) => routeItem.name === item.name)
            const focused = state.index === routeIndex
            const color = focused ? COLORS.primary : COLORS.inactive

            if (!route) return null

            return (
              <Pressable
                key={item.name}
                onPress={() => navigation.navigate(item.name)}
                style={styles.tabButton}
              >
                <MaterialIcons name={item.icon} size={28} color={color} />
                <Text style={[styles.label, { color }]}>{item.label}</Text>
              </Pressable>
            )
          })}

          <View style={styles.centerGap} />

          {TAB_ITEMS.slice(2).map((item) => {
            const routeIndex = state.routes.findIndex((routeItem) => routeItem.name === item.name)
            const focused = state.index === routeIndex
            const color = focused ? COLORS.primary : COLORS.inactive

            return (
              <Pressable
                key={item.name}
                onPress={() => navigation.navigate(item.name)}
                style={styles.tabButton}
              >
                <MaterialIcons name={item.icon} size={28} color={color} />
                <Text style={[styles.label, { color }]}>{item.label}</Text>
              </Pressable>
            )
          })}
        </View>

        <Pressable style={styles.donateButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="volunteer-activism" size={34} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  centerGap: {
    width: 64,
  },
  donateButton: {
    position: 'absolute',
    left: '50%',
    bottom: 26,
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
})
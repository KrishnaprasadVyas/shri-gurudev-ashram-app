import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SettingsRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Preferences</Text>
            <Text style={styles.title}>Settings</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SettingsRow icon="help-circle-outline" label="Help and Support" onPress={() => router.push('/help-support' as never)} />
          <SettingsRow icon="shield-checkmark-outline" label="Collector Portal" onPress={() => router.push('/collector-dashboard' as never)} />
          <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/(tabs)/notifications' as never)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={22} color="#7E7162" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D7C7B8" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0E7DD' },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 30, fontWeight: '900', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 26, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F0E7DD' },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F5EDE4' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { color: '#2B231B', fontSize: 15, fontWeight: '800' },
})

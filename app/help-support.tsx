import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const contacts = [
  { icon: 'phone', label: 'Phone', value: '9158740007, 9834151577' },
  { icon: 'language', label: 'Website', value: 'www.shrigurudevashram.org' },
  { icon: 'email', label: 'Email', value: 'info@shrigurudevashram.org' },
]

export default function HelpSupportRoute() {
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
            <Text style={styles.kicker}>Ashram support</Text>
            <Text style={styles.title}>Help and Contact</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <MaterialIcons name="support-agent" size={36} color="#E65C00" />
          <Text style={styles.heroTitle}>We are here to help</Text>
          <Text style={styles.heroText}>Reach out for yatra, payment, documents, darshan timings, or general ashram queries.</Text>
        </View>

        {contacts.map((item) => (
          <View key={item.label} style={styles.contactCard}>
            <View style={styles.iconWrap}>
              <MaterialIcons name={item.icon as any} size={22} color="#8B5A00" />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0E7DD' },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 30, fontWeight: '900', marginTop: 2 },
  heroCard: { backgroundColor: '#fff', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#F0E7DD', gap: 10 },
  heroTitle: { color: '#2B231B', fontSize: 22, fontWeight: '900' },
  heroText: { color: '#7E7162', fontSize: 14, lineHeight: 22 },
  contactCard: { flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#F0E7DD' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  contactCopy: { flex: 1 },
  contactLabel: { color: '#9E9080', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  contactValue: { color: '#2B231B', fontSize: 15, lineHeight: 21, fontWeight: '800', marginTop: 4 },
})

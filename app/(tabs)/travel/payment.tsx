import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore'

const modes = ['UPI', 'Card', 'Net Banking']

export default function PaymentRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const utr = useBookingDraftStore((state) => state.utr)
  const proofLabel = useBookingDraftStore((state) => state.proofLabel)
  const paymentMode = useBookingDraftStore((state) => state.paymentMode)
  const updateField = useBookingDraftStore((state) => state.updateField)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Payment proof</Text>
            <Text style={styles.title}>Complete verification</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment mode</Text>
          <View style={styles.modeRow}>
            {modes.map((mode) => (
              <Pressable
                key={mode}
                style={[styles.modeChip, paymentMode === mode && styles.modeChipSelected]}
                onPress={() => updateField('paymentMode', mode)}
              >
                <Text style={[styles.modeChipText, paymentMode === mode && styles.modeChipTextSelected]}>{mode}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="UTR Number" value={utr} onChangeText={(value) => updateField('utr', value)} placeholder="Enter UTR" />
          <Input label="Proof Label" value={proofLabel} onChangeText={(value) => updateField('proofLabel', value)} placeholder="Screenshot file name" />
        </View>

        <Pressable onPress={() => router.replace('/(tabs)/travel/success' as never)}>
          <LinearGradient colors={['#7B4B00', '#B97512', '#E0A31F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Submit Payment Proof</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Input({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9E9080" style={styles.input} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E7DD',
  },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 26, fontWeight: '900', marginTop: 2 },
  card: { borderRadius: 30, backgroundColor: '#fff', padding: 22, borderWidth: 1, borderColor: '#F0E7DD', gap: 16 },
  sectionTitle: { color: '#2B231B', fontSize: 20, fontWeight: '900' },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1.5, borderColor: '#F0E7DD', backgroundColor: '#fff' },
  modeChipSelected: { backgroundColor: '#E65C00', borderColor: '#E65C00' },
  modeChipText: { color: '#7E7162', fontSize: 14, fontWeight: '900' },
  modeChipTextSelected: { color: '#fff' },
  inputBlock: { gap: 8 },
  inputLabel: { color: '#2B231B', fontSize: 13, fontWeight: '900' },
  input: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F0E7DD',
    backgroundColor: '#FCFAF6',
    color: '#2B231B',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
  },
  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})

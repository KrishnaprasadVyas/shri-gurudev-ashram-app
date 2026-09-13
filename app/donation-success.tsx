import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { downloadDonationReceipt } from '../src/services/donation'

export default function DonationSuccessRoute() {
  const router = useRouter()
  const { donationId, amount, cause, receiptNumber, receiptToken } = useLocalSearchParams<{
    donationId?: string
    amount?: string
    cause?: string
    receiptNumber?: string
    receiptToken?: string
  }>()

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!donationId || isDownloading) return
    setIsDownloading(true)
    try {
      await downloadDonationReceipt({
        donationId,
        receiptNumber,
        receiptToken,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <MaterialIcons name="check" size={42} color="#fff" />
        </View>
        <Text style={styles.kicker}>Payment successful</Text>
        <Text style={styles.title}>Your seva is complete</Text>
        <Text style={styles.body}>Thank you for supporting Shri Gurudev Ashram.</Text>
        
        <View style={styles.card}>
          <Row label="Cause" value={cause || 'Donation'} />
          <Row label="Amount" value={`₹${amount || '0'}`} />
          <Row label="Donation ID" value={donationId || '—'} />
          {receiptNumber ? <Row label="Receipt #" value={receiptNumber} /> : null}
        </View>

        {donationId ? (
          <Pressable
            style={[styles.receiptButton, isDownloading && { opacity: 0.7 }]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#E65C00" size="small" />
            ) : (
              <View style={styles.receiptButtonInner}>
                <MaterialIcons name="receipt-long" size={20} color="#E65C00" />
                <Text style={styles.receiptButtonText}>Download 80G Receipt</Text>
              </View>
            )}
          </Pressable>
        ) : null}

        <Pressable onPress={() => router.replace('/(tabs)/home' as never)}>
          <LinearGradient colors={['#7B4B00', '#B97512', '#E0A31F']} style={styles.button}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  icon: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#3E8E41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    textAlign: 'center',
    color: '#3E8E41',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: { textAlign: 'center', color: '#2B231B', fontSize: 30, fontWeight: '900' },
  body: { textAlign: 'center', color: '#7E7162', fontSize: 15, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F0E7DD',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: '#7E7162', fontWeight: '700' },
  value: { flex: 1, color: '#2B231B', fontWeight: '900', textAlign: 'right' },
  receiptButton: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#E65C00',
    backgroundColor: '#FFF5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptButtonText: {
    color: '#E65C00',
    fontSize: 15,
    fontWeight: '800',
  },
  button: { minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})

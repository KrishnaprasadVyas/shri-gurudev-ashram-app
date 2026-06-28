import React, { useEffect } from 'react'
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import SevaReceipt from '../../src/components/SevaReceipt'
import type { SevaType } from '../../src/constants/seva'
import { SEVA_LABELS, generateTransactionId } from '../../src/constants/seva'
import type { SevaReceiptData } from '../../src/types/seva'
import { useSevaStore } from '../../src/store/useSevaStore'

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL SEVA SUCCESS SCREEN
// Params: sevaType, reference, transactionId, devotee, phone, sevaDate, amount
// ─────────────────────────────────────────────────────────────────────────────
export default function SevaSuccessRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const addToHistory = useSevaStore((s) => s.addToHistory)

  const { sevaType, reference, transactionId, devotee, phone, sevaDate, amount } =
    useLocalSearchParams<{
      sevaType: string
      reference: string
      transactionId: string
      devotee: string
      phone: string
      sevaDate: string
      amount: string
    }>()

  const type = (sevaType as SevaType) ?? 'annadan'
  const label = SEVA_LABELS[type]
  const parsedAmount = amount ? Number(amount) : 0
  const finalTxnId = transactionId || generateTransactionId()

  const receiptData: SevaReceiptData = {
    receiptNumber: reference ?? 'PENDING',
    transactionId: finalTxnId,
    transactionDate: new Date().toISOString(),
    sevaType: type,
    sevaDate: sevaDate ?? new Date().toISOString(),
    devotee: devotee ?? '—',
    phone: phone ?? '—',
    amount: parsedAmount,
    paymentMethod: 'UPI / Online',
    status: 'paid',
    referenceNumber: reference ?? '—',
  }

  // Add to sevaHistory on mount so My Sevas screen can display it
  useEffect(() => {
    addToHistory({
      id: reference ?? `mock-${Date.now()}`,
      bookingReference: reference ?? '—',
      transactionId: finalTxnId,
      sevaType: type,
      sevaDate: sevaDate ?? '',
      fullName: devotee ?? '—',
      phoneNumber: phone ?? '—',
      totalAmount: parsedAmount,
      status: 'paid',
      createdAt: new Date().toISOString(),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shareReceipt = async () => {
    try {
      await Share.share({
        title: `${label.title} Receipt — Shri Gurudev Ashram`,
        message:
          `🙏 ${label.title} Receipt\n\n` +
          `Devotee: ${devotee}\n` +
          `Seva Date: ${sevaDate ? new Date(sevaDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}\n` +
          `Amount: ₹${parsedAmount.toLocaleString('en-IN')}\n` +
          `Receipt No: ${reference}\n` +
          `Transaction ID: ${finalTxnId}\n\n` +
          `Issued by Shri Gurudev Ashram\n` +
          `Haridwar Road, Rishikesh, Uttarakhand — 249201\n\n` +
          `Jai Shri Gurudev! 🙏`,
      })
    } catch {
      // user cancelled share — no-op
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.successIcon}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <MaterialIcons name="check" size={42} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.kicker}>{label.subtitle} — Confirmed</Text>
        <Text style={styles.title}>Jai Shri Gurudev!</Text>
        <Text style={styles.subtitle}>
          Your {label.title} has been confirmed.{' '}
          {type === 'annadan'
            ? 'May the Mahaprasad seva bring abundant blessings to you and your family.'
            : 'May Guruji\'s blessings flow through you as you perform this sacred Aarti.'}
        </Text>

        {/* Receipt */}
        <SevaReceipt data={receiptData} />

        {/* Action buttons */}
        <Pressable onPress={() => router.push('/(tabs)/my-sevas' as never)}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>View My Activity Dashboard →</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.secondaryRow}>
          {/* Share */}
          <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={() => void shareReceipt()}>
            <MaterialIcons name="share" size={18} color="#8B5A00" />
            <Text style={styles.secondaryButtonText}>Share Receipt</Text>
          </Pressable>

          {/* Back to Home */}
          <Pressable
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={() => router.replace('/(tabs)/home' as never)}
          >
            <MaterialIcons name="home" size={18} color="#8B5A00" />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 56, gap: 20, alignItems: 'stretch' },

  successIcon: {
    alignSelf: 'center',
    shadowColor: '#B97512', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8, marginTop: 8,
  },
  successGradient: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },

  kicker: { color: '#E65C00', textAlign: 'center', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', textAlign: 'center', fontSize: 30, fontWeight: '900', lineHeight: 36 },
  subtitle: { color: '#7E7162', textAlign: 'center', fontSize: 14, lineHeight: 22, paddingHorizontal: 16 },

  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 50, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#E8D5BE', backgroundColor: '#fff',
  },
  secondaryButtonText: { color: '#8B5A00', fontSize: 14, fontWeight: '800' },
})

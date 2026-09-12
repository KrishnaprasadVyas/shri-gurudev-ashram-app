import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import SevaReceipt from '../../src/components/SevaReceipt'
import { generateTransactionId, getSevaLabel, type SevaType } from '../../src/constants/seva'
import type { SevaReceiptData } from '../../src/types/seva'
import { useSevaStore } from '../../src/store/useSevaStore'
import { generateAndShareReceiptPdf, generateAndDownloadReceiptPdf, generateReceiptHtml } from '../../src/utils/pdfGenerator'

export default function SevaSuccessRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const addToHistory = useSevaStore((s) => s.addToHistory)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const {
    sevaType,
    reference,
    transactionId,
    devotee,
    phone,
    sevaDate,
    amount,
    bookingPurpose,
    beneficiaryName,
    identityType,
    identityNumberMasked,
    isRecurring,
    recurringPeriod,
    sponsorName,
    sponsorPhone,
  } = useLocalSearchParams<{
    sevaType: string
    reference: string
    transactionId: string
    devotee: string
    phone: string
    sevaDate: string
    amount: string
    bookingPurpose: string
    beneficiaryName: string
    identityType: string
    identityNumberMasked: string
    isRecurring: string
    recurringPeriod: string
    sponsorName: string
    sponsorPhone: string
  }>()

  const type = (sevaType as SevaType) ?? 'annadan'
  const label = getSevaLabel(type)
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
    bookingPurpose: bookingPurpose || undefined,
    beneficiaryName: beneficiaryName || undefined,
    sponsorName: sponsorName || undefined,
    sponsorPhone: sponsorPhone || undefined,
    identityType: identityType || undefined,
    identityNumberMasked: identityNumberMasked || undefined,
    isRecurring: isRecurring === 'true',
    recurringPeriod: recurringPeriod || undefined,
  }

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
      bookingPurpose: (bookingPurpose as any) || undefined,
      beneficiaryName: beneficiaryName || undefined,
      sponsorName: sponsorName || undefined,
      sponsorPhone: sponsorPhone || undefined,
      identityType: (identityType as any) || undefined,
      identityNumberMasked: identityNumberMasked || undefined,
      isRecurring: isRecurring === 'true',
    })
  }, [])

  const generatePdfFile = async () => {
    setIsGeneratingPdf(true)
    try {
      const html = await generateReceiptHtml({ type: 'seva', sevaData: receiptData })
      console.log('[SevaSuccess] Generating PDF from HTML template...')
      const { uri } = await Print.printToFileAsync({ html })
      console.log('[SevaSuccess] PDF generated at URI:', uri)

      // Verify the file exists and is a PDF
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        console.error('[SevaSuccess] Generated PDF file does not exist at:', uri)
        Alert.alert('Error', 'PDF file was not created. Please try again.')
        return null
      }
      console.log('[SevaSuccess] PDF file verified, size:', fileInfo.size, 'bytes')

      return uri
    } catch (e) {
      console.error('[SevaSuccess] PDF generation failed:', e)
      Alert.alert('Error', 'Failed to generate PDF document. Please try again.')
      return null
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const shareReceiptPdf = async () => {
    setIsGeneratingPdf(true)
    await generateAndShareReceiptPdf({ type: 'seva', sevaData: receiptData })
    setIsGeneratingPdf(false)
  }

  const downloadReceiptPdf = async () => {
    setIsGeneratingPdf(true)
    await generateAndDownloadReceiptPdf({ type: 'seva', sevaData: receiptData })
    setIsGeneratingPdf(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
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

        <SevaReceipt data={receiptData} />

        <View style={styles.actionGrid}>
          <Pressable
            style={[styles.pdfButton, isGeneratingPdf && { opacity: 0.5 }]}
            onPress={() => void downloadReceiptPdf()}
            disabled={isGeneratingPdf}
          >
            <MaterialIcons name="file-download" size={20} color="#E65C00" />
            <Text style={styles.pdfButtonText}>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</Text>
          </Pressable>

          <Pressable
            style={[styles.pdfButton, isGeneratingPdf && { opacity: 0.5 }]}
            onPress={() => void shareReceiptPdf()}
            disabled={isGeneratingPdf}
          >
            <MaterialIcons name="share" size={18} color="#E65C00" />
            <Text style={styles.pdfButtonText}>Share PDF</Text>
          </Pressable>
        </View>

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

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/home' as never)}
        >
          <MaterialIcons name="home" size={18} color="#8B5A00" />
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

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

  actionGrid: { flexDirection: 'row', gap: 12 },
  pdfButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    minHeight: 50, borderRadius: 14,
    backgroundColor: '#FFF0D9',
  },
  pdfButtonText: { color: '#E65C00', fontSize: 14, fontWeight: '800' },

  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 50, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#E8D5BE', backgroundColor: '#fff',
  },
  secondaryButtonText: { color: '#8B5A00', fontSize: 14, fontWeight: '800' },
})

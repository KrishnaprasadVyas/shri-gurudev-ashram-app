import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Alert, Platform } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { getBookingById } from '../../../src/services'
import TravelReceipt, { type TravelReceiptData } from '../../../src/components/TravelReceipt'
import { generateAndShareReceiptPdf, generateAndDownloadReceiptPdf, generateReceiptHtml } from '../../../src/utils/pdfGenerator'
import type { Booking } from '../../../src/types/travel'

export default function SuccessRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { bookingId, bookingReference } = useLocalSearchParams<{ bookingId?: string; bookingReference?: string }>()

  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  React.useEffect(() => {
    if (!bookingId) {
      setIsLoading(false)
      return
    }
    getBookingById(bookingId)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setIsLoading(false))
  }, [bookingId])

  const receiptData: TravelReceiptData | null = booking
    ? {
        bookingReference: booking.bookingReference,
        bookingId: booking.id,
        packageTitle: booking.packageTitle ?? booking.packageId,
        travelStartDate: booking.travelStartDate,
        travelEndDate: booking.travelEndDate,
        travelerCount: booking.travelerCount,
        totalAmount: booking.totalAmount,
        status: booking.status,
        fullName: booking.fullName,
        phoneNumber: booking.phoneNumber,
        createdAt: booking.createdAt,
        transportType: booking.transportType,
        roomType: booking.roomType,
        additionalSevaType: booking.additionalSevaType,
        additionalSevaDate: booking.additionalSevaDate,
        additionalSevaAmount: booking.additionalSevaAmount,
        linkedSeva: booking.linkedSeva,
      }
    : null

  const generatePdfFile = async () => {
    if (!receiptData) return null
    setIsGeneratingPdf(true)
    try {
      const html = await generateReceiptHtml({ type: 'travel', travelData: receiptData })
      console.log('[TravelSuccess] Generating PDF from HTML template...')
      const { uri } = await Print.printToFileAsync({ html })
      console.log('[TravelSuccess] PDF generated at URI:', uri)

      // Verify the file exists and is a PDF
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        console.error('[TravelSuccess] Generated PDF file does not exist at:', uri)
        Alert.alert('Error', 'PDF file was not created. Please try again.')
        return null
      }
      console.log('[TravelSuccess] PDF file verified, size:', fileInfo.size, 'bytes')

      return uri
    } catch (e) {
      console.error('[TravelSuccess] PDF generation failed:', e)
      Alert.alert('Error', 'Failed to generate PDF document. Please try again.')
      return null
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const shareReceiptPdf = async () => {
    setIsGeneratingPdf(true)
    await generateAndShareReceiptPdf({ type: 'travel', travelData: receiptData })
    setIsGeneratingPdf(false)
  }

  const downloadReceiptPdf = async () => {
    setIsGeneratingPdf(true)
    await generateAndDownloadReceiptPdf({ type: 'travel', travelData: receiptData })
    setIsGeneratingPdf(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIconWrap}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <MaterialIcons name="check" size={42} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.kicker}>Payment successful</Text>
        <Text style={styles.title}>Booking Confirmed!</Text>
        
        <View style={styles.confirmBadgesRow}>
          <View style={styles.confirmBadge}>
            <MaterialIcons name="check-circle" size={18} color="#2F7132" />
            <Text style={styles.confirmBadgeText}>Yatra Booking Confirmed</Text>
          </View>

          {booking?.additionalSevaType && booking.additionalSevaType !== 'none' ? (
            <View style={styles.confirmBadge}>
              <MaterialIcons name="check-circle" size={18} color="#2F7132" />
              <Text style={styles.confirmBadgeText}>
                {booking.additionalSevaType === 'guruji_aarti' ? 'Guruji Aarti Seva Confirmed' : 'Yajman Pad Booking Confirmed'}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.subtitle}>
          Your payment was verified and your reservation has been secured. Jai Shri Gurudev!
        </Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#8B5A00" />
            <Text style={styles.loadingText}>Loading receipt…</Text>
          </View>
        ) : receiptData ? (
          <TravelReceipt data={receiptData} />
        ) : (
          <View style={styles.fallbackCard}>
            <MaterialIcons name="confirmation-number" size={28} color="#8B5A00" />
            <Text style={styles.fallbackRef}>{bookingReference ?? 'Booking confirmed'}</Text>
            <Text style={styles.fallbackNote}>
              Booking ID: {bookingId ?? '—'}
            </Text>
          </View>
        )}

        {receiptData && !isLoading && (
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
        )}

        <Pressable onPress={() => router.push('/(tabs)/travel/booking-history' as never)}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>View My Bookings →</Text>
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

  successIconWrap: {
    alignSelf: 'center',
    shadowColor: '#B97512', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8, marginTop: 8,
  },
  successGradient: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },

  kicker: { color: '#E65C00', textAlign: 'center', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', textAlign: 'center', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  subtitle: { color: '#7E7162', textAlign: 'center', fontSize: 14, lineHeight: 22, paddingHorizontal: 16 },

  confirmBadgesRow: { gap: 8, marginVertical: 4, alignItems: 'center' },
  confirmBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF8EF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#D0EBD2',
  },
  confirmBadgeText: { color: '#2F7132', fontSize: 13, fontWeight: '800' },

  loadingWrap: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  loadingText: { color: '#9E9080', fontSize: 13, fontWeight: '600' },

  fallbackCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 24,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#F0E7DD',
  },
  fallbackRef: { color: '#2B231B', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  fallbackNote: { color: '#9E9080', fontSize: 13, fontWeight: '600', textAlign: 'center' },

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

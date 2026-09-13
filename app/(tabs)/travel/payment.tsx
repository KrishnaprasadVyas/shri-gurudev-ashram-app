import React from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import RazorpayCheckout from 'react-native-razorpay'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { createRazorpayOrder, getBookingById, getCurrentUser, verifyRazorpayPayment } from '../../../src/services'
import { Booking } from '../../../src/types/travel'

export default function PaymentRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { bookingId, bookingReference } = useLocalSearchParams<{ bookingId: string; bookingReference?: string }>()
  const [booking, setBooking] = React.useState<Booking | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPaying, setIsPaying] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const loadBooking = React.useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setErrorMessage('')

    try {
      if (!bookingId) {
        throw new Error('Booking id is required to start payment.')
      }

      const bookingData = await getBookingById(bookingId)
      setBooking(bookingData)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load payment details.')
    } finally {
      if (refresh) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [bookingId])

  React.useEffect(() => {
    void loadBooking()
  }, [loadBooking])

  const startPayment = async () => {
    if (!bookingId || !booking) {
      setErrorMessage('Booking details are not ready yet.')
      return
    }

    const key = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID

    if (!key) {
      setErrorMessage('Razorpay key is not configured.')
      return
    }

    setIsPaying(true)
    setErrorMessage('')

    try {
      const currentUser = await getCurrentUser()
      const { order } = await createRazorpayOrder(bookingId)

      const checkoutResult = await RazorpayCheckout.open({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Shri Gurudev Ashram',
        description: booking.bookingReference,
        order_id: order.id,
        prefill: {
          name: currentUser?.fullName,
          email: currentUser?.email ?? undefined,
          contact: currentUser?.phone,
        },
        theme: {
          color: '#E65C00',
        },
      })

      await verifyRazorpayPayment({
        bookingId,
        razorpay_order_id: checkoutResult.razorpay_order_id,
        razorpay_payment_id: checkoutResult.razorpay_payment_id,
        razorpay_signature: checkoutResult.razorpay_signature,
      })

      router.replace({
        pathname: '/(tabs)/travel/success',
        params: {
          bookingId,
          bookingReference: booking.bookingReference,
        },
      } as never)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment could not be completed. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#8B5A00" />
          <Text style={styles.centerText}>Preparing payment</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadBooking(true)} />}
        contentContainerStyle={[styles.content, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} disabled={isPaying} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Final Review & Checkout</Text>
            <Text style={styles.title}>Confirm & Pay</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="card-membership" size={32} color="#B97512" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.packageTitle}>{booking?.packageTitle ?? 'Yatra Booking'}</Text>
              <Text style={styles.reference}>Ref: {booking?.bookingReference ?? bookingReference ?? bookingId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Traveler Details */}
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={18} color="#7E7162" />
            <Text style={styles.infoText}>
              Lead Devotee: <Text style={styles.infoBold}>{booking?.fullName ?? '—'}</Text> ({booking?.travelerCount ?? 1} {(booking?.travelerCount ?? 1) === 1 ? 'Person' : 'Persons'})
            </Text>
          </View>

          {booking?.transportType ? (
            <View style={styles.infoRow}>
              <MaterialIcons name="directions-bus" size={18} color="#7E7162" />
              <Text style={styles.infoText}>
                Route & Stay: <Text style={styles.infoBold}>{booking.transportType}</Text> • <Text style={styles.infoBold}>{booking.roomType ?? 'Standard Room'}</Text>
              </Text>
            </View>
          ) : null}

          {/* Price Breakdown */}
          {(() => {
            const total = booking?.totalAmount ?? 0
            const sevaAmount = booking?.additionalSevaAmount ?? 0
            const yatraAmount = total - sevaAmount
            const convenienceFee = Math.round(total * 0.02)
            const grandTotal = total + convenienceFee

            return (
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Yatra Package ({booking?.travelerCount ?? 1} travelers)</Text>
                  <Text style={styles.breakdownValue}>₹{yatraAmount.toLocaleString('en-IN')}</Text>
                </View>

                {booking?.additionalSevaType && booking.additionalSevaType !== 'none' ? (
                  <>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <View>
                        <Text style={styles.breakdownSevaTitle}>
                          {booking.additionalSevaType === 'guruji_aarti' ? 'Guruji Aarti Seva' : 'Yajman Pad Booking'}
                        </Text>
                        {booking.additionalSevaDate ? (
                          <Text style={styles.breakdownSevaDate}>Date: {booking.additionalSevaDate}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.breakdownSevaValue}>+₹{sevaAmount.toLocaleString('en-IN')}</Text>
                    </View>
                  </>
                ) : null}

                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Gateway & Convenience (2%)</Text>
                  <Text style={styles.breakdownValue}>+₹{convenienceFee.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownTotalLabel}>Total Payable</Text>
                  <Text style={styles.breakdownTotalValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )
          })()}

          <Text style={styles.description}>
            Your payment will be securely processed by Razorpay. Single payment guarantees combined reservation.
          </Text>
        </View>

        {booking?.status === 'paid' ? (
          <View style={styles.successBox}>
            <MaterialIcons name="check-circle" size={20} color="#3E8E41" />
            <Text style={styles.successText}>This booking is already paid.</Text>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable disabled={isPaying || !booking || booking.status === 'paid'} onPress={() => void startPayment()}>
          <LinearGradient
            colors={isPaying || booking?.status === 'paid' ? ['#B9B1A9', '#B9B1A9'] : ['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {booking ? `Proceed to Pay ₹${(booking.totalAmount + Math.round(booking.totalAmount * 0.02)).toLocaleString('en-IN')}` : 'Proceed to Pay'}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 48, gap: 16 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerText: { color: '#7E7162', fontSize: 13, fontWeight: '700' },
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
  card: { borderRadius: 30, backgroundColor: '#fff', padding: 20, borderWidth: 1, borderColor: '#F0E7DD', gap: 14 },
  headerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  packageTitle: { color: '#2B231B', fontSize: 18, fontWeight: '900' },
  reference: { color: '#7E7162', fontSize: 12, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0E7DD', marginVertical: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { color: '#7E7162', fontSize: 13, flex: 1 },
  infoBold: { color: '#2B231B', fontWeight: '800' },
  description: { color: '#7E7162', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 4 },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, backgroundColor: '#EEF8EF', padding: 14 },
  successText: { color: '#2F7132', fontSize: 13, fontWeight: '800' },
  errorText: { color: '#D32F2F', fontSize: 13, fontWeight: '800', lineHeight: 20 },
  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  breakdown: { width: '100%', gap: 10, marginTop: 4, backgroundColor: '#FAF6F0', padding: 16, borderRadius: 20 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { color: '#7E7162', fontSize: 13, fontWeight: '600' },
  breakdownValue: { color: '#2B231B', fontSize: 14, fontWeight: '800' },
  breakdownSevaTitle: { color: '#B97512', fontSize: 14, fontWeight: '800' },
  breakdownSevaDate: { color: '#9E9080', fontSize: 11, fontWeight: '600' },
  breakdownSevaValue: { color: '#B97512', fontSize: 14, fontWeight: '800' },
  breakdownDivider: { height: 1, backgroundColor: '#E8D5BE', marginVertical: 2 },
  breakdownTotalLabel: { color: '#2B231B', fontSize: 15, fontWeight: '900' },
  breakdownTotalValue: { color: '#E65C00', fontSize: 18, fontWeight: '900' },
})

import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import CollectorIDCard from '../src/components/CollectorIDCard'
import { useAuthStore } from '../src/store/useAuthStore'
import {
  collectCashDonation,
  downloadDonationReceipt,
  getCollectorDashboard,
  getCollectorStatus,
  getDonationHeads,
  getLeaderboard,
} from '../src/services/donation'
import { useProtectedRoute } from '../src/hooks/useProtectedRoute'
import { getFriendlyApiError } from '../src/utils/apiErrors'
import AppInput from '../src/components/AppInput'

export default function CollectorDashboardRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  useProtectedRoute()

  const [showIDCard, setShowIDCard] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [isSubmittingCash, setIsSubmittingCash] = useState(false)
  const [causes, setCauses] = useState<any[]>([])

  const [donorName, setDonorName] = useState('')
  const [donorMobile, setDonorMobile] = useState('')
  const [donorPan, setDonorPan] = useState('')
  const [donorAddress, setDonorAddress] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [selectedCauseId, setSelectedCauseId] = useState('')
  const [notes, setNotes] = useState('')

  const [dashboard, setDashboard] = useState<any>({ recentDonations: [] })
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [collectorData, setCollectorData] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const [d, l, h] = await Promise.all([
        getCollectorDashboard(),
        getLeaderboard(),
        getDonationHeads(),
      ])
      setDashboard(d?.data ?? {})
      setLeaderboard(l?.leaderboard ?? [])
      const rawHeads = h?.data || (Array.isArray(h) ? h : [])
      setCauses(rawHeads)
      if (rawHeads.length > 0 && !selectedCauseId) {
        setSelectedCauseId(rawHeads[0].key || rawHeads[0]._id || rawHeads[0].id)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!isHydrated) return
    if (user) {
      void getCollectorStatus()
        .then((status) => {
          setCollectorData(status.data)
          if (status.data?.role !== 'COLLECTOR_APPROVED') {
            router.replace('/collector-apply' as never)
            return null
          }
          return loadDashboardData()
        })
        .catch(() => Alert.alert('Collector portal unavailable', 'Please sign in and try again.'))
        .finally(() => setStatusLoading(false))
    }
  }, [isHydrated, user, router])

  const handleShareReferral = async () => {
    const code = dashboard.referralCode || collectorData?.referralCode
    if (!code) {
      Alert.alert('Referral Code', 'Referral code is not available.')
      return
    }
    try {
      await Share.share({
        message: `Namaste! Support Shri Gurudev Ashram charitable initiatives. Please use my official Collector Referral Code: ${code} when making a donation through the app or website: https://donate.shrigurudevashram.org`,
        title: 'Shri Gurudev Ashram Seva',
      })
    } catch {
      // dismissed
    }
  }

  const handleSubmitCashDonation = async () => {
    if (!donorName.trim()) {
      Alert.alert('Missing Field', 'Please enter donor full name.')
      return
    }
    if (!donorMobile.trim() || donorMobile.replace(/\D/g, '').length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.')
      return
    }
    const cleanPan = donorPan.trim().toUpperCase()
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      Alert.alert('Invalid PAN', 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).')
      return
    }
    const numAmount = Number(cashAmount)
    if (!Number.isFinite(numAmount) || numAmount < 10) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount (minimum ₹10).')
      return
    }

    setIsSubmittingCash(true)
    try {
      const chosenHead = causes.find((c) => (c.key || c._id || c.id) === selectedCauseId)
      const res = await collectCashDonation({
        donor: {
          name: donorName.trim(),
          mobile: donorMobile.replace(/\D/g, ''),
          idNumber: cleanPan,
          address: donorAddress.trim() || undefined,
        },
        donationHead: {
          id: chosenHead ? String(chosenHead._id || chosenHead.id) : undefined,
          key: chosenHead?.key || 'general',
          name: chosenHead?.name?.en || chosenHead?.name?.hi || chosenHead?.name || 'General Seva',
        },
        amount: numAmount,
        notes: notes.trim() || undefined,
      })

      setShowCashModal(false)
      setDonorName('')
      setDonorMobile('')
      setDonorPan('')
      setDonorAddress('')
      setCashAmount('')
      setNotes('')

      await loadDashboardData()

      Alert.alert(
        'Donation Recorded Successfully',
        `Receipt #${res.receiptNumber} generated for ${donorName.trim()}. Would you like to view/share the receipt now?`,
        [
          {
            text: 'Share Receipt',
            onPress: () =>
              downloadDonationReceipt({
                donationId: res.donationId,
                receiptNumber: res.receiptNumber,
                receiptToken: res.receiptToken,
              }),
          },
          { text: 'Done', style: 'cancel' },
        ]
      )
    } catch (error) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to record cash donation. Please try again.'))
    } finally {
      setIsSubmittingCash(false)
    }
  }

  // Do not render content while auth is hydrating or role is invalid
  if (!isHydrated || !user || statusLoading) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dashboard.recentDonations ?? []}
        keyExtractor={(item, index) => String(item.id ?? item.date ?? index)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
            <BlurView intensity={25} tint="light" style={styles.headerGlass}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.kicker}>Namaste, Collector</Text>
                  <Text style={styles.title}>Spiritual Field Operations</Text>
                  <Text style={styles.subtitle}>Accept field donations, manage donor relationships, and monitor your impact.</Text>
                </View>
              </View>

              <View style={styles.quickStatsGrid}>
                {[
                  { label: 'Collected amount', value: `₹${dashboard.totalAmount ?? 0}`, icon: 'payments' },
                  { label: 'Successful donations', value: String(dashboard.donationCount ?? 0), icon: 'volunteer-activism' },
                  { label: 'Referral code', value: dashboard.referralCode ?? collectorData?.referralCode ?? '—', icon: 'qr-code' },
                  { label: 'Leaderboard rank', value: String(leaderboard[0]?.rank ?? '—'), icon: 'leaderboard' },
                ].map((stat) => (
                  <View key={stat.label} style={styles.statCard}>
                    <LinearGradient colors={['#7A4B00', '#B97712']} style={styles.statIcon}>
                      <MaterialIcons name={stat.icon as any} size={18} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View>
                    <Text style={styles.summaryLabel}>Donation summary</Text>
                    <Text style={styles.summaryValue}>{dashboard.donationCount ?? 0} successful donations</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>₹{dashboard.totalAmount ?? 0} collected</Text>
                  </View>
                </View>
                <View style={styles.summaryBarTrack}>
                  <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} style={[styles.summaryBarFill, { width: dashboard.donationCount ? '100%' : '0%' }]} />
                </View>
              </View>
            </BlurView>

            {/* In-Person Cash Collection Banner */}
            <Pressable
              style={styles.cashCollectBanner}
              onPress={() => setShowCashModal(true)}
            >
              <LinearGradient
                colors={['#7B4B00', '#B97512', '#E0A31F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cashCollectGradient}
              >
                <View style={styles.cashCollectIconWrap}>
                  <MaterialIcons name="add-circle-outline" size={26} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cashCollectTitle}>Record In-Person Donation</Text>
                  <Text style={styles.cashCollectSub}>Accept cash donations in the field & issue instant 80G receipts</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#fff" />
              </LinearGradient>
            </Pressable>

            {/* My Digital ID Section */}
            {user ? (
              <View style={styles.idSection}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>My Digital ID</Text>
                  <View style={styles.idBadge}>
                    <MaterialIcons name="verified" size={13} color="#2F7132" />
                    <Text style={styles.idBadgeText}>Official</Text>
                  </View>
                </View>

                <View style={styles.idActionsRow}>
                  <Pressable
                    style={styles.idActionBtn}
                    onPress={() => setShowIDCard(true)}
                  >
                    <MaterialIcons name="badge" size={20} color="#8B5A00" />
                    <Text style={styles.idActionText}>View ID</Text>
                  </Pressable>

                  <Pressable
                    style={styles.idActionBtn}
                    onPress={handleShareReferral}
                  >
                    <MaterialIcons name="share" size={20} color="#8B5A00" />
                    <Text style={styles.idActionText}>Share Code</Text>
                  </Pressable>

                  <Pressable
                    style={styles.idActionBtn}
                    onPress={() => {
                      const code = dashboard.referralCode || collectorData?.referralCode
                      Alert.alert(
                        'Collector Code',
                        `Your official referral code is:\n\n${code || 'N/A'}\n\nAsk donors to enter this code during donation.`
                      )
                    }}
                  >
                    <MaterialIcons name="qr-code" size={20} color="#8B5A00" />
                    <Text style={styles.idActionText}>My Code</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/* ID Card Modal */}
            <Modal
              visible={showIDCard}
              transparent
              animationType="slide"
              onRequestClose={() => setShowIDCard(false)}
            >
              <Pressable style={styles.modalBackdrop} onPress={() => setShowIDCard(false)}>
                <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>Collector ID Card</Text>
                  {user ? <CollectorIDCard user={user} collectorId={collectorData?.collectorId} /> : null}
                  <Pressable
                    style={styles.modalClose}
                    onPress={() => setShowIDCard(false)}
                  >
                    <LinearGradient
                      colors={['#7B4B00', '#B97512', '#E0A31F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalCloseGradient}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </LinearGradient>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>

            {/* Cash Donation Modal */}
            <Modal
              visible={showCashModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCashModal(false)}
            >
              <KeyboardAvoidingView
                style={styles.modalBackdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowCashModal(false)}>
                  <Pressable
                    style={[styles.modalSheet, { maxHeight: '90%' }]}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Record In-Person Donation</Text>
                    
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      <AppInput
                        label="Donor Full Name *"
                        placeholder="e.g. Ramesh Sharma"
                        value={donorName}
                        onChangeText={setDonorName}
                      />

                      <AppInput
                        label="Mobile Number (10 Digits) *"
                        placeholder="e.g. 9876543210"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={donorMobile}
                        onChangeText={(t) => setDonorMobile(t.replace(/\D/g, ''))}
                      />

                      <AppInput
                        label="PAN Card Number *"
                        placeholder="e.g. ABCDE1234F"
                        autoCapitalize="characters"
                        maxLength={10}
                        value={donorPan}
                        onChangeText={(t) => setDonorPan(t.toUpperCase())}
                      />

                      <AppInput
                        label="Donation Amount (₹) *"
                        placeholder="e.g. 1000"
                        keyboardType="numeric"
                        value={cashAmount}
                        onChangeText={(t) => setCashAmount(t.replace(/\D/g, ''))}
                      />

                      <View>
                        <Text style={styles.formLabel}>Select Seva / Cause</Text>
                        <View style={styles.causePillsRow}>
                          {causes.map((c) => {
                            const cId = c.key || c._id || c.id
                            const isSelected = selectedCauseId === cId
                            const label = c.name?.en || c.name?.hi || c.name || 'General'
                            return (
                              <Pressable
                                key={cId}
                                style={[styles.causePill, isSelected && styles.causePillActive]}
                                onPress={() => setSelectedCauseId(cId)}
                              >
                                <Text
                                  style={[styles.causePillText, isSelected && styles.causePillTextActive]}
                                  numberOfLines={1}
                                >
                                  {label}
                                </Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      </View>

                      <AppInput
                        label="Donor Address (Optional)"
                        placeholder="City, State, Pincode"
                        value={donorAddress}
                        onChangeText={setDonorAddress}
                      />

                      <AppInput
                        label="Notes (Optional)"
                        placeholder="Any special remarks"
                        value={notes}
                        onChangeText={setNotes}
                      />

                      <Pressable
                        style={[styles.submitButton, isSubmittingCash && { opacity: 0.7 }]}
                        onPress={handleSubmitCashDonation}
                        disabled={isSubmittingCash}
                      >
                        <LinearGradient
                          colors={['#7B4B00', '#B97512', '#E0A31F']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.modalCloseGradient}
                        >
                          {isSubmittingCash ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.modalCloseText}>Record Cash & Issue Receipt</Text>
                          )}
                        </LinearGradient>
                      </Pressable>
                    </ScrollView>
                  </Pressable>
                </Pressable>
              </KeyboardAvoidingView>
            </Modal>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Recent Contributions</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.taskCard}>
            <View style={styles.taskIcon}>
              <MaterialIcons name="event-note" size={22} color="#8B5A00" />
            </View>
            <View style={styles.taskCopy}>
              <Text style={styles.taskTitle}>{item.donorName ?? 'Anonymous donor'}</Text>
              <Text style={styles.taskDescription}>{item.cause ?? 'Donation'}</Text>
              <Text style={styles.taskStatus}>₹{item.amount ?? 0} · {item.date ? new Date(item.date).toLocaleDateString() : 'Successful'}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F3EA' },
  listContent: { paddingBottom: 110 },
  headerBlock: { paddingHorizontal: 18, paddingBottom: 8 },
  headerGlass: {
    borderRadius: 34,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  headerCopy: { flex: 1 },
  kicker: { color: '#8B5A00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  title: { color: '#2C1D10', fontSize: 26, lineHeight: 32, fontWeight: '900' },
  subtitle: { color: '#6B5A4A', fontSize: 13, lineHeight: 20, marginTop: 8 },
  analyticsButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderRadius: 22, backgroundColor: '#fff', padding: 14, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  statIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#2C1D10', fontSize: 20, fontWeight: '900', marginTop: 10 },
  statLabel: { color: '#6B5A4A', fontSize: 11, fontWeight: '800', marginTop: 3 },
  summaryCard: { marginTop: 14, borderRadius: 24, backgroundColor: '#FFF9F0', padding: 16, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { color: '#8B5A00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  summaryValue: { color: '#2C1D10', fontSize: 17, fontWeight: '900', marginTop: 5 },
  summaryPill: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 7 },
  summaryPillText: { color: '#8B5A00', fontSize: 11, fontWeight: '900' },
  summaryBarTrack: { height: 8, backgroundColor: '#F0E7DD', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  summaryBarFill: { width: '74%', height: '100%' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 8 },
  sectionTitle: { color: '#2C1D10', fontSize: 20, fontWeight: '900' },
  seeAll: { color: '#8B5A00', fontSize: 13, fontWeight: '900' },
  taskCard: { marginHorizontal: 18, marginBottom: 12, flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(139,90,0,0.08)' },
  taskIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1 },
  taskTitle: { color: '#2C1D10', fontSize: 16, fontWeight: '900' },
  taskDescription: { color: '#6B5A4A', fontSize: 13, lineHeight: 20, marginTop: 4 },
  taskStatus: { color: '#8B5A00', fontSize: 12, fontWeight: '900', marginTop: 8 },

  // My Digital ID
  idSection: { marginTop: 18, paddingHorizontal: 4 },
  idBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF8EF', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  idBadgeText: { color: '#2F7132', fontSize: 11, fontWeight: '800' },
  idActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  idActionBtn: {
    flex: 1, alignItems: 'center', gap: 6, padding: 14,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: '#F0E7DD',
    shadowColor: '#5B4636', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  idActionText: { color: '#8B5A00', fontSize: 12, fontWeight: '800' },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(32,19,9,0.52)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF6F0', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, paddingBottom: 36, gap: 16,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  modalHandle: {
    width: 44, height: 4, borderRadius: 2, backgroundColor: '#E8D5BE',
    alignSelf: 'center', marginBottom: 4,
  },
  modalTitle: { color: '#2B231B', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalClose: { marginTop: 4 },
  modalCloseGradient: { minHeight: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  // Cash Collection Banner & Modal
  cashCollectBanner: { marginTop: 14, borderRadius: 24, overflow: 'hidden' },
  cashCollectGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  cashCollectIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  cashCollectTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  cashCollectSub: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  formLabel: { fontSize: 13, fontWeight: '700', color: '#2C1D10', marginBottom: 4 },
  causePillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  causePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F0E7DD' },
  causePillActive: { backgroundColor: '#8B5A00', borderColor: '#8B5A00' },
  causePillText: { fontSize: 12, fontWeight: '700', color: '#6B5A4A' },
  causePillTextActive: { color: '#fff' },
  submitButton: { marginTop: 12 },
})

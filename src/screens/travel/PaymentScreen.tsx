import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'

type PaymentRoute = RouteProp<TravelStackParamList, 'Payment'>;
type PaymentNav = NativeStackNavigationProp<TravelStackParamList, 'Payment'>;

const COLORS = {
  background: '#fbf9f4',
  primary: '#8d4b00',
  secondary: '#665d4e',
  surface: '#ffffff',
  border: '#dbc2b0',
  text: '#1b1c19',
  muted: '#554336',
  chip: '#eee1cd',
  chipInactive: '#e4e2de',
}

export default function PaymentScreen() {
  const route = useRoute<PaymentRoute>()
  const navigation = useNavigation<PaymentNav>()
  const utr = useBookingDraftStore((state) => state.utr)
  const proofLabel = useBookingDraftStore((state) => state.proofLabel)
  const updateField = useBookingDraftStore((state) => state.updateField)

  const { packageName, totalAmount } = route.params

  const handleSubmit = () => {
    navigation.navigate('Success')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Payment</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.label}>Selected package</Text>
          <Text style={styles.value}>{packageName}</Text>
          <Text style={styles.label}>Remaining balance</Text>
          <Text style={styles.amount}>{totalAmount}</Text>
          <View style={styles.timeline}>
            {['Installment 1', 'Installment 2', 'Installment 3'].map((item, index) => (
              <View key={item} style={styles.timelineItem}>
                <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
                <Text style={styles.timelineText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pay with UPI / QR</Text>
          <View style={styles.qrBox}><Text style={styles.placeholderText}>QR Placeholder</Text></View>
          <Text style={styles.instructions}>Scan the QR placeholder, complete the transfer, then add your UTR / Transaction ID and payment proof.</Text>

          <Text style={styles.inputLabel}>UTR / Transaction ID</Text>
          <TextInput
            value={utr}
            onChangeText={(text) => updateField('utr', text)}
            placeholder="Enter transaction ID"
            placeholderTextColor="#9a8b7a"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Upload Payment Proof</Text>
          <Pressable style={styles.uploadBox} onPress={() => updateField('proofLabel', 'Screenshot placeholder selected')}>
            <Text style={styles.uploadTitle}>Tap to add screenshot</Text>
            <Text style={styles.uploadHint}>{proofLabel || 'Image upload placeholder'}</Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Payment Proof</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  backButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  topTitle: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chip },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { color: COLORS.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
  inputLabel: { color: COLORS.secondary, fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  value: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  amount: { color: COLORS.primary, fontSize: 28, fontWeight: '700', marginTop: 8 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border, marginBottom: 8 },
  timelineDotActive: { backgroundColor: COLORS.primary },
  timelineText: { fontSize: 11, color: COLORS.muted, textAlign: 'center' },
  qrBox: { height: 180, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  placeholderText: { color: COLORS.secondary, fontSize: 13, fontWeight: '700' },
  instructions: { marginBottom: 10, color: COLORS.muted, fontSize: 14, lineHeight: 22 },
  input: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', paddingHorizontal: 14, color: COLORS.text, fontSize: 15 },
  uploadBox: { borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border, backgroundColor: '#fff', paddingVertical: 22, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  uploadHint: { marginTop: 6, color: COLORS.secondary, fontSize: 12 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

import React, { useEffect } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'

type BookingRoute = RouteProp<TravelStackParamList, 'BookingForm'>;
type BookingNav = NativeStackNavigationProp<TravelStackParamList, 'BookingForm'>;

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

export default function BookingFormScreen() {
  const route = useRoute<BookingRoute>()
  const navigation = useNavigation<BookingNav>()
  const packageItem = route.params.packageItem
  const selectedPackage = useBookingDraftStore((state) => state.selectedPackage)
  const fullName = useBookingDraftStore((state) => state.fullName)
  const phoneNumber = useBookingDraftStore((state) => state.phoneNumber)
  const age = useBookingDraftStore((state) => state.age)
  const gender = useBookingDraftStore((state) => state.gender)
  const numberOfTravelers = useBookingDraftStore((state) => state.numberOfTravelers)
  const specialNotes = useBookingDraftStore((state) => state.specialNotes)
  const updateField = useBookingDraftStore((state) => state.updateField)
  const setSelectedPackage = useBookingDraftStore((state) => state.setSelectedPackage)

  useEffect(() => {
    if (!selectedPackage || selectedPackage.id !== packageItem.id) {
      setSelectedPackage(packageItem)
    }
  }, [packageItem, selectedPackage, setSelectedPackage])

  const handleContinue = () => {
    const activePackage = selectedPackage ?? packageItem

    navigation.navigate('Payment', {
      packageName: activePackage.title,
      totalAmount: activePackage.price,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Booking Form</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected package</Text>
          <Text style={styles.summaryTitle}>{packageItem.title}</Text>
          <Text style={styles.summaryText}>{packageItem.duration}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Traveler Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={(text) => updateField('fullName', text)} placeholder="Enter full name" placeholderTextColor="#9a8b7a" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phoneNumber} onChangeText={(text) => updateField('phoneNumber', text)} placeholder="Enter phone number" keyboardType="phone-pad" placeholderTextColor="#9a8b7a" />

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={age} onChangeText={(text) => updateField('age', text)} placeholder="Age" keyboardType="numeric" placeholderTextColor="#9a8b7a" />
            </View>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Travelers</Text>
              <TextInput style={styles.input} value={numberOfTravelers} onChangeText={(text) => updateField('numberOfTravelers', text)} placeholder="Count" keyboardType="numeric" placeholderTextColor="#9a8b7a" />
            </View>
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((option) => {
              const selected = gender === option

              return (
                <Pressable key={option} onPress={() => updateField('gender', option)} style={[styles.genderChip, selected && styles.genderChipSelected]}>
                  <Text style={[styles.genderText, selected && styles.genderTextSelected]}>{option}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.label}>Special Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={specialNotes}
            onChangeText={(text) => updateField('specialNotes', text)}
            placeholder="Add allergies, requests, or notes"
            placeholderTextColor="#9a8b7a"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue to Payment</Text>
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
  summaryLabel: { color: COLORS.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  summaryTitle: { color: COLORS.text, fontSize: 26, fontWeight: '700', marginTop: 8 },
  summaryText: { color: COLORS.muted, marginTop: 6 },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 14 },
  flexItem: { flex: 1 },
  label: { marginTop: 12, marginBottom: 8, color: COLORS.secondary, fontSize: 12, fontWeight: '700' },
  input: { borderBottomWidth: 1.5, borderBottomColor: COLORS.border, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  genderRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  genderChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: COLORS.chipInactive },
  genderChipSelected: { backgroundColor: COLORS.chip },
  genderText: { color: COLORS.muted, fontWeight: '600' },
  genderTextSelected: { color: COLORS.primary },
  textArea: { minHeight: 100, paddingTop: 12 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})

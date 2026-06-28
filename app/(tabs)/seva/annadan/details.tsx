import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSevaStore } from '../../../../src/store/useSevaStore'

// ─── Validation ───────────────────────────────────────────────────────────────
function isValidPhone(p: string): boolean {
  return /^\d{10}$/.test(p.trim())
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnnadanDetailsRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const fullName = useSevaStore((s) => s.fullName)
  const phoneNumber = useSevaStore((s) => s.phoneNumber)
  const updateDevoteeField = useSevaStore((s) => s.updateDevoteeField)
  const selectedDate = useSevaStore((s) => s.selectedDate)

  const [touched, setTouched] = useState({ fullName: false, phoneNumber: false })

  const nameError = touched.fullName && fullName.trim().length < 2
    ? 'Please enter your full name.' : ''
  const phoneError = touched.phoneNumber && !isValidPhone(phoneNumber)
    ? 'Please enter a valid 10-digit mobile number.' : ''
  const isValid = fullName.trim().length >= 2 && isValidPhone(phoneNumber)

  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—'

  const onContinue = () => {
    setTouched({ fullName: true, phoneNumber: true })
    if (!isValid) return
    router.push('/(tabs)/seva/annadan/review' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
            </Pressable>
            <View>
              <Text style={styles.kicker}>Step 2 of 3</Text>
              <Text style={styles.title}>Devotee Details</Text>
            </View>
          </View>

          {/* Selected Date Banner */}
          <View style={styles.dateBanner}>
            <MaterialIcons name="event" size={18} color="#8B5A00" />
            <Text style={styles.dateBannerText}>
              Annadan on <Text style={styles.dateBannerDate}>{displayDate}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formHint}>
              These details will appear on your Annadan receipt.
            </Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <View style={[styles.inputWrap, nameError ? styles.inputError : null]}>
                <MaterialIcons name="person" size={18} color={nameError ? '#C04545' : '#9E9080'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#C4BAB0"
                  value={fullName}
                  onChangeText={(t) => updateDevoteeField('fullName', t)}
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number *</Text>
              <View style={[styles.inputWrap, phoneError ? styles.inputError : null]}>
                <MaterialIcons name="phone" size={18} color={phoneError ? '#C04545' : '#9E9080'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#C4BAB0"
                  value={phoneNumber}
                  onChangeText={(t) => updateDevoteeField('phoneNumber', t.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => setTouched((prev) => ({ ...prev, phoneNumber: true }))}
                  keyboardType="number-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <MaterialIcons name="lock-outline" size={14} color="#9E9080" />
            <Text style={styles.privacyText}>
              Your details are used only for this Annadan receipt and will not be shared.
            </Text>
          </View>

          {/* Continue */}
          <Pressable disabled={!isValid} onPress={onContinue}>
            <LinearGradient
              colors={isValid ? ['#7B4B00', '#B97512', '#E0A31F'] : ['#D5CFC8', '#D5CFC8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Review Booking</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 56, gap: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F0E7DD',
  },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 26, fontWeight: '900', marginTop: 2 },

  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0D9', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#EDD9B8',
  },
  dateBannerText: { color: '#7E7162', fontSize: 14, fontWeight: '600', flex: 1 },
  dateBannerDate: { color: '#8B5A00', fontWeight: '900' },

  formCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 18,
  },
  formHint: { color: '#9E9080', fontSize: 13, lineHeight: 20 },

  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#5A4A42', fontSize: 13, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF6F0', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8D5BE',
    overflow: 'hidden',
  },
  inputError: { borderColor: '#C04545' },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1, height: 52, paddingHorizontal: 12,
    color: '#2B231B', fontSize: 15, fontWeight: '600',
  },
  errorText: { color: '#C04545', fontSize: 12, fontWeight: '700' },

  privacyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: 4,
  },
  privacyText: { color: '#9E9080', fontSize: 12, lineHeight: 18, flex: 1 },

  ctaButton: { minHeight: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})

import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSevaStore } from '../../../store/useSevaStore'
import { isValidPhoneNumber, isValidEmail } from '../../../utils/validation'

type StepSponsorProps = {
  onNext: () => void
  onBack: () => void
}

import { useAuthStore } from '../../../store/useAuthStore'

export default function StepSponsor({ onNext, onBack: _onBack }: StepSponsorProps) {
  const user = useAuthStore((s) => s.user)
  const sponsorName = useSevaStore((s) => s.sponsorName)
  const sponsorPhone = useSevaStore((s) => s.sponsorPhone)
  const sponsorEmail = useSevaStore((s) => s.sponsorEmail)
  const sponsorAddress = useSevaStore((s) => s.sponsorAddress)
  const setSponsorName = useSevaStore((s) => s.setSponsorName)
  const setSponsorPhone = useSevaStore((s) => s.setSponsorPhone)
  const setSponsorEmail = useSevaStore((s) => s.setSponsorEmail)
  const setSponsorAddress = useSevaStore((s) => s.setSponsorAddress)

  // Also populate fullName and phoneNumber for backward compat with the booking API
  const updateDevoteeField = useSevaStore((s) => s.updateDevoteeField)

  React.useEffect(() => {
    if (user) {
      if (!sponsorName && user.fullName) setSponsorName(user.fullName)
      if (!sponsorPhone && user.phone) setSponsorPhone(user.phone)
      if (!useSevaStore.getState().fullName && user.fullName) updateDevoteeField('fullName', user.fullName)
      if (!useSevaStore.getState().phoneNumber && user.phone) updateDevoteeField('phoneNumber', user.phone)
    }
  }, [user])

  const [touched, setTouched] = useState({ name: false, phone: false, email: false })

  const nameError = touched.name && sponsorName.trim().length < 2
    ? 'Please enter the sponsor\'s full name.'
    : ''
  const phoneError = touched.phone && !isValidPhoneNumber(sponsorPhone)
    ? 'Please enter a valid 10-digit mobile number.'
    : ''
  const emailError = touched.email && sponsorEmail.trim().length > 0 && !isValidEmail(sponsorEmail)
    ? 'Please enter a valid email address.'
    : ''

  const isValid = Boolean(
    sponsorName?.trim().length >= 2 &&
    isValidPhoneNumber(sponsorPhone) &&
    (!sponsorEmail || sponsorEmail.trim().length === 0 || isValidEmail(sponsorEmail))
  )

  const handleContinue = () => {
    setTouched({ name: true, phone: true, email: true })
    if (!isValid) return
    // Sync to legacy fields for backward compatibility
    updateDevoteeField('fullName', sponsorName.trim())
    updateDevoteeField('phoneNumber', sponsorPhone.trim())
    onNext()
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Sponsor Details</Text>
          <Text style={styles.cardHint}>
            The sponsor is the person making this Annadan donation.
          </Text>

          {/* Sponsor Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Sponsor Name *</Text>
            <View style={[styles.inputWrap, nameError ? styles.inputError : null]}>
              <MaterialIcons name="person" size={18} color={nameError ? '#C04545' : '#9E9080'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter sponsor's full name"
                placeholderTextColor="#C4BAB0"
                value={sponsorName}
                onChangeText={setSponsorName}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
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
                value={sponsorPhone}
                onChangeText={(t) => setSponsorPhone(t.replace(/\D/g, '').slice(0, 10))}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="next"
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          {/* Email (optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email <Text style={styles.optional}>(optional)</Text></Text>
            <View style={[styles.inputWrap, emailError ? styles.inputError : null]}>
              <MaterialIcons name="email" size={18} color={emailError ? '#C04545' : '#9E9080'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#C4BAB0"
                value={sponsorEmail}
                onChangeText={setSponsorEmail}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Address (optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Address <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="home" size={18} color="#9E9080" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { minHeight: 48 }]}
                placeholder="Enter address"
                placeholderTextColor="#C4BAB0"
                value={sponsorAddress}
                onChangeText={setSponsorAddress}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
          </View>
        </Animated.View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock-outline" size={14} color="#9E9080" />
          <Text style={styles.privacyText}>
            Your details are used only for this Annadan receipt and will not be shared.
          </Text>
        </View>

        {/* CTA */}
        <Pressable disabled={!isValid} onPress={handleContinue}>
          <LinearGradient
            colors={isValid ? ['#7B4B00', '#B97512', '#E0A31F'] : ['#D5CFC8', '#D5CFC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Continue →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 16,
  },
  cardTitle: { color: '#2B231B', fontSize: 17, fontWeight: '900' },
  cardHint: { color: '#9E9080', fontSize: 13, lineHeight: 20 },

  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#5A4A42', fontSize: 13, fontWeight: '700' },
  optional: { color: '#9E9080', fontWeight: '600' },
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

  ctaButton: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
})

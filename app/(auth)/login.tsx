import React, { useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/useAuthStore'
import { confirmPhoneOtp, requestPhoneOtp } from '../../src/services/auth'
import type { ConfirmationResult } from '@react-native-firebase/auth'
import { getFriendlyApiError } from '../../src/utils/apiErrors'
import { isValidPhoneNumber, normalizeDigits } from '../../src/utils/validation'
import AppInput from '../../src/components/AppInput'

export default function PhoneAuthRoute() {
  const router = useRouter()
  const params = useLocalSearchParams<{ returnTo?: string }>()
  const returnTo = params.returnTo

  const setUser = useAuthStore((state) => state.setUser)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; code?: string }>({})

  const codeInputRef = useRef<TextInput>(null)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const validatePhone = () => {
    const nextErrors: typeof fieldErrors = {}
    if (!isValidPhoneNumber(phone)) { nextErrors.phone = 'Phone number must be 10 digits.' }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateCode = () => {
    const nextErrors: typeof fieldErrors = {}
    if (code.length < 6) { nextErrors.code = 'Please enter a valid 6-digit OTP.' }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const result = await requestPhoneOtp(phone)
      setConfirmation(result)
      setResendCooldown(45)
      setCode('')
      setTimeout(() => codeInputRef.current?.focus(), 100)
    } catch (error) {
      setErrorMessage(getFriendlyApiError(error, 'Could not resend OTP. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = async () => {
    if (isSubmitting) return

    if (!confirmation) {
      if (!validatePhone()) return
    } else {
      if (!validateCode()) return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (!confirmation) {
        const result = await requestPhoneOtp(phone)
        setConfirmation(result)
        setResendCooldown(45)
        // Focus OTP field automatically on next render
        setTimeout(() => codeInputRef.current?.focus(), 100)
      } else {
        const user = await confirmPhoneOtp(confirmation, code)
        setUser(user)
        
        if (!user.fullName.trim()) {
          router.replace({ pathname: '/edit-profile', params: { onboarding: '1', returnTo } } as never)
        } else if (returnTo) {
          router.replace(returnTo as never)
        } else {
          router.replace('/(tabs)/home' as never)
        }
      }
    } catch (error) {
      setErrorMessage(getFriendlyApiError(error, 'Could not sign you in. Please try again.', [{ match: /invalid/i, message: 'Invalid OTP. Please check and try again.' }]))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (returnTo) {
      router.replace('/(tabs)/home')
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)/home')
    }
  }

  React.useEffect(() => {
    const onBackPress = () => {
      handleBack()
      return true
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => subscription.remove()
  }, [returnTo])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
            </Pressable>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/recieptLogo.jpeg')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.kicker}>Phone authentication</Text>
            <Text style={styles.title}>Continue with your phone</Text>
            
            {!confirmation ? (
              <AppInput 
                label="Phone Number" 
                value={phone} 
                onChangeText={(text) => {
                  setPhone(normalizeDigits(text, 10))
                  if (fieldErrors.phone) setFieldErrors({})
                }} 
                placeholder="Enter your 10-digit mobile number" 
                errorMessage={fieldErrors.phone}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                editable={!isSubmitting}
              />
            ) : (
              <AppInput 
                ref={codeInputRef}
                label="Verification Code" 
                value={code} 
                onChangeText={(text) => {
                  setCode(text.replace(/[^0-9]/g, ''))
                  if (fieldErrors.code) setFieldErrors({})
                }} 
                placeholder="Enter the 6-digit OTP" 
                errorMessage={fieldErrors.code}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                editable={!isSubmitting}
                maxLength={6}
              />
            )}

            {confirmation ? (
              <Pressable
                onPress={() => void handleResendOtp()}
                disabled={resendCooldown > 0 || isSubmitting}
                style={{ alignSelf: 'flex-end', marginTop: 2, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: resendCooldown > 0 ? '#9E9080' : '#E65C00' }}>
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </Text>
              </Pressable>
            ) : null}
            
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            
            <Pressable 
              onPress={() => void handleContinue()} 
              disabled={isSubmitting} 
              style={({ pressed }) => [styles.button, pressed && !isSubmitting ? styles.buttonPressed : null, isSubmitting ? styles.buttonDisabled : null]}
            >
              <LinearGradient colors={['#7B4B00', '#B97512', '#E0A31F']} style={styles.primaryButton}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{confirmation ? 'Verify OTP' : 'Send OTP'}</Text>}
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  backButton: { alignSelf: 'flex-start', width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoWrap: { width: 68, height: 68, borderRadius: 34, overflow: 'hidden', backgroundColor: '#FFFFFF', padding: 3, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  logo: { width: '100%', height: '100%', borderRadius: 31 },
  kicker: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', fontSize: 32, lineHeight: 38, fontWeight: '900', marginBottom: 6 },
  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  buttonPressed: { opacity: 0.85 },
  button: { borderRadius: 999 },
  buttonDisabled: { opacity: 0.7 },
  errorText: { color: '#B00020', fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 4 },
})

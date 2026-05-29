import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/useAuthStore'
import { signIn } from '../../src/services/auth'

export default function LoginRoute() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const user = await signIn(email.trim(), password)
      setUser(user)
      router.replace('/(tabs)/home' as never)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="spa" size={28} color="#8B5A00" />
        </View>
        <Text style={styles.kicker}>Welcome back</Text>
        <Text style={styles.title}>Login to Ashram App</Text>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <Pressable onPress={() => void handleLogin()} disabled={isSubmitting} style={({ pressed }) => [pressed && !isSubmitting ? styles.buttonPressed : null]}>
          <LinearGradient colors={['#7B4B00', '#B97512', '#E0A31F']} style={styles.primaryButton}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Login</Text>}
          </LinearGradient>
        </Pressable>
        <View style={styles.linkRow}>
          <Pressable onPress={() => router.push('/(auth)/forgot-password' as never)}>
            <Text style={styles.linkText}>Forgot Password</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(auth)/splash' as never)}>
            <Text style={styles.linkText}>Back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  secureTextEntry?: boolean
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9080"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  iconWrap: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  kicker: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', fontSize: 32, lineHeight: 38, fontWeight: '900', marginBottom: 6 },
  inputBlock: { gap: 8 },
  inputLabel: { color: '#2B231B', fontSize: 13, fontWeight: '900' },
  input: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F0E7DD',
    backgroundColor: '#fff',
    color: '#2B231B',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
  },
  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  buttonPressed: { opacity: 0.85 },
  errorText: { color: '#B00020', fontSize: 13, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  linkText: { color: '#8B5A00', fontSize: 14, fontWeight: '900' },
})

import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function SignupRoute() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSignup = () => {
    setUser({ id: 'u-1', name: name || email || 'Guest User', email, role: 'member' })
    router.replace('/(tabs)/home' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Create seva profile</Text>
        <Text style={styles.title}>Begin your ashram journey</Text>
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your name" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
        <Pressable onPress={handleSignup}>
          <LinearGradient colors={['#7B4B00', '#B97512', '#E0A31F']} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(auth)/splash' as never)}>
          <Text style={styles.secondaryButtonText}>Back to Splash</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function Input({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9E9080" autoCapitalize="none" style={styles.input} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  kicker: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', fontSize: 34, lineHeight: 40, fontWeight: '900', marginBottom: 6 },
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
  secondaryButton: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0D9',
    borderWidth: 1,
    borderColor: '#F0E7DD',
  },
  secondaryButtonText: { color: '#993D00', fontSize: 15, fontWeight: '900' },
})

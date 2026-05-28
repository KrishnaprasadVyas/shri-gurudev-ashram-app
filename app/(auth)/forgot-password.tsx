import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ForgotPasswordRoute() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="lock-reset" size={30} color="#8B5A00" />
        </View>
        <Text style={styles.kicker}>Account support</Text>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Enter your email and the ashram app team can wire this into Supabase auth when backend auth is enabled.</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor="#9E9080" autoCapitalize="none" style={styles.input} />
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/login' as never)}>
          <Text style={styles.primaryButtonText}>Back to Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  iconWrap: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center' },
  kicker: { color: '#E65C00', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', fontSize: 34, lineHeight: 40, fontWeight: '900' },
  subtitle: { color: '#7E7162', fontSize: 14, lineHeight: 22 },
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
  primaryButton: { minHeight: 58, borderRadius: 999, backgroundColor: '#E65C00', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})

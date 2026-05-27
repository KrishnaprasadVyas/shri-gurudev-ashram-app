import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type UploadDocumentsRoute = RouteProp<TravelStackParamList, 'UploadDocuments'>;
type UploadDocumentsNav = NativeStackNavigationProp<TravelStackParamList, 'UploadDocuments'>;

const COLORS = {
  background: '#fbf9f4',
  primary: '#8d4b00',
  secondary: '#665d4e',
  surface: '#ffffff',
  border: '#dbc2b0',
  text: '#1b1c19',
  muted: '#554336',
  chip: '#eee1cd',
}

export default function UploadDocumentsScreen() {
  const route = useRoute<UploadDocumentsRoute>()
  const navigation = useNavigation<UploadDocumentsNav>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Upload Documents</Text>
          <View style={styles.avatar} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Booking ID: {route.params.bookingId}</Text>
          <Text style={styles.text}>Add passport, ID card, or travel-specific files later.</Text>

          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>◫</Text>
            <Text style={styles.uploadTitle}>Document upload placeholder</Text>
            <Text style={styles.uploadHint}>PDF, JPG or PNG • Max 5MB</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Back to Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  backButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  topTitle: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chip },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  text: { color: COLORS.muted, lineHeight: 22, marginBottom: 14 },
  uploadBox: { borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border, backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  uploadIcon: { color: COLORS.primary, fontSize: 24, fontWeight: '700', marginBottom: 10 },
  uploadTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  uploadHint: { marginTop: 6, color: COLORS.secondary, fontSize: 12 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const COLORS = {
  background: '#fbf9f4',
  primary: '#8d4b00',
  saffron: '#F59E0B',
  secondary: '#665d4e',
  surface: '#ffffff',
  border: '#dbc2b0',
  text: '#1b1c19',
  muted: '#554336',
  chip: '#eee1cd',
  chipInactive: '#e4e2de',
}

const TravelRegistrationScreen = ({ navigation }: any) => {
  const [gender, setGender] = useState('Male')

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Travel Registration</Text>
        </View>

        <View style={styles.headerRight}>
          <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.profileImage} />
          <Text style={styles.notification}>🔔</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.progressWrapper}>
          <View style={styles.progressLineBg} />
          <View style={styles.progressLineActive} />

          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.activeStep]}>
                <Text style={styles.activeStepText}>1</Text>
              </View>
              <Text style={styles.activeStepLabel}>Identity</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepCircleInactive}>
                <Text style={styles.inactiveStepText}>2</Text>
              </View>
              <Text style={styles.inactiveStepLabel}>Journey</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepCircleInactive}>
                <Text style={styles.inactiveStepText}>3</Text>
              </View>
              <Text style={styles.inactiveStepLabel}>Review</Text>
            </View>
          </View>
        </View>

        <View style={styles.headingContainer}>
          <Text style={styles.mainHeading}>Personal Details</Text>
          <Text style={styles.subHeading}>Please provide your authentic details for temple verification.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput placeholder="As per Aadhaar" placeholderTextColor="#999" style={styles.input} />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput placeholder="+91 00000 00000" placeholderTextColor="#999" keyboardType="phone-pad" style={styles.input} />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                WhatsApp Number <Text style={{ color: COLORS.primary }}>*</Text>
              </Text>
              <TextInput placeholder="+91 00000 00000" placeholderTextColor="#999" keyboardType="phone-pad" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput placeholder="DD/MM/YYYY" placeholderTextColor="#999" style={styles.input} />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.genderButton, gender === item && styles.genderButtonActive]}
                    onPress={() => setGender(item)}
                  >
                    <Text style={[styles.genderText, gender === item && styles.genderTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Permanent Address</Text>
            <TextInput
              placeholder="Street, City, State, Pincode"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.uploadRow}>
            <TouchableOpacity style={styles.uploadCard}>
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>◫</Text>
              </View>
              <Text style={styles.uploadTitle}>Upload Aadhaar</Text>
              <Text style={styles.uploadSub}>PDF, JPG or PNG (Max 5MB)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard}>
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>◉</Text>
              </View>
              <Text style={styles.uploadTitle}>Take a Selfie</Text>
              <Text style={styles.uploadSub}>Clear face photo for entry</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('JourneyDashboard')}>
            <Text style={styles.continueText}>Continue to Travel Info</Text>
            <Text style={styles.continueArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TravelRegistrationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 12,
  },
  profileImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  notification: {
    fontSize: 20,
  },
  progressWrapper: {
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  progressLineBg: {
    height: 3,
    backgroundColor: '#ddd',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
  },
  progressLineActive: {
    height: 3,
    width: '33%',
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 20,
    left: 0,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  activeStepText: {
    color: '#fff',
    fontWeight: '700',
  },
  stepCircleInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveStepText: {
    color: '#666',
    fontWeight: '700',
  },
  activeStepLabel: {
    marginTop: 8,
    color: COLORS.primary,
    fontWeight: '700',
  },
  inactiveStepLabel: {
    marginTop: 8,
    color: '#777',
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 15,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 26,
  },
  inputGroup: {},
  label: {
    marginBottom: 10,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 90,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  genderButton: {
    backgroundColor: COLORS.chipInactive,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  genderButtonActive: {
    backgroundColor: COLORS.chip,
  },
  genderText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadCard: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIconText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  uploadTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.saffron,
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  continueArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -1,
  },
})
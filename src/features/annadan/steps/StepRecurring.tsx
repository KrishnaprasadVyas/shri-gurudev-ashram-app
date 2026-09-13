import React, { useEffect, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSevaStore } from '../../../store/useSevaStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateDisplay(iso: string): string {
  if (!iso) return '—'
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return iso
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function calculateEndDate(startIso: string, years: number): string {
  if (!startIso) return ''
  const parts = startIso.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return ''
  const endDate = new Date(parts[0] + years, parts[1] - 1, parts[2])
  const y = endDate.getFullYear()
  const m = String(endDate.getMonth() + 1).padStart(2, '0')
  const d = String(endDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DURATION_OPTIONS = [
  { label: '1 Year', value: 1 },
  { label: '2 Years', value: 2 },
  { label: '3 Years', value: 3 },
  { label: '5 Years', value: 5 },
  { label: 'Custom', value: 'custom' },
]

// ─── Props ────────────────────────────────────────────────────────────────────
type StepRecurringProps = {
  onNext: () => void
  onBack: () => void
}

export default function StepRecurring({ onNext, onBack: _onBack }: StepRecurringProps) {
  const selectedDate = useSevaStore((s) => s.selectedDate)
  const isRecurring = useSevaStore((s) => s.isRecurring)
  const setIsRecurring = useSevaStore((s) => s.setIsRecurring)
  const setRecurringDates = useSevaStore((s) => s.setRecurringDates)

  const [durationOption, setDurationOption] = useState<number | 'custom'>(1)
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  let endDate = ''
  if (isRecurring) {
    if (durationOption === 'custom') {
      if (customDate) endDate = toIso(customDate)
    } else {
      endDate = calculateEndDate(selectedDate, durationOption as number)
    }
  }

  useEffect(() => {
    if (isRecurring && selectedDate && endDate) {
      setRecurringDates(selectedDate, endDate)
    } else if (!isRecurring) {
      setRecurringDates('', '')
    }
  }, [isRecurring, selectedDate, endDate, setRecurringDates])

  const handleToggle = () => {
    setIsRecurring(!isRecurring)
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }
    if (date) {
      setCustomDate(date)
    }
  }

  const isValid = !isRecurring || (isRecurring && endDate && new Date(endDate) > new Date(selectedDate))

  return (
    <View style={styles.container}>
      {/* Date Confirmation */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.dateBanner}>
        <MaterialIcons name="event" size={18} color="#8B5A00" />
        <Text style={styles.dateBannerText}>
          Annadan on <Text style={styles.dateBannerDate}>{formatDateDisplay(selectedDate)}</Text>
        </Text>
      </Animated.View>

      {/* Book for Year Selectable Card */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <Pressable
          onPress={handleToggle}
          style={[
            styles.card,
            isRecurring ? styles.cardSelected : null
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, isRecurring ? styles.iconWrapActive : null]}>
              <MaterialIcons name="event-note" size={22} color={isRecurring ? '#fff' : '#8B5A00'} />
            </View>
            <Text style={styles.toggleTitle}>Book for the Entire Year</Text>
          </View>

          <Text style={styles.toggleDescription}>
            {"Reserve this Annadan date for the next 12 months. Once confirmed, this date will remain reserved for you throughout the booking period, so you won't need to book it again every month."}
          </Text>

          <View style={styles.checkboxDivider} />

          <View style={styles.checkboxRow}>
            <MaterialIcons
              name={isRecurring ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={isRecurring ? '#B97512' : '#9E9080'}
            />
            <Text style={[styles.checkboxLabel, isRecurring ? styles.checkboxLabelActive : null]}>
              Enable Full-Year Booking
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Booking Period Preview */}
      {isRecurring ? (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.periodBox}>
          <Text style={styles.durationTitle}>How long would you like to continue this booking?</Text>
          <View style={styles.durationOptionsGrid}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={[styles.durationChip, durationOption === opt.value && styles.durationChipActive]}
                onPress={() => setDurationOption(opt.value)}
              >
                <Text style={[styles.durationChipText, durationOption === opt.value && styles.durationChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {durationOption === 'custom' && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.customDateContainer}>
              <Text style={styles.customDateLabel}>Select Booking End Date</Text>
              
              {Platform.OS === 'ios' ? (
                <View style={styles.iosPickerWrap}>
                  <DateTimePicker
                    value={customDate || new Date(calculateEndDate(selectedDate, 1))}
                    mode="date"
                    display="default"
                    minimumDate={new Date(new Date(selectedDate).getTime() + 86400000)}
                    onChange={handleDateChange}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.customDateInput} onPress={() => setShowPicker(true)}>
                    <Text style={[styles.customDateText, !customDate && styles.customDatePlaceholder]}>
                      {customDate ? formatDateDisplay(toIso(customDate)) : 'Tap to select exact end date'}
                    </Text>
                    <MaterialIcons name="calendar-today" size={18} color="#8B5A00" />
                  </TouchableOpacity>
                  {showPicker && (
                    <DateTimePicker
                      value={customDate || new Date(calculateEndDate(selectedDate, 1))}
                      mode="date"
                      display="default"
                      minimumDate={new Date(new Date(selectedDate).getTime() + 86400000)}
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </Animated.View>
          )}

          <View style={styles.periodDivider} />

          <View style={styles.periodRow}>
            <MaterialIcons name="date-range" size={16} color="#8B5A00" />
            <Text style={styles.periodLabel}>Booking Start Date</Text>
          </View>
          <Text style={styles.periodValue}>{formatDateDisplay(selectedDate)}</Text>

          <View style={styles.periodDividerLight} />

          <View style={styles.periodRow}>
            <MaterialIcons name="date-range" size={16} color="#8B5A00" />
            <Text style={styles.periodLabel}>Booking End Date</Text>
          </View>
          <Text style={styles.periodValue}>{endDate ? formatDateDisplay(endDate) : '—'}</Text>

          <View style={styles.periodNote}>
            <MaterialIcons name="info-outline" size={14} color="#9E9080" />
            <Text style={styles.periodNoteText}>
              This Annadan date will remain reserved for you throughout the booking period.
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* CTA */}
      <Pressable disabled={!isValid} onPress={onNext}>
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
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { gap: 16 },

  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0D9', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#EDD9B8',
  },
  dateBannerText: { color: '#7E7162', fontSize: 14, fontWeight: '600', flex: 1 },
  dateBannerDate: { color: '#8B5A00', fontWeight: '900' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 16,
  },
  cardSelected: {
    borderColor: '#B97512',
    backgroundColor: '#FFFBF0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF0D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#B97512',
  },
  toggleTitle: { color: '#2B231B', fontSize: 16, fontWeight: '800', flex: 1 },
  toggleDescription: { color: '#7E7162', fontSize: 13, lineHeight: 20 },
  checkboxDivider: {
    height: 1,
    backgroundColor: '#F0E7DD',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    color: '#7E7162',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabelActive: {
    color: '#B97512',
  },

  periodBox: {
    backgroundColor: '#FAF6F0', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 10,
  },
  durationTitle: { color: '#2B231B', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  durationOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E8D5BE',
  },
  durationChipActive: { backgroundColor: '#8B5A00', borderColor: '#8B5A00' },
  durationChipText: { color: '#7E7162', fontSize: 13, fontWeight: '700' },
  durationChipTextActive: { color: '#fff', fontWeight: '900' },

  customDateContainer: { marginTop: 6, gap: 6 },
  customDateLabel: { color: '#5A4A42', fontSize: 13, fontWeight: '700' },
  customDateInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#E8D5BE',
  },
  customDateText: { color: '#2B231B', fontSize: 15, fontWeight: '700' },
  customDatePlaceholder: { color: '#9E9080', fontWeight: '600' },
  iosPickerWrap: {
    backgroundColor: '#fff', borderRadius: 14, padding: 8,
    borderWidth: 1.5, borderColor: '#E8D5BE', alignItems: 'flex-start'
  },

  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodLabel: { color: '#9E9080', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  periodValue: { color: '#2B231B', fontSize: 15, fontWeight: '800', marginLeft: 22 },
  periodDivider: { height: 2, backgroundColor: '#E8D5BE', marginVertical: 8 },
  periodDividerLight: { height: 1, backgroundColor: '#F0E7DD', marginVertical: 4 },
  periodNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 4,
  },
  periodNoteText: { color: '#9E9080', fontSize: 12, lineHeight: 18, flex: 1 },

  ctaButton: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
})

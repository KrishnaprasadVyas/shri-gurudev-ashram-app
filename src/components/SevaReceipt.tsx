import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import type { SevaReceiptData } from '../types/seva'
import { SEVA_LABELS } from '../constants/seva'

// ─── Ashram Contact Info ──────────────────────────────────────────────────────
const ASHRAM_INFO = {
  name: 'Shri Gurudev Ashram',
  address: 'Haridwar Road, Rishikesh, Uttarakhand — 249201',
  contact: '+91 98765 43210',
  email: 'seva@shrigurudevashram.org',
}

// ─── Props ────────────────────────────────────────────────────────────────────
type SevaReceiptProps = {
  data: SevaReceiptData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return iso }
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

function statusColor(status: SevaReceiptData['status']): string {
  switch (status) {
    case 'paid': return '#2F7132'
    case 'cancelled': return '#C04545'
    default: return '#B97512'
  }
}

function statusLabel(status: SevaReceiptData['status']): string {
  switch (status) {
    case 'paid': return 'PAID'
    case 'cancelled': return 'CANCELLED'
    default: return 'PENDING'
  }
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  )
}

// ─── QR Verification Grid ─────────────────────────────────────────────────────
function ReceiptQRVerification({ receiptNo, trxId, type, amount }: { receiptNo: string; trxId?: string; type: string; amount: number }) {
  const codeString = `${receiptNo}|${trxId || 'N/A'}|${type}|${amount}`
  return (
    <View style={styles.qrSection}>
      <View style={styles.qrBox}>
        {Array.from({ length: 7 }).map((_, row) => (
          <View key={row} style={styles.qrRow}>
            {Array.from({ length: 7 }).map((_, col) => {
              const isFinder =
                (row <= 2 && col <= 2) ||
                (row <= 2 && col >= 4) ||
                (row >= 4 && col <= 2)
              const charCode = codeString.charCodeAt((row * 7 + col) % codeString.length) || 1
              const filled = isFinder || (charCode % 2 === 0)

              return (
                <View
                  key={col}
                  style={[styles.qrCell, filled && styles.qrCellFilled]}
                />
              )
            })}
          </View>
        ))}
      </View>
      <View style={styles.qrTextWrap}>
        <Text style={styles.qrTitle}>Ashram Volunteer Verification</Text>
        <Text style={styles.qrSubtitle}>Scan QR code at the reception for sankalp check-in.</Text>
        <Text style={styles.qrDataString}>REF: {receiptNo}</Text>
      </View>
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SevaReceipt({ data }: SevaReceiptProps) {
  const label = SEVA_LABELS[data.sevaType]
  const color = statusColor(data.status)

  return (
    <View style={styles.container}>
      {/* ── ASHRAM HEADER ── */}
      <LinearGradient
        colors={['#7B4B00', '#B97512', '#E0A31F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.ashramHeader}
      >
        {/* Logo placeholder */}
        <View style={styles.logoCircle}>
          <MaterialIcons name="brightness-5" size={28} color="#B97512" />
        </View>
        <View style={styles.ashramText}>
          <Text style={styles.ashramName}>{ASHRAM_INFO.name}</Text>
          <Text style={styles.ashramTagline}>सेवा परमो धर्मः</Text>
        </View>
      </LinearGradient>

      {/* ── SEVA TYPE STRIP ── */}
      <View style={styles.sevaStrip}>
        <View style={[styles.sevaIconWrap, { backgroundColor: `${label.color}18` }]}>
          <MaterialIcons name={label.icon as any} size={22} color={label.color} />
        </View>
        <View style={styles.sevaStripText}>
          <Text style={styles.sevaStripLabel}>OFFICIAL RECEIPT</Text>
          <Text style={styles.sevaStripTitle}>{label.title} · {label.subtitle}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.statusText, { color }]}>{statusLabel(data.status)}</Text>
        </View>
      </View>

      {/* ── DASHED CUT LINE ── */}
      <View style={styles.cutRow}>
        <View style={styles.cutLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.cutRight} />
      </View>

      {/* ── BODY ROWS ── */}
      <View style={styles.body}>
        <ReceiptRow label="Receipt No." value={data.receiptNumber} />
        {data.transactionId ? <ReceiptRow label="Transaction ID" value={data.transactionId} /> : null}
        <ReceiptRow label="Transaction Date" value={formatDate(data.transactionDate)} />
        <ReceiptRow label="Seva Date" value={formatDate(data.sevaDate)} highlight />

        <View style={styles.divider} />

        <ReceiptRow label="Devotee Name" value={data.devotee} />
        <ReceiptRow label="Mobile Number" value={data.phone} />

        <View style={styles.divider} />

        <ReceiptRow label="Donation Amount" value={formatAmount(data.amount)} highlight />
        <ReceiptRow label="Payment Method" value={data.paymentMethod} />
        <ReceiptRow label="Reference No." value={data.referenceNumber} />

        <View style={styles.divider} />

        {/* ── VOLUNTEER SCAN QR ── */}
        <ReceiptQRVerification
          receiptNo={data.receiptNumber}
          trxId={data.transactionId}
          type={data.sevaType}
          amount={data.amount}
        />
      </View>

      {/* ── SECOND CUT LINE ── */}
      <View style={styles.cutRow}>
        <View style={styles.cutLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.cutRight} />
      </View>

      {/* ── ASHRAM FOOTER ── */}
      <View style={styles.ashramFooter}>
        <View style={styles.ashramFooterRow}>
          <MaterialIcons name="location-on" size={13} color="#9E9080" />
          <Text style={styles.ashramFooterText}>{ASHRAM_INFO.address}</Text>
        </View>
        <View style={styles.ashramFooterRow}>
          <MaterialIcons name="phone" size={13} color="#9E9080" />
          <Text style={styles.ashramFooterText}>{ASHRAM_INFO.contact}</Text>
          <Text style={styles.ashramFooterSep}>·</Text>
          <MaterialIcons name="email" size={13} color="#9E9080" />
          <Text style={styles.ashramFooterText}>{ASHRAM_INFO.email}</Text>
        </View>
        <View style={styles.thankYouRow}>
          <MaterialIcons name="favorite" size={14} color="#B97512" />
          <Text style={styles.thankYouText}>
            Your seva is a blessing to all who visit the Ashram. Jai Shri Gurudev!
          </Text>
          <MaterialIcons name="favorite" size={14} color="#B97512" />
        </View>
        <Text style={styles.legalText}>
          This is a computer-generated receipt and is valid without a physical signature.
        </Text>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E7DD',
    shadowColor: '#5B4636',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  // Ashram header
  ashramHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ashramText: { flex: 1 },
  ashramName: { color: '#fff', fontSize: 15, fontWeight: '900', lineHeight: 19 },
  ashramTagline: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '600', marginTop: 2 },

  // Seva strip
  sevaStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 12,
    backgroundColor: '#FAF6F0',
  },
  sevaIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sevaStripText: { flex: 1 },
  sevaStripLabel: { color: '#9E9080', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  sevaStripTitle: { color: '#2B231B', fontSize: 13, fontWeight: '800', marginTop: 1 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },

  // Cut line
  cutRow: { flexDirection: 'row', alignItems: 'center' },
  cutLeft: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FAF6F0', marginLeft: -8 },
  dashedLine: {
    flex: 1, height: 1, borderWidth: 1, borderColor: '#E8D5BE',
    borderStyle: 'dashed', marginHorizontal: 4,
  },
  cutRight: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FAF6F0', marginRight: -8 },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowLabel: { color: '#9E9080', fontSize: 12, fontWeight: '600', flex: 1 },
  rowValue: { color: '#2B231B', fontSize: 13, fontWeight: '700', textAlign: 'right', flex: 1 },
  rowValueHighlight: { color: '#8B5A00', fontSize: 15, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#F5EDE4', marginVertical: 2 },

  // Volunteer verification QR
  qrSection: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, backgroundColor: '#FFFDF9', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F0E7DD' },
  qrBox: { padding: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E8D5BE', alignItems: 'center' },
  qrRow: { flexDirection: 'row' },
  qrCell: { width: 6, height: 6, backgroundColor: 'transparent' },
  qrCellFilled: { backgroundColor: '#2B231B' },
  qrTextWrap: { flex: 1, gap: 2 },
  qrTitle: { color: '#8B5A00', fontSize: 13, fontWeight: '800' },
  qrSubtitle: { color: '#7E7162', fontSize: 11, lineHeight: 15 },
  qrDataString: { color: '#B9B1A9', fontSize: 10, fontWeight: '700', marginTop: 2 },

  // Ashram footer
  ashramFooter: {
    paddingHorizontal: 18, paddingVertical: 14,
    backgroundColor: '#FAF6F0', gap: 6,
  },
  ashramFooterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap',
  },
  ashramFooterText: { color: '#9E9080', fontSize: 11, fontWeight: '600' },
  ashramFooterSep: { color: '#C4BAB0', fontSize: 11 },
  thankYouRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0E7DD',
    marginVertical: 2,
  },
  thankYouText: {
    color: '#7E7162', fontSize: 12, fontWeight: '700',
    fontStyle: 'italic', textAlign: 'center', flex: 1,
  },
  legalText: {
    color: '#C4BAB0', fontSize: 10, textAlign: 'center', fontStyle: 'italic',
  },
})
